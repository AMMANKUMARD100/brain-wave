import { createContext, useContext, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { submitQuestionRequest } from '../services/api';
import type { QuestionResponse } from '../types';

interface QuestionContextValue {
  question: string;
  loading: boolean;
  responses: QuestionResponse['responses'];
  submitQuestion: (question: string) => Promise<QuestionResponse | undefined>;
  isSubmitting: boolean;
}

const QuestionContext = createContext<QuestionContextValue | undefined>(undefined);

export function QuestionProvider({ children }: { children: React.ReactNode }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<QuestionResponse['responses']>([]);

  const submitQuestion = async (nextQuestion: string): Promise<QuestionResponse | undefined> => {
    if (!nextQuestion.trim()) {
      toast.error('Please enter a question before submitting.');
      return undefined;
    }

    setLoading(true);
    try {
      const response = await submitQuestionRequest(nextQuestion);
      setQuestion(nextQuestion);
      setResponses(response.responses);
      toast.success('Question submitted successfully.');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while submitting question.';
      toast.error(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ question, loading, responses, submitQuestion, isSubmitting: loading }),
    [question, loading, responses],
  );

  return <QuestionContext.Provider value={value}>{children}</QuestionContext.Provider>;
}

export function useQuestionContext() {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestionContext must be used inside QuestionProvider');
  }
  return context;
}
