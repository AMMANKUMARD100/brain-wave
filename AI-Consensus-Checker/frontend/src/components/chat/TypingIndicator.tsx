import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-3 rounded-3xl border border-slate-700/80 bg-slate-950/80 px-5 py-4 text-slate-300 shadow-lg shadow-slate-950/30"
    >
      <div className="flex h-3 items-end gap-2">
        <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse delay-100" />
        <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse delay-200" />
        <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse delay-300" />
      </div>
      <p className="text-sm text-slate-300">AI is typing...</p>
    </motion.div>
  );
}
