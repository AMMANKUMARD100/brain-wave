import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

const stack = ['React 19', 'Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React Router'];

function TechStackSection() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-10">
      <SectionHeading
        eyebrow="Tech Stack"
        title="Designed with modern web tooling"
        description="The UI is ready for a polished hackathon demo and future integration work."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stack.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="rounded-[1.25rem] border border-white/10 bg-white/5 px-5 py-4 text-center text-sm font-medium text-slate-200"
          >
            {item}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default TechStackSection;
