import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MessageSquareText } from 'lucide-react';

function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12 lg:p-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.2),_transparent_40%)]" />
      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <Sparkles size={16} />
            Hackathon-Ready AI Experience
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI Consensus Checker
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Ask one question and explore how five distinct AI models respond, compare their language,
            and uncover the strongest shared answer through semantic similarity and consensus scoring.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="question-input">
              Ask a question
            </label>
            <textarea
              id="question-input"
              aria-label="Ask a question"
              rows={4}
              placeholder="Ask anything..."
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-slate-100 outline-none ring-0 transition focus:border-cyan-400/60 sm:max-w-xl"
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">0 / 280 characters</p>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 font-medium text-slate-950 transition duration-200 hover:scale-[1.02]"
            >
              Generate Answers
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
              <MessageSquareText size={24} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Preview</p>
              <h2 className="text-xl font-semibold text-white">Parallel insight engine</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {['Model A', 'Model B', 'Model C', 'Model D', 'Model E'].map((model, index) => (
              <div key={model} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{model}</span>
                  <span className="text-cyan-300">{92 - index * 4}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                    style={{ width: `${92 - index * 4}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
