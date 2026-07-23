import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 shadow-2xl shadow-slate-950/50 backdrop-blur"
      role="status"
      aria-live="polite"
      aria-label="Waiting for AI response"
    >
      <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
      <span className="text-sm text-slate-200">Waiting for response...</span>
    </motion.div>
  );
}
