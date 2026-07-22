import { motion } from 'framer-motion';
import { useQuestionContext } from '../../context/QuestionContext';

function QuestionResults() {
  const { question, responses, loading } = useQuestionContext();

  if (!question && !loading) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.24)] backdrop-blur"
    >
      <h3 className="text-xl font-semibold text-white">Submission Status</h3>
      <p className="mt-3 text-sm text-slate-400">{question || 'Waiting for your question…'}</p>
      {!loading && responses.length > 0 ? (
        <div className="mt-6 space-y-3">
          {responses.map((response) => (
            <div key={response.id} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{response.model}</span>
                <span>{response.similarity.toFixed(2)} similarity</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{response.answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">Responses will appear here once the submission flow is connected.</p>
      )}
    </motion.section>
  );
}

export default QuestionResults;
