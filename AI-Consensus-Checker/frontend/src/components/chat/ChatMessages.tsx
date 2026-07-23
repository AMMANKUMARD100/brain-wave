import { AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import ChatMessage from './ChatMessage';
import type { QuestionResponse } from '../../types';

interface ChatMessagesProps {
  response: QuestionResponse | null;
  userMessage: string;
  isTyping: boolean;
  onCopyMessage: (message: string) => void;
}

function ChatMessages({ response, userMessage, isTyping, onCopyMessage }: ChatMessagesProps) {
  const messages = useMemo(() => {
    const baseMessages = [
      {
        id: 'user-1',
        role: 'user' as const,
        author: 'You',
        content: userMessage,
        timestamp: response?.submittedAt ?? new Date().toISOString(),
      },
    ];

    if (!response) return baseMessages;

    return [
      ...baseMessages,
      {
        id: response.question,
        role: 'assistant' as const,
        author: 'AI Consensus',
        content: response.consensus,
        timestamp: response.submittedAt,
      },
    ];
  }, [response, userMessage]);

  return (
    <div className="relative flex max-h-[70vh] w-full flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-slate-950/40">
        <div className="space-y-1">
          <p className="font-semibold text-slate-100">Conversation</p>
          <p className="text-xs text-slate-500">AI consensus across provider responses.</p>
        </div>
        <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
          {response ? 'Completed' : 'Ready to chat'}
        </span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700/80 scrollbar-track-slate-950/10">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              role={message.role}
              author={message.author}
              content={message.content}
              timestamp={message.timestamp}
              onCopy={message.role === 'assistant' ? onCopyMessage : undefined}
            />
          ))}
        </AnimatePresence>

        {isTyping ? (
          <div className="mt-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
                <p className="text-sm text-slate-300">AI is crafting the next answer...</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ChatMessages;
