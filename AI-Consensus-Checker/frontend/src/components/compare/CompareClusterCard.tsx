import { motion } from 'framer-motion';

interface CompareClusterCardProps {
  answer: string;
  confidence: string;
  score: string;
  representative: string;
  members: string[];
}

export default function CompareClusterCard({ answer, confidence, score, representative, members }: CompareClusterCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.18)]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Consensus Answer</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{answer}</h3>
        </div>
        <span className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-200">{confidence}</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-300">
          <p className="text-slate-400">Consensus score</p>
          <p className="mt-2 text-3xl font-semibold text-white">{score}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white/5 p-4 text-sm text-slate-300">
          <p className="text-slate-400">Representative model</p>
          <p className="mt-2 text-xl font-semibold text-white">{representative}</p>
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-400">
        <p className="font-semibold text-slate-200">Cluster members</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {members.map((member) => (
            <span key={member} className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
              {member}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
