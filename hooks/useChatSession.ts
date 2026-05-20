// Manages the full lifecycle of a chat session: message history, streaming
// SSE token accumulation, response caching, and coordination between
// TTS playback and speech recognition.

import { useRef, useState } from 'react'
import type { Message, Language } from '@/lib/types'
import { WELCOME, type Turn } from '@/lib/chatbot.constants'

interface UseChatSessionParams {
  langue:                Language
  isProcessingRef:       React.MutableRefObject<boolean>
  isListeningRef:        React.MutableRefObject<boolean>
  userMicOnRef:          React.MutableRefObject<boolean>
  audioRef:              React.MutableRefObject<HTMLAudioElement | null>
  speakRaw:              (text: string, lang: Language, onReady?: (durationMs: number) => void) => Promise<void>
  stopAudio:             () => void
  startTypewriter:       (text: string, durationMs?: number) => void
  stopTypewriter:        () => void
  finalizeTypewriter:    () => string
  pauseRecognition:      () => void
  resumeRecognitionOnly: () => void
}

export function useChatSession({
  langue,
}: UseChatSessionParams) {
  const [messages, setMessages]   = useState<Message[]>([{ role: 'bot', text: WELCOME.fr }])
  const [isPending, setIsPending] = useState(false)

  async function sendMessage(_text: string): Promise<void> {}

  function resetMessages(_lang: Language) {}
  function resetSession() {}
  function addBotMessage(_text: string) {}

  return {
    messages,
    setMessages,
    isPending,
    sendMessage,
    addBotMessage,
    resetMessages,
    resetSession,
  }
}
