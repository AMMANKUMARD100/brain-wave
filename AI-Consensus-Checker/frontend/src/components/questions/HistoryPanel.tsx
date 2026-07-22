import { motion } from 'framer-motion';
import { Search, Trash2, ArrowUpRight, Trash } from 'lucide-react';
import { useHistoryContext } from '../../context/HistoryContext';

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
  onReuseQuestion: (question: string) => void;
}

export default function HistoryPanel({ visible, onClose, onReuseQuestion }: HistoryPanelProps) {
  const { filteredEntries, searchTerm, setSearchTerm, deleteEntry, clearAll } = useHistoryContext();

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: visible ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl md:w-[420px]"
      aria-labelledby="history-panel-title"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/70">History</p>
          <h2 id="history-panel-title" className="text-2xl font-semibold text-white">
            Recent questions
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-slate-900/80 p-3 text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label="Close history panel"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search questions or models"
            className="w-full rounded-3xl border border-white/10 bg-slate-900/80 py-3 pl-12 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <p>{filteredEntries.length} recent questions</p>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/15 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <Trash size={16} />
            Delete all
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 max-h-[65vh]">
          {filteredEntries.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/80 p-6 text-sm text-slate-400">
              No history entries match your search.
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{entry.question}</p>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                      {new Date(entry.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="rounded-full border border-white/10 bg-slate-950/70 p-2 text-slate-400 transition hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    aria-label={`Delete history entry for ${entry.question}`}
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-950/80 p-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Responses</p>
                    <p className="mt-1 text-white">{entry.responseCount}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-950/80 p-3">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Avg response</p>
                    <p className="mt-1 text-white">{entry.averageResponseTime} ms</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-950/70 px-3 py-1">Consensus {entry.consensusAvailable ? '✅' : '⚠️'}</span>
                  {entry.modelsUsed.slice(0, 3).map((model) => (
                    <span key={model} className="rounded-full bg-slate-950/70 px-3 py-1">
                      {model}
                    </span>
                  ))}
                  {entry.modelsUsed.length > 3 ? <span className="rounded-full bg-slate-950/70 px-3 py-1">+{entry.modelsUsed.length - 3}</span> : null}
                </div>

                <button
                  type="button"
                  onClick={() => onReuseQuestion(entry.question)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <ArrowUpRight size={16} />
                  Reuse question
                </button>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </motion.aside>
  );
}
