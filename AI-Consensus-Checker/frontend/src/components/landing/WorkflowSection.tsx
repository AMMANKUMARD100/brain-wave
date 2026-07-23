import { motion } from 'framer-motion';
import { ArrowDown, HelpCircle, Cpu, BarChart3, Trophy } from 'lucide-react';
import SectionHeading from './SectionHeading';

const workflow = [
  {
    step: 1,
    title: 'Ask Question',
    description: 'Submit your question to the system',
    icon: HelpCircle,
  },
  {
    step: 2,
    title: 'Five AI Models',
    description: 'Get responses from multiple AI providers',
    icon: Cpu,
  },
  {
    step: 3,
    title: 'Semantic Comparison',
    description: 'Analyze similarity and alignment',
    icon: BarChart3,
  },
  {
    step: 4,
    title: 'Consensus Score',
    description: 'Discover the strongest consensus answer',
    icon: Trophy,
  },
];

function WorkflowSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/50 to-slate-950/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-10 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-3xl"
        />
      </div>

      <div className="relative">
        <SectionHeading
          eyebrow="How It Works"
          title="Simple workflow"
          description="From question to consensus in four intuitive steps."
        />

        <motion.div
          className="mt-12 flex flex-col gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {workflow.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === workflow.length - 1;

            return (
              <motion.div key={item.step} variants={itemVariants}>
                <div className="flex gap-6 md:gap-8">
                  {/* Step Number and Icon */}
                  <motion.div
                    className="flex flex-col items-center gap-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 text-cyan-300 font-bold text-lg"
                      whileHover={{
                        borderColor: 'rgba(34, 211, 238, 0.6)',
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon size={24} />
                    </motion.div>

                    {!isLast && (
                      <motion.div
                        className="hidden md:flex flex-col items-center gap-2"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowDown size={20} className="text-cyan-400/50" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    className="flex-1 pt-2"
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/8">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-sm font-bold text-slate-950"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {item.step}
                        </motion.span>
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{item.description}</p>

                      {/* Accent Line */}
                      <motion.div
                        className="mt-4 h-1 w-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                        whileHover={{ width: '3rem' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Mobile Arrow */}
                {!isLast && (
                  <motion.div
                    className="md:hidden flex justify-center mt-4"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowDown size={20} className="text-cyan-400/50" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-300 mb-4">Ready to explore AI consensus?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="button-primary"
          >
            Start Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default WorkflowSection;
