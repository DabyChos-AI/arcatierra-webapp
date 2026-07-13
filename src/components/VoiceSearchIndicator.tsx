'use client'

import React from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'

interface VoiceSearchIndicatorProps {
  isListening: boolean
  transcript: string
  isSupported: boolean
  confidence?: number
}

export const VoiceSearchIndicator: React.FC<VoiceSearchIndicatorProps> = ({
  isListening,
  transcript,
  isSupported,
  confidence = 0
}) => {
  if (!isSupported) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-500 p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <MicOff className="w-4 h-4" />
          <span className="text-sm">Búsqueda por voz no disponible</span>
        </div>
      </div>
    )
  }

  if (!isListening && !transcript) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white border shadow-xl rounded-lg p-4 max-w-sm ${
        isListening ? 'border-red-400' : 'border-green-400'
      }`}>
        <div className="flex items-start gap-3">
          {/* Icono animado */}
          <div className={`p-2 rounded-full ${
            isListening ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {isListening ? (
              <div className="relative">
                <Mic className="w-5 h-5 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1">
            {/* Estado */}
            <div className={`font-medium text-sm ${
              isListening ? 'text-red-700' : 'text-green-700'
            }`}>
              {isListening ? '🎤 Escuchando...' : '✅ Texto capturado'}
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Texto detectado:</div>
                <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                  "{transcript}"
                </div>
                {confidence > 0 && (
                  <div className="mt-1 text-xs text-gray-400">
                    Confianza: {Math.round(confidence * 100)}%
                  </div>
                )}
              </div>
            )}

            {/* Instrucciones */}
            {isListening && (
              <div className="mt-2 text-xs text-gray-500">
                💡 Di lo que buscas y se detendrá automáticamente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
