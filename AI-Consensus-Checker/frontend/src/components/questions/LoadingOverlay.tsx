import { motion } from 'framer-motion';
import { Loader2, Cpu, Sparkles, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
  estimatedWait?: number;
}

const loadingStages = ['Analyzing models', 'Comparing responses', 'Building consensus', 'Finalizing results'];

export default function LoadingOverlay({ visible, estimatedWait = 12 }: LoadingOverlayProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % loadingStages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/90 p-6 backdrop-blur-xl"
      aria-live="assertive"
      aria-label="Loading overlay"
      role="status"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-10 text-center shadow-[0_30px_120px_rgba(15,23,42,0.65)]"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/40"
        >
          <Cpu size={36} />
        </motion.div>

        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm uppercase tracking-[0.28em] text-cyan-300/80"
          >
            Processing
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-semibold text-white"
          >
            Generating consensus across five AI providers
          </motion.h2>

          <motion.div
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-16"
          >
            <p className="text-sm leading-7 text-slate-400">
              {loadingStages[stage]}. Estimated wait time is around {estimatedWait} seconds.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 rounded-full bg-slate-950/70 px-4 py-3 text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
          >
            <Loader2 size={20} className="animate-spin text-cyan-300" />
            <span className="text-sm font-medium">Streaming responses where supported</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-xs"
          >
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-slate-700 to-slate-800" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-lg shadow-cyan-400/50"
                initial={{ width: '0%' }}
                animate={{ width: '85%' }}
                transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 hover:border-cyan-400/30 transition">
            <Sparkles size={14} /> Adaptive Progress
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 hover:border-cyan-400/30 transition">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-cyan-400"
            />
            Live Streaming
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 hover:border-cyan-400/30 transition">
            <Zap size={14} /> High Performance
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
