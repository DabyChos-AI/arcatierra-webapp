'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const WHATSAPP_NUMBER = '+5255123456789' // Número de WhatsApp de Arca Tierra

const QUICK_MESSAGES = [
  '¡Hola! Me interesa conocer más sobre sus productos orgánicos',
  'Quiero información sobre las canastas de temporada',
  'Me gustaría agendar una experiencia en las chinampas',
  '¿Hacen entregas en mi zona?',
  'Necesito cotizar un servicio de catering'
]

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showQuickMessages, setShowQuickMessages] = useState(true)

  // Auto-abrir el chat después de 30 segundos (solo la primera vez)
  useEffect(() => {
    const hasSeenChat = localStorage.getItem('whatsapp-chat-seen')
    if (!hasSeenChat) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('whatsapp-chat-seen', 'true')
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [])

  const sendToWhatsApp = (text: string) => {
    const encodedMessage = encodeURIComponent(text)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      sendToWhatsApp(message)
      setMessage('')
    }
  }

  const handleQuickMessage = (quickMessage: string) => {
    sendToWhatsApp(quickMessage)
  }

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-[750]">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 animate-pulse"
            aria-label="Abrir chat de WhatsApp"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {/* Chat expandido */}
        {isOpen && (
          <div className="bg-white rounded-lg shadow-2xl w-80 max-w-[calc(100vw-2rem)] border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-green-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-500 font-bold text-sm">AT</span>
                </div>
                <div>
                  <h3 className="font-semibold">Arca Tierra</h3>
                  <p className="text-xs text-green-100">En línea</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-green-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del chat */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Mensaje de bienvenida */}
              <div className="mb-4">
                <div className="bg-gray-100 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Equipo Arca Tierra</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    ¡Hola! 👋 Somos el equipo de Arca Tierra. ¿En qué podemos ayudarte hoy?
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Respuesta típica en pocos minutos
                </p>
              </div>

              {/* Mensajes rápidos */}
              {showQuickMessages && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Mensajes rápidos:
                  </p>
                  <div className="space-y-2">
                    {QUICK_MESSAGES.map((quickMessage, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickMessage(quickMessage)}
                        className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        {quickMessage}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowQuickMessages(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Escribir mensaje personalizado
                  </button>
                </div>
              )}

              {/* Input de mensaje personalizado */}
              {!showQuickMessages && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribe tu mensaje..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="bg-green-500 hover:bg-green-600 text-white px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <button
                    onClick={() => setShowQuickMessages(true)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Volver a mensajes rápidos
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-600">
                Powered by{' '}
                <span className="font-semibold text-green-600">WhatsApp</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay para cerrar en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

