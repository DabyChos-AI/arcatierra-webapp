'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, ShoppingCart, Heart } from 'lucide-react';

// Tipos para el sistema de Toast
interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'cart' | 'favorite';
  duration?: number;
  action?: ToastAction;
}

interface Toast extends ToastOptions {
  id: number;
}

interface ToastContextType {
  show: (options: ToastOptions) => number;
  success: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => number;
  error: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => number;
  warning: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => number;
  info: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => number;
  cart: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => number;
  favorite: (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) => number;
  remove: (id: number) => void;
}

// Context para el sistema de Toast
const ToastContext = createContext<ToastContextType | null>(null);

// Hook para usar el toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

// Componente individual de Toast
const ToastComponent = ({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) => {
  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    cart: ShoppingCart,
    favorite: Heart
  };

  const Icon = icons[toast.type || 'info'] || Info;

  // Adaptamos los colores para usar la paleta de ArcaTierra y fondo crema
  const colors = {
    success: 'bg-[#F5F2E8] border-green-500 text-green-800',
    error: 'bg-[#F5F2E8] border-red-500 text-red-800',
    warning: 'bg-[#F5F2E8] border-yellow-500 text-yellow-800',
    info: 'bg-[#F5F2E8] border-blue-500 text-blue-800',
    cart: 'bg-[#F5F2E8] border-[#33503E] text-[#33503E]',
    favorite: 'bg-[#F5F2E8] border-[#B15543] text-[#B15543]'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    cart: 'text-[#33503E]',
    favorite: 'text-[#B15543]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border ${colors[toast.type || 'info']} min-w-[320px] max-w-md`}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColors[toast.type || 'info']}`} />
      
      <div className="flex-1">
        {toast.title && (
          <h4 className="font-semibold mb-1">{toast.title}</h4>
        )}
        <p className="text-sm">{toast.message}</p>
        
        {/* Action Button */}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Provider del sistema de Toast
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (options: ToastOptions) => {
    const toast = {
      id: Date.now(),
      type: 'info',
      duration: 4000,
      ...options
    } as Toast;

    setToasts((current) => [...current, toast]);
    return toast.id;
  };

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  // Funciones helper para diferentes tipos
  const toast = {
    show: showToast,
    success: (message: string, options = {}) =>
      showToast({ ...options, type: 'success', message }),
    error: (message: string, options = {}) =>
      showToast({ ...options, type: 'error', message }),
    warning: (message: string, options = {}) =>
      showToast({ ...options, type: 'warning', message }),
    info: (message: string, options = {}) =>
      showToast({ ...options, type: 'info', message }),
    cart: (message: string, options = {}) =>
      showToast({ ...options, type: 'cart', message }),
    favorite: (message: string, options = {}) =>
      showToast({ ...options, type: 'favorite', message }),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Container de Toasts - posicionado con z-index alto para estar sobre el header */}
      <div className="fixed top-20 right-4 z-[9999] pointer-events-none">
        <AnimatePresence mode="sync">
          <div className="flex flex-col gap-3 pointer-events-auto">
            {toasts.map((t) => (
              <ToastComponent key={t.id} toast={t} onClose={removeToast} />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Componente de demostración (opcional, puedes comentarlo o eliminarlo)
export const ToastDemo = () => {
  const toast = useToast();

  const ejemplos = [
    {
      label: '✅ Éxito',
      action: () => toast.success('¡Producto agregado al carrito!', {
        title: '¡Excelente elección!',
        action: {
          label: 'Ver carrito',
          onClick: () => console.log('Ir al carrito')
        }
      })
    },
    {
      label: '❤️ Favorito',
      action: () => toast.favorite('Agregado a tus favoritos', {
        title: 'Guardado'
      })
    },
    {
      label: '🛒 Carrito',
      action: () => toast.cart('3 productos en tu carrito', {
        title: 'Carrito actualizado',
        duration: 3000
      })
    },
    {
      label: '⚠️ Advertencia',
      action: () => toast.warning('Stock limitado - Quedan solo 5 unidades')
    },
    {
      label: '❌ Error',
      action: () => toast.error('No se pudo procesar el pago. Intenta de nuevo.', {
        duration: 6000
      })
    },
    {
      label: 'ℹ️ Info',
      action: () => toast.info('Envío gratis en compras mayores a $500')
    }
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg flex gap-2 flex-wrap">
      {ejemplos.map((ejemplo, i) => (
        <button
          key={i}
          onClick={ejemplo.action}
          className="px-3 py-2 bg-white shadow-sm border rounded hover:bg-gray-50 transition-colors"
        >
          {ejemplo.label}
        </button>
      ))}
    </div>
  );
};
