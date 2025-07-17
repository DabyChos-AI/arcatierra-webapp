'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

interface ToastNotificationProps {
  mensaje: string
  onClose: () => void
}

export default function ToastNotification({ mensaje, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-[#33503E] text-white p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-80">
        <Check className="w-5 h-5 text-white" />
        <span className="flex-1">{mensaje}</span>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

