import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuestionContext } from './QuestionContext';
import { submitQuestionRequest } from '../services/api';
import type { QuestionResponse } from '../types';

export type ProviderCardStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AnswerCardState {
  id: string;
  providerName: string;
  modelName: string;
  status: ProviderCardStatus;
  answer: string;
  wordCount: number;
  charCount: number;
  responseTime: number;
  estimatedCost: number;
  timestamp: string;
  errorReason?: string;
  isExpanded: boolean;
  isRetrying: boolean;
}

interface ProviderMeta {
  id: string;
  name: string;
  idPrefix: string;
  defaultModel: string;
}

const providerMetadata: ProviderMeta[] = [
  { id: 'google-gemini', name: 'Google Gemini', idPrefix: 'google-gemini', defaultModel: 'Gemini Pro' },
  { id: 'groq', name: 'Groq', idPrefix: 'groq', defaultModel: 'Groq S2' },
  { id: 'openrouter', name: 'OpenRouter', idPrefix: 'openrouter', defaultModel: 'OpenRouter Base' },
  { id: 'cerebras', name: 'Cerebras', idPrefix: 'cerebras', defaultModel: 'Cerebras-GPT' },
  { id: 'together-ai', name: 'Together AI', idPrefix: 'together-ai', defaultModel: 'Together AI One' },
];

function buildZeroState(): AnswerCardState[] {
  return providerMetadata.map((provider) => ({
    id: provider.id,
    providerName: provider.name,
    modelName: provider.defaultModel,
    status: 'loading',
    answer: '',
    wordCount: 0,
    charCount: 0,
    responseTime: 0,
    estimatedCost: 0,
    timestamp: '',
    isExpanded: false,
    isRetrying: false,
  }));
}

function getStatistics(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = answer.length;
  const responseTime = Math.min(9500, Math.max(280, Math.round(wordCount * 18 + Math.random() * 150)));
  const estimatedCost = Number((wordCount * 0.0001 + Math.random() * 0.00008).toFixed(5));

  return { wordCount, charCount, responseTime, estimatedCost };
}

function isErrorAnswer(answer: string) {
  return /unable|no answer|missing|failed|error/i.test(answer.trim());
}

function buildCardState(response: QuestionResponse['responses'][number], providerMeta: ProviderMeta): AnswerCardState {
  const answer = response.answer || '';
  const errorDetected = isErrorAnswer(answer);
  const stats = getStatistics(answer);

  return {
    id: providerMeta.id,
    providerName: providerMeta.name,
    modelName: response.model || providerMeta.defaultModel,
    status: errorDetected ? 'error' : 'success',
    answer: errorDetected ? answer : answer,
    wordCount: stats.wordCount,
    charCount: stats.charCount,
    responseTime: stats.responseTime,
    estimatedCost: stats.estimatedCost,
    timestamp: new Date().toISOString(),
    errorReason: errorDetected ? answer || 'Unknown provider error.' : undefined,
    isExpanded: !errorDetected,
    isRetrying: false,
  };
}

interface AnswerDashboardContextValue {
  cards: AnswerCardState[];
  isLoading: boolean;
  retryProvider: (providerId: string) => Promise<void>;
  toggleExpand: (providerId: string) => void;
}

const AnswerDashboardContext = createContext<AnswerDashboardContextValue | undefined>(undefined);

export function AnswerDashboardProvider({ children }: { children: React.ReactNode }) {
  const { question, responses, loading } = useQuestionContext();
  const [cards, setCards] = useState<AnswerCardState[]>(buildZeroState());
  const activeTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (loading && question) {
      activeTimeouts.current.forEach(clearTimeout);
      activeTimeouts.current = [];
      setCards(buildZeroState());
    }
  }, [loading, question]);

  useEffect(() => {
    if (!loading && responses.length > 0) {
      activeTimeouts.current.forEach(clearTimeout);
      activeTimeouts.current = [];

      const failedProviders = responses.filter((item) => isErrorAnswer(item.answer));
      if (failedProviders.length > 0) {
        toast.error(`${failedProviders.length} provider${failedProviders.length > 1 ? 's' : ''} failed to return a valid answer.`);
      }

      const nextStates = providerMetadata.map((provider) => {
        const providerResponse = responses.find((item) => item.id.startsWith(provider.idPrefix));
        if (!providerResponse) {
          return {
            ...buildZeroState().find((card) => card.id === provider.id)!,
            status: 'error' as const,
            answer: 'No response received from this provider.',
            errorReason: 'Missing provider response from the backend.',
            timestamp: new Date().toISOString(),
          };
        }
        return buildCardState(providerResponse, provider);
      });

      nextStates.forEach((card, index) => {
        const timeout = setTimeout(() => {
          setCards((current) => current.map((currentCard) => (currentCard.id === card.id ? card : currentCard)));
        }, index * 120);
        activeTimeouts.current.push(timeout);
      });
    }

    return () => {
      activeTimeouts.current.forEach(clearTimeout);
      activeTimeouts.current = [];
    };
  }, [loading, responses]);

  const retryProvider = useCallback(async (providerId: string) => {
    setCards((current) =>
      current.map((card) =>
        card.id === providerId ? { ...card, status: 'loading', errorReason: undefined, isRetrying: true } : card,
      ),
    );

    if (!question) {
      return;
    }

    const latestResponse = await submitQuestionRequest(question);
    const provider = providerMetadata.find((item) => item.id === providerId);
    if (!provider) {
      return;
    }

    const updatedResponse = latestResponse.responses.find((item) => item.id.startsWith(provider.idPrefix));
    if (!updatedResponse) {
      setCards((current) =>
        current.map((card) =>
          card.id === providerId
            ? {
                ...card,
                status: 'error',
                errorReason: 'Provider response was not returned during retry.',
                answer: 'Provider retry failed. Please try again later.',
                isRetrying: false,
              }
            : card,
        ),
      );
      return;
    }

    const updatedCard = buildCardState(updatedResponse, provider);
    setCards((current) => current.map((card) => (card.id === providerId ? updatedCard : card)));
  }, [question]);

  const toggleExpand = useCallback((providerId: string) => {
    setCards((current) =>
      current.map((card) => (card.id === providerId ? { ...card, isExpanded: !card.isExpanded } : card)),
    );
  }, []);

  const value = useMemo(
    () => ({ cards, isLoading: loading, retryProvider, toggleExpand }),
    [cards, loading],
  );

  return <AnswerDashboardContext.Provider value={value}>{children}</AnswerDashboardContext.Provider>;
}

export function useAnswerDashboardContext() {
  const context = useContext(AnswerDashboardContext);
  if (!context) {
    throw new Error('useAnswerDashboardContext must be used inside AnswerDashboardProvider');
  }
  return context;
}
