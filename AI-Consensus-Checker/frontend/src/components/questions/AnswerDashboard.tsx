import { AnimatePresence, motion } from 'framer-motion';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionContext } from '../../context/QuestionContext';
import { useAnswerDashboardContext } from '../../context/AnswerDashboardContext';
import { createCompareSession, saveCompareSession } from '../../utils/sessionManager';
import type { CompareSessionProvider } from '../../types';
import AnswerCard from './AnswerCard';
import SkeletonAnswerCard from './SkeletonAnswerCard';

export default function AnswerDashboard() {
  const navigate = useNavigate();
  const { question } = useQuestionContext();
  const { cards, isLoading, retryProvider, toggleExpand } = useAnswerDashboardContext();

  const isCompareEnabled =
    Boolean(question) && cards.length > 0 && cards.every((card) => card.status !== 'loading');

  const handleCompare = useCallback(() => {
    if (!isCompareEnabled || !question) {
      return;
    }

    const providers: CompareSessionProvider[] = cards.map((card) => ({
      providerId: card.id,
      providerName: card.providerName,
      modelName: card.modelName,
      status: card.status === 'error' ? 'error' : 'success',
      responseTime: card.responseTime,
      answer: card.answer,
      timestamp: card.timestamp,
    }));

    saveCompareSession(createCompareSession(question, providers));
    navigate('/compare');
  }, [cards, isCompareEnabled, navigate, question]);

  if (!question && !isLoading) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.24)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/70">Answer Dashboard</p>
            <h2 className="text-3xl font-semibold text-white">Provider-by-provider AI results</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Results appear as each provider responds. Individual cards load independently to keep the dashboard responsive even while the slowest provider is still generating.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatePresence>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                >
                  <SkeletonAnswerCard />
                </motion.div>
              ))
            : cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.26, delay: index * 0.08 }}
                >
                  <AnswerCard card={card} onRetry={retryProvider} onToggleExpand={toggleExpand} />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
        <p className="text-sm leading-6 text-slate-400">
          Once every provider has finished successfully or with an error, you may save the session and continue to the compare view.
        </p>
        <button
          type="button"
          onClick={handleCompare}
          disabled={!isCompareEnabled}
          className="mx-auto inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-8 py-3 text-base font-semibold text-slate-950 transition duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Compare Answers
        </button>
      </div>
    </section>
  );
}
