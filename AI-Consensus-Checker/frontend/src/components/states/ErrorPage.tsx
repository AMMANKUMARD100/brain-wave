import { motion } from 'framer-motion';
import { AlertTriangle, Wifi, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  code: 404 | 500 | 'network';
  title?: string;
  description?: string;
}

const errorConfig = {
  404: {
    icon: Home,
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved.',
    color: 'text-cyan-300 bg-cyan-400/10',
  },
  500: {
    icon: AlertTriangle,
    title: 'Unexpected Error',
    description: 'Something went wrong on our end. Please try again later.',
    color: 'text-red-300 bg-red-400/10',
  },
  network: {
    icon: Wifi,
    title: 'Network Error',
    description: 'Unable to connect to the server. Please check your connection.',
    color: 'text-amber-300 bg-amber-400/10',
  },
};

export default function ErrorPage({ code, title, description }: ErrorPageProps) {
  const navigate = useNavigate();
  const config = errorConfig[code];
  const Icon = config.icon;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
            className={`mx-auto inline-flex rounded-full p-4 ${config.color}`}
          >
            <Icon size={40} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h1 className="mt-6 text-5xl font-bold text-white">{code}</h1>
            <h2 className="mt-4 text-2xl font-semibold text-white">{title || config.title}</h2>
            <p className="mt-3 text-slate-400">{description || config.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              className="button-primary w-full sm:w-auto"
              aria-label="Go back to home"
            >
              Back to Home
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="button-secondary w-full sm:w-auto"
              aria-label="Retry"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
