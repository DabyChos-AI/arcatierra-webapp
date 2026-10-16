// TYP1 (R11, sesión 50): tipos de `react-speech-recognition` 4.0.1. El paquete no trae `.d.ts` y no hay `@types`
// instalado; antes `src/hooks/useVoiceSearch.ts` lo importaba con `@ts-ignore` (todo `any`).
// Solo declara lo que existe en `node_modules/react-speech-recognition/dist/index.js` (4.0.1). Si se actualiza el
// paquete, se revisa contra su `dist`.
declare module 'react-speech-recognition' {
  /** `startListening` solo lee estas dos llaves (4.0.1). */
  export interface ListeningOptions {
    continuous?: boolean
    language?: string
  }

  export interface Command {
    command: string | string[] | RegExp
    callback(...args: unknown[]): unknown
    isFuzzyMatch?: boolean
    matchInterim?: boolean
    fuzzyMatchingThreshold?: number
    bestMatchOnly?: boolean
  }

  export interface SpeechRecognitionOptions {
    transcribing?: boolean
    clearTranscriptOnListen?: boolean
    commands?: ReadonlyArray<Command>
  }

  export interface SpeechRecognitionState {
    transcript: string
    interimTranscript: string
    finalTranscript: string
    listening: boolean
    isMicrophoneAvailable: boolean
    resetTranscript: () => void
    browserSupportsSpeechRecognition: boolean
    browserSupportsContinuousListening: boolean
  }

  export function useSpeechRecognition(options?: SpeechRecognitionOptions): SpeechRecognitionState

  interface SpeechRecognitionApi {
    startListening(options?: ListeningOptions): Promise<void>
    stopListening(): Promise<void>
    abortListening(): Promise<void>
    browserSupportsSpeechRecognition(): boolean
    browserSupportsContinuousListening(): boolean
    applyPolyfill(polyfill: unknown): void
    removePolyfill(): void
    getRecognition(): unknown
  }

  const SpeechRecognition: SpeechRecognitionApi
  export default SpeechRecognition
}
