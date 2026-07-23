import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, MessageSquareText, Zap } from 'lucide-react';

function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/80 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12 lg:p-16"
    >
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.15),_transparent_45%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 to-indigo-500/10 px-4 py-2 text-sm font-medium text-cyan-300 backdrop-blur-sm"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity }}>
              <Sparkles size={16} />
            </motion.div>
            Hackathon-Ready AI Experience
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              AI Consensus
            </span>
            <br />
            Checker
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
          >
            Ask one question and explore how five distinct AI models respond, compare their language,
            and uncover the strongest shared answer through semantic similarity and consensus scoring.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <div className="relative w-full sm:max-w-xl">
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                id="question-input"
                aria-label="Ask a question"
                rows={4}
                placeholder="Ask anything..."
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-base text-slate-100 outline-none ring-0 transition duration-300 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:bg-slate-950/90 placeholder-slate-500"
              />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 to-indigo-500/0 pointer-events-none"
                whileFocus={{ from: 'rgba(34,211,238,0.1)', to: 'rgba(129,140,248,0.1)' }}
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-400">0 / 280 characters</p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,211,238,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-8 py-3 font-semibold text-slate-950 transition duration-200 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40"
            >
              <Zap size={18} />
              Generate Answers
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Side Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-xl backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300"
        >
          <motion.div
            className="flex items-center gap-3 mb-6"
            whileHover={{ x: 4 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="rounded-2xl bg-gradient-to-br from-cyan-400/15 to-indigo-500/15 p-3 text-cyan-300"
            >
              <MessageSquareText size={24} />
            </motion.div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview</p>
              <h2 className="text-xl font-semibold text-white">Parallel insight engine</h2>
            </div>
          </motion.div>

          <div className="space-y-3">
            {['Model A', 'Model B', 'Model C', 'Model D', 'Model E'].map((model, index) => (
              <motion.div
                key={model}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 transition-all duration-300 cursor-pointer"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">{model}</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.08 }}
                    className="text-cyan-300 font-semibold"
                  >
                    {92 - index * 4}%
                  </motion.span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${92 - index * 4}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
