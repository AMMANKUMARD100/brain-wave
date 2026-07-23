import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuestionContext } from '../../context/QuestionContext';
import { useHistoryContext } from '../../context/HistoryContext';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import SuggestedPrompts from './SuggestedPrompts';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

const initialPrompts = [
  'Explain Quantum Computing',
  'Build a React Todo App',
  'Write a Professional Resume',
  'Explain Dynamic Programming',
  'Compare GPT and Gemini',
];

export default function ChatLayout() {
  const { fullResponse, submitQuestion, loading } = useQuestionContext();
  const { addEntry } = useHistoryContext();
  const [activePrompt, setActivePrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatPrompt = fullResponse ? fullResponse.question : activePrompt;

  const handleSendPrompt = async (prompt: string) => {
    setActivePrompt(prompt);
    setIsTyping(true);
    const response = await submitQuestion(prompt);
    setIsTyping(false);
    if (response) {
      addEntry(prompt, response);
      toast.success('Response received.');
    }
  };

  const handleCopy = async (message: string) => {
    await navigator.clipboard.writeText(message);
    toast.success('Copied to clipboard');
  };

  const suggestedPrompts = useMemo(() => initialPrompts, []);

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] flex-col gap-6">
      <AnimatePresence mode="wait">
        {loading ? <LoadingSpinner key="loading" /> : null}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.5)] backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">AI Chat</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Premium AI chat experience</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
              Ask anything and receive a polished, responsive conversation crafted by the AI consensus engine.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:border-cyan-400/50 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
            aria-label="Open settings"
          >
            Settings
          </button>
        </div>
      </motion.header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Suggested questions</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Get started instantly</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-400">
                Tap a prompt to fill the input instantly or start a chat with one click.
              </p>
            </div>
            <SuggestedPrompts prompts={suggestedPrompts} onSelectPrompt={handleSendPrompt} />
          </motion.div>

          <ChatInput isLoading={loading} onSend={handleSendPrompt} />

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
            <ChatMessages response={fullResponse} userMessage={chatPrompt} isTyping={isTyping} onCopyMessage={handleCopy} />
          </motion.div>
        </section>

        <aside className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Quick tips</p>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <li className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">Press <span className="font-semibold text-white">Enter</span> to send and <span className="font-semibold text-white">Shift + Enter</span> for a new line.</li>
              <li className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">Use the copy button to quickly save AI replies.</li>
              <li className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">Long conversations stay smooth with responsive scrolling.</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_100px_rgba(15,23,42,0.45)] backdrop-blur-xl"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">History</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">Your recent prompts and AI responses are stored in the sidebar for quick reuse and review.</p>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
