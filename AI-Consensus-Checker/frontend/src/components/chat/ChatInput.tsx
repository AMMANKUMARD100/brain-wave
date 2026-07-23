import { useEffect, useMemo, useRef } from 'react';
import { Send, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ChatInputProps {
  initialPrompt?: string;
  isLoading: boolean;
  onSend: (prompt: string) => void;
  onStop?: () => void;
}

interface ChatInputFormValues {
  prompt: string;
}

export default function ChatInput({ initialPrompt = '', isLoading, onSend, onStop }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { register, handleSubmit, watch, setValue } = useForm<ChatInputFormValues>({
    defaultValues: { prompt: initialPrompt },
  });

  const promptValue = watch('prompt') || '';
  const charCount = promptValue.length;
  const maxChars = 2000;
  const isNearLimit = charCount > maxChars * 0.9;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [promptValue]);

  const canSend = useMemo(() => promptValue.trim().length > 0 && !isLoading, [promptValue, isLoading]);

  const submitForm = async (values: ChatInputFormValues) => {
    if (!values.prompt.trim()) return;
    onSend(values.prompt.trim());
    setValue('prompt', '');
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="relative rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-xl shadow-slate-950/30 backdrop-blur-xl sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <textarea
            {...register('prompt', {
              maxLength: {
                value: maxChars,
                message: `Limit is ${maxChars} characters`,
              },
            })}
            ref={(element) => {
              textareaRef.current = element;
              register('prompt').ref(element);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(submitForm)();
              }
            }}
            placeholder="Ask anything..."
            aria-label="Chat prompt input"
            className="min-h-[120px] w-full rounded-[1.75rem] border border-white/10 bg-slate-950/90 px-5 py-4 pr-28 text-base text-slate-100 outline-none transition duration-200 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 placeholder:text-slate-500"
          />

          <div className="pointer-events-none absolute bottom-4 right-5 rounded-full bg-slate-950/90 px-3 py-1 text-xs text-slate-400 shadow-lg shadow-slate-950/20">
            Shift + Enter for new line
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:w-48">
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-5 py-4 text-sm font-semibold text-slate-950 transition duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isLoading ? 'Waiting…' : 'Send'}
          </button>

          {onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-5 py-4 text-sm font-semibold text-slate-100 transition duration-200 hover:border-cyan-400/50 hover:text-cyan-300"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Stop Generating
            </button>
          ) : null}

          {charCount > 0 ? (
            <div className={`rounded-2xl px-3 py-2 text-xs ${isNearLimit ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-900/80 text-slate-400'}`}>
              {charCount} / {maxChars} chars
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
