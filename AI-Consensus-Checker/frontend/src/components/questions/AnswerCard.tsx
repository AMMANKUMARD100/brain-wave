import { Copy, Download, Repeat2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import ProviderLogo from './providerLogo';
import MarkdownRenderer from './MarkdownRenderer';
import type { AnswerCardState } from '../../context/AnswerDashboardContext';

interface AnswerCardProps {
  card: AnswerCardState;
  onRetry: (providerId: string) => void;
  onToggleExpand: (providerId: string) => void;
}

const clampText = (text: string, maxWords = 300) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return { displayText: text, truncated: false };
  }

  return {
    displayText: words.slice(0, maxWords).join(' ') + '...',
    truncated: true,
  };
};

function AnswerCard({ card, onRetry, onToggleExpand }: AnswerCardProps) {
  const content = useMemo(() => clampText(card.answer, 300), [card.answer]);
  const shouldShowReadMore = useMemo(() => card.answer.trim().split(/\s+/).length > 300, [card.answer]);
  const displayedAnswer = card.status === 'success' ? (card.isExpanded ? card.answer : content.displayText) : card.answer;

  const statusLabel = card.status === 'loading' ? 'Generating' : card.status === 'error' ? 'Error' : 'Completed';

  const downloadAnswer = () => {
    const element = document.createElement('a');
    const blob = new Blob([card.answer], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(blob);
    element.download = `${card.providerName.replace(/\s+/g, '_')}_${new Date(card.timestamp).toISOString()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`${card.providerName} answer downloaded.`);
  };

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(card.answer);
      toast.success('Answer copied to clipboard.');
    } catch {
      toast.error('Unable to copy answer.');
    }
  };

  return (
    <article
      aria-live="polite"
      role="status"
      className="group rounded-[2rem] border border-white/8 bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-transparent p-6 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_40px_120px_rgba(2,6,23,0.6)]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <ProviderLogo providerId={card.id} />
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Provider</p>
            <h2 className="text-xl font-semibold text-white">{card.providerName}</h2>
            <p className="text-sm text-slate-400">Model: {card.modelName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ring-1 ring-white/6 ${
              card.status === 'error'
                ? 'text-rose-300 bg-gradient-to-r from-rose-700/20 to-rose-600/10'
                : card.status === 'loading'
                ? 'text-slate-200 bg-gradient-to-r from-slate-700/20 to-slate-600/10'
                : 'text-emerald-200 bg-gradient-to-r from-emerald-700/20 to-emerald-600/10'
            }`}
          >
            {statusLabel}
          </span>
          <span className="text-slate-400">{card.responseTime} ms</span>
          <span className="text-slate-400">${card.estimatedCost.toFixed(5)}</span>
          <span className="text-slate-400">{card.wordCount} words</span>
          <span className="text-slate-400">{card.charCount} chars</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="rounded-[1.75rem] border border-white/6 bg-gradient-to-br from-slate-800/50 to-slate-900/30 p-5 text-sm leading-7 text-slate-200 shadow-lg backdrop-blur-sm">
          {card.status === 'loading' ? (
            <div className="space-y-3">
              <div className="h-4 rounded-full bg-slate-800" />
              <div className="h-4 rounded-full bg-slate-800" />
              <div className="h-4 rounded-full bg-slate-800" />
              <div className="h-4 rounded-full bg-slate-800" />
            </div>
          ) : card.status === 'error' ? (
            <div className="space-y-4">
              <p className="text-sm text-rose-300">{card.errorReason || 'Failed to generate response.'}</p>
              <button
                type="button"
                onClick={() => onRetry(card.id)}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-transform duration-150 hover:scale-[1.02] hover:bg-rose-600/15 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <Repeat2 size={16} />
                Retry Provider
              </button>
            </div>
          ) : (
            <>
              <MarkdownRenderer content={displayedAnswer} />
              {shouldShowReadMore ? (
                <button
                  type="button"
                  onClick={() => onToggleExpand(card.id)}
                  className="mt-3 text-sm font-semibold text-cyan-300 transition hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  aria-expanded={card.isExpanded}
                >
                  {card.isExpanded ? 'Read Less' : 'Read More'}
                </button>
              ) : null}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-400">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-slate-500">
              <span>Generated</span>
              <span>Timestamp</span>
            </div>
            <p className="text-sm text-slate-200">{new Date(card.timestamp).toLocaleString()}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyAnswer}
              disabled={card.status !== 'success'}
              aria-label={`Copy answer text for ${card.providerName}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800/80 px-4 py-3 font-medium text-slate-200 transition-transform duration-150 hover:scale-[1.02] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy size={16} />
              Copy
            </button>
            <button
              type="button"
              onClick={downloadAnswer}
              disabled={card.status !== 'success'}
              aria-label={`Download answer text for ${card.providerName}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-cyan-400/8 px-4 py-3 font-medium text-cyan-200 transition-transform duration-150 hover:scale-[1.02] hover:from-cyan-500/20 hover:to-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Download TXT
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(AnswerCard);
