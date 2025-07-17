'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto-remove después del tiempo especificado
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-full max-w-md pointer-events-none">
        <AnimatePresence>
          {notifications.map(notification => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationItem 
                notification={notification} 
                onRemove={() => removeNotification(notification.id)} 
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

function NotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: Notification
  onRemove: () => void 
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800'
      case 'warning':
        return 'bg-amber-50 border-amber-500 text-amber-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg shadow-md border-l-4 p-4 ${getBgColor()} flex items-start`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="ml-3 w-full">
        <div className="font-medium">{notification.title}</div>
        <div className="text-sm opacity-90">{notification.message}</div>

        {notification.action && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              notification.action?.onClick()
              onRemove()
            }}
            className="mt-2 text-sm font-medium hover:underline"
          >
            {notification.action.label}
          </motion.button>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

// Hook para notificaciones comunes
export function useCommonNotifications() {
  const { addNotification } = useNotifications()

  return {
    notifySuccess: (title: string, message: string) => {
      addNotification({ type: 'success', title, message })
    },
    
    notifyError: (title: string, message: string) => {
      addNotification({ type: 'error', title, message })
    },
    
    notifyInfo: (title: string, message: string) => {
      addNotification({ type: 'info', title, message })
    },
    
    notifyWarning: (title: string, message: string) => {
      addNotification({ type: 'warning', title, message })
    },

    notifyOrderSuccess: (orderId: string) => {
      addNotification({
        type: 'success',
        title: '¡Pedido realizado!',
        message: `Tu pedido ${orderId} ha sido procesado exitosamente.`,
        action: {
          label: 'Ver pedido',
          onClick: () => window.location.href = `/mis-pedidos/${orderId}`
        }
      })
    },

    notifyPaymentPending: (orderId: string) => {
      addNotification({
        type: 'warning',
        title: 'Pago pendiente',
        message: `Tu pedido ${orderId} está esperando confirmación de pago.`,
        duration: 0 // No auto-remove
      })
    },

    notifyDeliveryUpdate: (orderId: string, status: string) => {
      addNotification({
        type: 'info',
        title: 'Actualización de entrega',
        message: `Tu pedido ${orderId} está ${status}.`,
        action: {
          label: 'Rastrear',
          onClick: () => window.location.href = `/rastrear/${orderId}`
        }
      })
    },

    notifySubscriptionRenewal: (planName: string) => {
      addNotification({
        type: 'info',
        title: 'Suscripción renovada',
        message: `Tu suscripción ${planName} ha sido renovada exitosamente.`,
        action: {
          label: 'Ver detalles',
          onClick: () => window.location.href = '/suscripciones'
        }
      })
    },

    notifyNewProducts: () => {
      addNotification({
        type: 'info',
        title: 'Nuevos productos disponibles',
        message: 'Descubre los productos frescos de temporada que acabamos de agregar.',
        action: {
          label: 'Ver productos',
          onClick: () => window.location.href = '/tienda?filter=nuevo'
        }
      })
    }
  }
}

