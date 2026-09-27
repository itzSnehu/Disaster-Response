import { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center p-4 rounded-2xl shadow-warm-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
                isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : isInfo
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="mr-3 flex-shrink-0">
                {isError ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : isInfo ? (
                  <Info className="w-5 h-5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 text-xs md:text-sm font-semibold">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
