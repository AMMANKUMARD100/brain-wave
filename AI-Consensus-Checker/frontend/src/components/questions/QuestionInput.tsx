import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { SendHorizontal, Loader2, Sparkles } from 'lucide-react';
import { useQuestionContext } from '../../context/QuestionContext';

interface QuestionFormValues {
  question: string;
}

interface QuestionInputProps {
  onSubmitSuccess?: (question: string, response: import('../../types').QuestionResponse) => void;
  initialQuestion?: string;
}

function QuestionInput({ onSubmitSuccess, initialQuestion }: QuestionInputProps) {
  const { submitQuestion, isSubmitting } = useQuestionContext();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    defaultValues: { question: initialQuestion ?? '' },
    mode: 'onSubmit',
  });

  const questionValue = watch('question') || '';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [questionValue]);

  useEffect(() => {
    if (initialQuestion && !questionValue.trim()) {
      setValue('question', initialQuestion);
      textareaRef.current?.focus();
    }
  }, [initialQuestion, questionValue, setValue]);

  const onSubmit = async (data: QuestionFormValues) => {
    const response = await submitQuestion(data.question.trim());
    if (response) {
      onSubmitSuccess?.(data.question.trim(), response);
    }
    setValue('question', '');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setValue('question', '');
      textareaRef.current?.blur();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setValue('question', '');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.28)] backdrop-blur md:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Ask your question</h2>
          <p className="text-sm text-slate-400">Submit a prompt to begin the comparison flow.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <textarea
            {...register('question', {
              required: 'Please enter a question.',
              validate: (value) => {
                const trimmed = value?.trim();
                if (!trimmed) return 'Please enter a question.';
                if (trimmed.length > 2000) return 'Question must be 2000 characters or fewer.';
                return true;
              },
            })}
            ref={(element) => {
              textareaRef.current = element;
              register('question').ref(element);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            aria-label="Question input"
            aria-invalid={Boolean(errors.question)}
            className="min-h-[130px] w-full rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-base text-slate-100 outline-none transition focus:border-cyan-400/60"
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="text-rose-400">{errors.question?.message}</p>
            <p className={`text-slate-400 ${questionValue.length > 1800 ? 'text-amber-400' : ''}`}>
              {questionValue.length}/2000
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Press Enter to submit. Use Shift + Enter for a new line.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-3 font-medium text-slate-950 transition duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <SendHorizontal size={18} />
                Generate Answers
              </>
            )}
          </button>
        </div>
      </form>
    </motion.section>
  );
}

export default QuestionInput;
