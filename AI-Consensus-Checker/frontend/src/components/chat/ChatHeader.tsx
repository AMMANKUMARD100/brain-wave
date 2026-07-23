import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';

export default function ChatHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">AI Chat</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Premium AI chat experience</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Conversational intelligence with a refined UI, smooth transitions, and responsive interaction.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:border-cyan-400/50 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          aria-label="Open chat settings"
        >
          <Settings2 className="h-4 w-4" />
          Settings
        </button>
      </div>
    </motion.header>
  );
}
