import { Toaster } from 'react-hot-toast';

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: '!bg-slate-900/95 !text-slate-100 !border !border-white/20 !backdrop-blur-xl !shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
        duration: 4000,
        style: {
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          padding: '12px 16px',
          borderRadius: '12px',
          fontWeight: '500',
        },
        success: {
          className: '!border-green-400/30 !bg-green-400/10',
          iconTheme: {
            primary: '#22c55e',
            secondary: '#0f172a',
          },
        },
        error: {
          className: '!border-red-400/30 !bg-red-400/10',
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0f172a',
          },
        },
        loading: {
          className: '!border-cyan-400/30 !bg-cyan-400/10',
          iconTheme: {
            primary: '#06b6d4',
            secondary: '#0f172a',
          },
        },
      }}
    />
  );
}

export default ToastProvider;
