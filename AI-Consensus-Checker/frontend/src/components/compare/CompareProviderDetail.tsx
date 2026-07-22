import { memo } from 'react';
import { motion } from 'framer-motion';

interface CompareProviderDetailProps {
  providerName: string;
  modelName: string;
  status: string;
  responseTime: number;
  answer: string;
}

function CompareProviderDetail({ providerName, modelName, status, responseTime, answer }: CompareProviderDetailProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="rounded-[1.75rem] border border-white/10 bg-slate-900/75 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{providerName}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{modelName}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
          {status}
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-400">{answer}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
        <span className="rounded-full bg-white/5 px-3 py-1">Response time: {responseTime} ms</span>
      </div>
    </motion.article>
  );
}

export default memo(CompareProviderDetail);
