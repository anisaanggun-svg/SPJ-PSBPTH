import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorClasses = {
  success: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
};

let addToastExternal: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  addToastExternal?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastExternal = (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      addToastExternal = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right ${colorClasses[t.type]}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
