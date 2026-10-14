
import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3500 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-20 right-4 md:right-8 z-[100] animate-slide-in">
      <div className={`
        relative overflow-hidden min-w-[320px] max-w-md p-4 rounded-2xl neu-card
        flex items-center space-x-4 transition-all transform hover:scale-[1.02]
        ${isSuccess 
          ? 'text-emerald-700 dark:text-emerald-300' 
          : 'text-rose-700 dark:text-rose-300'
        }
      `}>
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center neu-flat-sm
          ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}
        `}>
          <i className={`fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-black leading-tight uppercase tracking-tight">{isSuccess ? 'Success' : 'Attention'}</p>
          <p className="text-xs font-medium opacity-80 mt-0.5">{message}</p>
        </div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <i className="fas fa-times text-xs opacity-50"></i>
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-black/5 dark:bg-white/10 w-full">
          <div 
            className={`h-full transition-all duration-10 linear ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
