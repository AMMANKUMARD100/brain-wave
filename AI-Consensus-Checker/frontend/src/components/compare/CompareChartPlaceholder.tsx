import { motion } from 'framer-motion';

interface CompareChartPlaceholderProps {
  label: string;
}

export default function CompareChartPlaceholder({ label }: CompareChartPlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-center text-slate-500"
    >
      <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <div className="mt-8 h-40 rounded-[1.5rem] bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-6 text-center text-slate-500">
        <p className="mt-10 text-sm">Chart placeholder</p>
        <p className="mt-3 text-xs text-slate-400">Charts are intentionally omitted from this layout.</p>
      </div>
    </motion.div>
  );
}
