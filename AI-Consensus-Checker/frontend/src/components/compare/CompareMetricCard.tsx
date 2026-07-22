import { memo } from 'react';
import { motion } from 'framer-motion';

interface CompareMetricCardProps {
  title: string;
  value: string;
  label: string;
  accent: string;
}

function CompareMetricCard({ title, value, label, accent }: CompareMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
      role="group"
      aria-label={`${title} metric`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className={`rounded-3xl px-3 py-1 text-sm font-semibold text-white ${accent}`}>{label}</div>
      </div>
    </motion.div>
  );
}

export default memo(CompareMetricCard);
