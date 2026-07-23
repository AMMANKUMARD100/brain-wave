import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, Loader2, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
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
  const charCount = questionValue.length;
  const maxChars = 2000;
  const charPercentage = (charCount / maxChars) * 100;
  const isNearLimit = charPercentage > 90;

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
      className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-950/70 p-6 shadow-[0_20px_90px_rgba(0,0,0,0.28)] backdrop-blur md:p-8 overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="rounded-2xl bg-gradient-to-br from-cyan-400/15 to-indigo-500/15 p-3 text-cyan-300"
          >
            <Sparkles size={20} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">Ask your question</h2>
            <p className="text-sm text-slate-400">Submit a prompt to begin the comparison flow.</p>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            {/* Textarea Container */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
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
                className="min-h-[130px] w-full rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-base text-slate-100 outline-none transition duration-300 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 focus:bg-slate-950/90 placeholder-slate-500 resize-none"
              />

              {/* Character Count Bar */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-[1.4rem] bg-gradient-to-r from-cyan-400/30 to-indigo-500/30 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className={`h-full rounded-b-[1.4rem] bg-gradient-to-r ${
                    isNearLimit
                      ? 'from-amber-400 to-orange-500'
                      : 'from-cyan-400 to-indigo-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${charPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>

            {/* Error and Character Count */}
            <motion.div
              className="mt-3 flex items-center justify-between text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {errors.question ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-rose-400"
                  >
                    <AlertCircle size={16} />
                    {errors.question?.message}
                  </motion.div>
                ) : questionValue.length > 0 ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 text-emerald-400"
                  >
                    <CheckCircle size={16} />
                    Question ready
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400"
                  >
                    Start typing to ask a question
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.p
                className={`font-medium transition-colors duration-300 ${
                  isNearLimit ? 'text-amber-400' : 'text-slate-400'
                }`}
                animate={{ scale: isNearLimit ? 1.1 : 1 }}
              >
                {charCount}/{maxChars}
              </motion.p>
            </motion.div>
          </div>

          {/* Helper Text */}
          <motion.p
            className="text-xs text-slate-500 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-block w-1 h-1 rounded-full bg-cyan-400/50" />
            Press <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-white/10 text-slate-300">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-white/10 text-slate-300">Enter</kbd> to submit
          </motion.p>

          {/* Submit Button */}
          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.p
              className="text-sm text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {questionValue.length === 0
                ? 'Ready to explore AI consensus'
                : `${questionValue.split(' ').length} words`}
            </motion.p>

            <motion.button
              type="submit"
              disabled={isSubmitting || !questionValue.trim()}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34,211,238,0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-8 py-3 font-semibold text-slate-950 transition duration-200 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <Loader2 size={18} />
                  </motion.div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <SendHorizontal size={18} />
                  Generate Answers
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.section>
  );
}

export default QuestionInput;
