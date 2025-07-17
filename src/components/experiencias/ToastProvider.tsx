'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000, // Default duration 5 seconds
    };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto dismiss after duration
    setTimeout(() => {
      hideToast(id);
    }, newToast.duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Limit maximum number of toasts
  useEffect(() => {
    if (toasts.length > 3) {
      const toastToRemove = toasts[0];
      hideToast(toastToRemove.id);
    }
  }, [toasts, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-3"
            >
              <Toast toast={toast} onDismiss={() => hideToast(toast.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

type ToastProps = {
  toast: Toast;
  onDismiss: () => void;
};

const Toast = ({ toast, onDismiss }: ToastProps) => {
  const { title, message, type } = toast;

  let backgroundColor = 'bg-white';
  let iconColor = 'text-verde-principal';
  let borderColor = 'border-verde-principal';
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );

  // Adjust style based on toast type
  switch (type) {
    case 'success':
      iconColor = 'text-green-500';
      borderColor = 'border-green-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'error':
      iconColor = 'text-red-500';
      borderColor = 'border-red-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'warning':
      iconColor = 'text-yellow-500';
      borderColor = 'border-yellow-500';
      icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
      break;
    default:
      break;
  }

  return (
    <div className={`min-w-[300px] max-w-md ${backgroundColor} shadow-lg rounded-lg border-l-4 ${borderColor} overflow-hidden`}>
      <div className="p-4 flex">
        <div className={`flex-shrink-0 ${iconColor} mr-3`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
