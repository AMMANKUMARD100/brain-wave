import { memo } from 'react';
import { motion } from 'framer-motion';

interface CompareTopNavigationProps {
  title: string;
  subtitle: string;
}

function CompareTopNavigation({ title, subtitle }: CompareTopNavigationProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)]"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">{title}</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">{subtitle}</h1>
        </div>
      </div>
      <p className="max-w-3xl text-sm text-slate-400">Build an executive AI consensus view with answer-level insights, provider health, and cluster analytics.</p>
    </motion.header>
  );
}

export default memo(CompareTopNavigation);
