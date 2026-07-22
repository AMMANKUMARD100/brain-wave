import { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeatureGrid from '../components/landing/FeatureGrid';
import WorkflowSection from '../components/landing/WorkflowSection';
import TechStackSection from '../components/landing/TechStackSection';
import FooterSection from '../components/landing/FooterSection';
import QuestionInput from '../components/questions/QuestionInput';
import AnswerDashboard from '../components/questions/AnswerDashboard';
import ToastProvider from '../components/questions/ToastProvider';
import LoadingOverlay from '../components/questions/LoadingOverlay';
import HistoryPanel from '../components/questions/HistoryPanel';
import { useHistoryContext } from '../context/HistoryContext';
import { useQuestionContext } from '../context/QuestionContext';

function HomePage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reuseQuestion, setReuseQuestion] = useState('');
  const { addEntry } = useHistoryContext();
  const { loading } = useQuestionContext();

  const handleReuseQuestion = (question: string) => {
    setHistoryOpen(false);
    setReuseQuestion(question);
  };

  return (
    <div className="relative space-y-8 py-2 lg:py-4">
      <ToastProvider />
      <LoadingOverlay visible={loading} estimatedWait={12} />
      <HistoryPanel visible={historyOpen} onClose={() => setHistoryOpen(false)} onReuseQuestion={handleReuseQuestion} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <HeroSection />
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="self-start rounded-full border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          View history
        </button>
      </div>
      <QuestionInput
        initialQuestion={reuseQuestion}
        onSubmitSuccess={(question, response) => {
          addEntry(question, response);
          setReuseQuestion('');
        }}
      />
      <AnswerDashboard />
      <FeatureGrid />
      <WorkflowSection />
      <TechStackSection />
      <FooterSection />
    </div>
  );
}

export default HomePage;
