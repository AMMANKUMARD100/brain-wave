import { motion } from 'framer-motion';

interface SkeletonProps {
  count?: number;
  variant?: 'card' | 'text' | 'circle';
  className?: string;
}

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-glass space-y-4 p-6"
    >
      <div className="loading-shimmer h-8 rounded-lg" />
      <div className="loading-shimmer h-4 rounded-lg" />
      <div className="loading-shimmer h-4 w-5/6 rounded-lg" />
      <div className="mt-6 space-y-2">
        <div className="loading-shimmer h-3 rounded-lg" />
        <div className="loading-shimmer h-3 w-4/5 rounded-lg" />
      </div>
    </motion.div>
  );
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`loading-shimmer rounded-lg ${className}`} />;
}

export function SkeletonCircle({ size = 'w-12 h-12' }: { size?: string }) {
  return <div className={`loading-shimmer rounded-full ${size}`} />;
}

export function SkeletonLoader({ count = 3, variant = 'card' }: SkeletonProps) {
  const variants = {
    card: <SkeletonCard />,
    text: <SkeletonText className="h-4 w-full" />,
    circle: <SkeletonCircle />,
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {variants[variant]}
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}
