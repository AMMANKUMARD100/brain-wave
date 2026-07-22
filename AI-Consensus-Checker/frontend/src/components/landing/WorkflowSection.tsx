import { motion } from 'framer-motion';
import { ArrowDown, MessageSquareQuote, BrainCircuit, TrendingUp, BarChart4 } from 'lucide-react';
import SectionHeading from './SectionHeading';

const workflow = [
  { title: 'Ask Question', icon: MessageSquareQuote },
  { title: 'Five AI Models', icon: BrainCircuit },
  { title: 'Semantic Comparison', icon: TrendingUp },
  { title: 'Consensus Score', icon: BarChart4 },
];

function WorkflowSection() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-10">
      <SectionHeading
        eyebrow="Workflow"
        title="From prompt to insight"
        description="The experience is organized to feel clear, elegant, and easy to follow."
      />
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {workflow.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -14 : 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="flex flex-1 flex-col items-center rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="mb-4 rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">
                {index === workflow.length - 1 ? 'Visualization' : 'Step in the journey'}
              </p>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center text-cyan-300">
        <ArrowDown size={18} />
      </div>
    </section>
  );
}

export default WorkflowSection;
