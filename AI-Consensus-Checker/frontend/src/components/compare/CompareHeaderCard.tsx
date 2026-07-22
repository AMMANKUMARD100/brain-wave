import { memo } from 'react';
import { motion } from 'framer-motion';

interface CompareHeaderCardProps {
  question: string;
  timestamp: string;
  modelsUsed: number;
  generationTime: string;
  totalProviders: number;
  successfulProviders: number;
  failedProviders: number;
}

function CompareHeaderCard({
  question,
  timestamp,
  modelsUsed,
  generationTime,
  totalProviders,
  successfulProviders,
  failedProviders,
}: CompareHeaderCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)]"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Original question</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{question}</h2>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] bg-slate-900/80 p-5">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span>Timestamp</span>
            <span>{timestamp}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span>Models used</span>
            <span>{modelsUsed}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span>Generation time</span>
            <span>{generationTime}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
            <span>Total providers</span>
            <span>{totalProviders}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-emerald-300">
            <span>Successful</span>
            <span>{successfulProviders}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-rose-300">
            <span>Failed</span>
            <span>{failedProviders}</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default memo(CompareHeaderCard);
