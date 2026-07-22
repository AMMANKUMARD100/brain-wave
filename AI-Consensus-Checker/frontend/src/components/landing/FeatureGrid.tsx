import { motion } from 'framer-motion';
import { Cpu, ScanSearch, Zap, BarChart3, Sparkle } from 'lucide-react';
import SectionHeading from './SectionHeading';

const features = [
  {
    title: 'Five AI Models',
    description: 'Surface responses from a curated set of model perspectives in one place.',
    icon: Cpu,
  },
  {
    title: 'Semantic Consensus',
    description: 'Highlight the answer that resonates most across all responses.',
    icon: ScanSearch,
  },
  {
    title: 'Fast Parallel Responses',
    description: 'Keep the experience fluid with parallel-ready, modular response blocks.',
    icon: Zap,
  },
  {
    title: 'Interactive Charts',
    description: 'Turn similarity and confidence into clear visual storytelling.',
    icon: BarChart3,
  },
  {
    title: 'Embedding Similarity',
    description: 'Explore how closely each answer aligns with the strongest consensus signal.',
    icon: Sparkle,
  },
];

function FeatureGrid() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-10">
      <SectionHeading
        eyebrow="Capabilities"
        title="A premium comparison experience"
        description="Every card is designed to feel crisp, informative, and intentionally minimal."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Icon size={22} />
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureGrid;
