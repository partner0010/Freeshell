/**
 * 토스트 컨테이너 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastManager, ToastType } from '@/lib/utils/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState(toastManager.getToasts());

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(() => {
      setToasts(toastManager.getToasts());
    });
    return unsubscribe;
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg border shadow-lg flex items-start gap-3 ${getBgColor(toast.type)}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.options?.action && (
                <button
                  onClick={toast.options.action.onClick}
                  className="mt-2 text-xs font-semibold underline hover:no-underline"
                >
                  {toast.options.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => toastManager.remove(toast.id)}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
