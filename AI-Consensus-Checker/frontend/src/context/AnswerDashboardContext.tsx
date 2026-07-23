import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuestionContext } from './QuestionContext';
import { getAnswerMetrics } from '../utils/answerMetrics';
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

function buildCardStateFromBackendResponse(responseItem: QuestionResponse['responses'][number], providerMeta: ProviderMeta): AnswerCardState {
  const answer = responseItem.answer || '';
  const answerMetrics = getAnswerMetrics(answer);
  const hasAnswer = answer.trim().length > 0;

  return {
    id: responseItem.id,
    providerName: providerMeta.name,
    modelName: responseItem.model || providerMeta.defaultModel,
    status: hasAnswer ? 'success' : 'error',
    answer,
    wordCount: answerMetrics.wordCount,
    charCount: answerMetrics.charCount,
    responseTime: answerMetrics.responseTime,
    estimatedCost: answerMetrics.estimatedCost,
    timestamp: new Date().toISOString(),
    errorReason: hasAnswer ? undefined : 'No answer returned from provider.',
    isExpanded: hasAnswer,
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
  const { question, fullResponse, loading, submitQuestion } = useQuestionContext();
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
    if (!loading && fullResponse) {
      activeTimeouts.current.forEach(clearTimeout);
      activeTimeouts.current = [];

      const failedProviders = fullResponse.responses.filter((item) => !item.answer || item.answer.trim().length === 0);
      if (failedProviders.length > 0) {
        toast.error(`${failedProviders.length} provider${failedProviders.length > 1 ? 's' : ''} failed to return a valid answer.`);
      }

      const nextStates = providerMetadata.map((provider) => {
        const providerResponse = fullResponse.responses.find((item) => item.id.startsWith(provider.idPrefix));
        if (!providerResponse) {
          return {
            ...buildZeroState().find((card) => card.id === provider.id)!,
            status: 'error' as const,
            answer: 'No response received from this provider.',
            errorReason: 'Missing provider response from the backend.',
            timestamp: new Date().toISOString(),
          };
        }
        return buildCardStateFromBackendResponse(providerResponse, provider);
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
  }, [loading, fullResponse]);

  const retryProvider = useCallback(async (providerId: string) => {
    setCards((current) =>
      current.map((card) =>
        card.id === providerId ? { ...card, status: 'loading', errorReason: undefined, isRetrying: true } : card,
      ),
    );

    if (!question) {
      return;
    }

    // Re-submit the entire question to get fresh responses for all providers
    // The backend will handle retries for individual providers
    const latestFullResponse = await submitQuestion(question);

    if (latestFullResponse) {
      const provider = providerMetadata.find((item) => item.id === providerId);
      if (!provider) {
        return;
      }

      const updatedResponseItem = latestFullResponse.responses.find((item) => item.id.startsWith(provider.idPrefix));

      if (updatedResponseItem) {
        const updatedCard = buildCardStateFromBackendResponse(updatedResponseItem, provider);
        setCards((current) => current.map((card) => (card.id === providerId ? { ...updatedCard, isRetrying: false } : card)));
      } else {
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
      }
    } else {
      // If the overall submission failed, reset the retrying state
      setCards((current) =>
        current.map((card) =>
          card.id === providerId
            ? { ...card, isRetrying: false, status: 'error', errorReason: 'Overall submission failed during retry.' }
            : card,
        ),
      );
    }
  }, [question, submitQuestion]);

  const toggleExpand = useCallback((providerId: string) => {
    setCards((current) =>
      current.map((card) => (card.id === providerId ? { ...card, isExpanded: !card.isExpanded } : card)),
    );
  }, []);

  const value = useMemo(
    () => ({ cards, isLoading: loading, retryProvider, toggleExpand }),
    [cards, loading, retryProvider, toggleExpand],
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
