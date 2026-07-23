import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, Clock3 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  author: string;
  content: string;
  timestamp: string;
  onCopy?: (message: string) => void;
}

function ChatMessage({ id, role, author, content, timestamp, onCopy }: ChatMessageProps) {
  const isUser = role === 'user';
  const alignment = isUser ? 'self-end items-end text-right' : 'self-start items-start text-left';
  const bubbleGradient = isUser ? 'from-cyan-500/90 to-indigo-500/90' : 'from-slate-800/95 to-slate-900/95';

  const formattedTimestamp = useMemo(() => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), [timestamp]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full max-w-3xl flex-col gap-3 ${alignment}`}
      data-testid={`chat-message-${id}`}
    >
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>{author}</span>
        <span className="inline-flex items-center gap-1">
          <Clock3 size={12} />
          {formattedTimestamp}
        </span>
      </div>

      <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${bubbleGradient} shadow-xl shadow-slate-950/20`}> 
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),_transparent_35%)] opacity-70 pointer-events-none" />
        <div className="relative rounded-[2rem] p-6">
          {role === 'assistant' ? (
            <div className="space-y-4">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-50">{content}</p>
          )}

          {role === 'assistant' && onCopy ? (
            <button
              type="button"
              onClick={() => onCopy(content)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-slate-100 transition duration-200 hover:bg-slate-900/90"
            >
              <Copy size={14} /> Copy
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(ChatMessage);
