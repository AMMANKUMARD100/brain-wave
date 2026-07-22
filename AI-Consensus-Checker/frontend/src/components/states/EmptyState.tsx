import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'warning';
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const colorMap = {
    default: 'bg-cyan-400/10 text-cyan-300',
    success: 'bg-green-400/10 text-green-300',
    warning: 'bg-amber-400/10 text-amber-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-slate-900/50 px-6 py-16 text-center sm:px-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
        className={`rounded-full p-4 ${colorMap[variant]}`}
      >
        <Icon size={32} />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-6 text-xl font-semibold text-white"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-3 max-w-sm text-slate-400"
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          onClick={action.onClick}
          type="button"
          className="button-primary mt-8"
          aria-label={action.label}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
