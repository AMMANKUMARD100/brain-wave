import { motion } from 'framer-motion';

interface CompareStatCardProps {
  title: string;
  value: string;
  description: string;
}

export default function CompareStatCard({ title, value, description }: CompareStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-cyan-400/30"
      role="region"
      aria-label={title}
    >
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm text-slate-400">{description}</p>
    </motion.div>
  );
}
