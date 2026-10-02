import { useState, useCallback, useEffect } from 'react'
// @ts-ignore
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

interface VoiceSearchResult {
  isListening: boolean
  transcript: string
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  confidence: number
}

export const useVoiceSearch = (
  onSearchComplete?: (searchText: string) => void,
  language: string = 'es-MX'
): VoiceSearchResult => {
  const [confidence, setConfidence] = useState<number>(0)
  // HID1 (R7): el servidor no tiene SpeechRecognition y el navegador sí; si `isSupported` se calcula en el
  // primer render, el HTML del servidor (sin micrófono) y el del cliente (con micrófono) no coinciden y React
  // reporta un error de hidratación en /tienda. Falso hasta montar; después, lo que diga el navegador.
  const [montado, setMontado] = useState(false)
  useEffect(() => {
    setMontado(true)
  }, [])
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition()  // SIN commands - captura directa sin prefijo "buscar"

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
      console.error('❌ Navegador no soporta reconocimiento de voz')
      return
    }

    console.log('🎤 Iniciando escucha...')
    SpeechRecognition.startListening({ 
      continuous: false,
      language: language,
      interimResults: true
    })
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, language])

  const stopListening = useCallback(() => {
    console.log('🛑 Deteniendo escucha...')
    SpeechRecognition.stopListening()
    
    // Si hay texto transcrito, ejecutar búsqueda automáticamente
    if (transcript.trim() && onSearchComplete) {
      console.log('🔍 Ejecutando búsqueda automática:', transcript.trim())
      onSearchComplete(transcript.trim())
      setConfidence(0.8) // Simular confianza alta
    }
  }, [transcript, onSearchComplete])

  // Auto-stop después de 3 segundos de silencio
  useEffect(() => {
    if (listening) {
      const timer = setTimeout(() => {
        if (listening && transcript.trim()) {
          stopListening()
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [listening, transcript, stopListening])

  return {
    isListening: listening,
    transcript,
    isSupported: montado && browserSupportsSpeechRecognition && isMicrophoneAvailable,
    startListening,
    stopListening,
    resetTranscript,
    confidence
  }
}
