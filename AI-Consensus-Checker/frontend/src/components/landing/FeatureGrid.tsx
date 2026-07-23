import { motion } from 'framer-motion';
import { Cpu, ScanSearch, Zap, BarChart3, Sparkles } from 'lucide-react';
import SectionHeading from './SectionHeading';

const features = [
  {
    title: 'Five AI Models',
    description: 'Surface responses from a curated set of model perspectives in one place.',
    icon: Cpu,
    gradient: 'from-cyan-400/20 to-blue-500/20',
    iconBg: 'from-cyan-400/15 to-blue-500/15',
  },
  {
    title: 'Semantic Consensus',
    description: 'Highlight the answer that resonates most across all responses.',
    icon: ScanSearch,
    gradient: 'from-indigo-400/20 to-purple-500/20',
    iconBg: 'from-indigo-400/15 to-purple-500/15',
  },
  {
    title: 'Fast Parallel Responses',
    description: 'Keep the experience fluid with parallel-ready, modular response blocks.',
    icon: Zap,
    gradient: 'from-yellow-400/20 to-orange-500/20',
    iconBg: 'from-yellow-400/15 to-orange-500/15',
  },
  {
    title: 'Interactive Charts',
    description: 'Turn similarity and confidence into clear visual storytelling.',
    icon: BarChart3,
    gradient: 'from-green-400/20 to-emerald-500/20',
    iconBg: 'from-green-400/15 to-emerald-500/15',
  },
  {
    title: 'Embedding Similarity',
    description: 'Explore how closely each answer aligns with the strongest consensus signal.',
    icon: Sparkles,
    gradient: 'from-pink-400/20 to-rose-500/20',
    iconBg: 'from-pink-400/15 to-rose-500/15',
  },
];

function FeatureGrid() {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/50 to-slate-950/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 blur-3xl"
        />
      </div>

      <div className="relative">
        <SectionHeading
          eyebrow="Capabilities"
          title="A premium comparison experience"
          description="Every card is designed to feel crisp, informative, and intentionally interactive."
        />

        <motion.div
          className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1.5rem]`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.5 }}
                />

                {/* Border Glow on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-[1.5rem] border border-transparent group-hover:border-cyan-400/30 transition-colors duration-300"
                  initial={{ boxShadow: 'inset 0 0 0 0px rgba(34,211,238,0)' }}
                  whileHover={{ boxShadow: 'inset 0 0 20px 0px rgba(34,211,238,0.2)' }}
                />

                <div className="relative z-10">
                  {/* Icon Container */}
                  <motion.div
                    className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${feature.iconBg} p-3 text-cyan-300 group-hover:text-white transition-colors duration-300`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon size={24} />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-xl font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all duration-300"
                    initial={{ letterSpacing: '0px' }}
                    whileHover={{ letterSpacing: '0.05em' }}
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    className="mt-3 text-sm leading-7 text-slate-300 group-hover:text-slate-200 transition-colors duration-300"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {feature.description}
                  </motion.p>

                  {/* Animated Accent Line */}
                  <motion.div
                    className="mt-4 h-1 w-0 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full group-hover:w-12 transition-all duration-300"
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default FeatureGrid;
