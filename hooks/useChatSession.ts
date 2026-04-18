import { useRef, useState } from 'react'
import type { Message, Language } from '@/lib/types'
import { WELCOME, MAX_HISTORY, type Turn } from '@/lib/chatbot.constants'

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
  isProcessingRef,
  isListeningRef,
  userMicOnRef,
  audioRef,
  speakRaw,
  stopAudio,
  startTypewriter,
  stopTypewriter,
  finalizeTypewriter,
  pauseRecognition,
  resumeRecognitionOnly,
}: UseChatSessionParams) {
  const [messages, setMessages]   = useState<Message[]>([{ role: 'bot', text: WELCOME.fr }])
  const [isPending, setIsPending] = useState(false)
  const historyRef = useRef<Turn[]>([])
  const cacheRef   = useRef<Map<string, string>>(new Map())

  function addBotMessage(text: string) {
    setMessages(prev => [...prev, { role: 'bot', text }])
  }

  function resetMessages(lang: Language) {
    setMessages([{ role: 'bot', text: WELCOME[lang] }])
  }

  function resetSession() {
    historyRef.current = []
    cacheRef.current.clear()
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isProcessingRef.current) return

    if (audioRef.current) stopAudio()
    else stopTypewriter()

    if (isListeningRef.current) pauseRecognition()

    isProcessingRef.current = true

    const cacheKey = `${langue}:${text.toLowerCase().trim()}`
    const cached   = cacheRef.current.get(cacheKey)
    if (cached) {
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: '' }])
      startTypewriter(cached)
      speakRaw(cached, langue, durationMs => startTypewriter(cached, durationMs))
        .then(() => {
          const full = finalizeTypewriter()
          if (full) commitLastBotMessage(full)
          isProcessingRef.current = false
          if (userMicOnRef.current) resumeRecognitionOnly()
        })
      return
    }

    setMessages(prev => [...prev, { role: 'user', text }])
    setIsPending(true)

    const prevHistory = historyRef.current
    historyRef.current = [...prevHistory, { role: 'user' as const, content: text }].slice(-MAX_HISTORY)

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, langue, history: prevHistory }),
      })
      const data = await res.json()
      const reply: string = data.reply ?? "Une erreur est survenue. Veuillez réessayer."

      historyRef.current = [
        ...historyRef.current,
        { role: 'assistant' as const, content: reply },
      ].slice(-MAX_HISTORY)

      if (cacheRef.current.size >= 30) cacheRef.current.delete(cacheRef.current.keys().next().value!)
      cacheRef.current.set(cacheKey, reply)

      setMessages(prev => [...prev, { role: 'bot', text: '' }])
      setIsPending(false)

      startTypewriter(reply)
      speakRaw(reply, langue, durationMs => startTypewriter(reply, durationMs))
        .then(() => {
          const full = finalizeTypewriter()
          if (full) commitLastBotMessage(full)
          isProcessingRef.current = false
          if (userMicOnRef.current) resumeRecognitionOnly()
        })

    } catch {
      historyRef.current = prevHistory
      addBotMessage("Une erreur est survenue. Veuillez réessayer.")
      setIsPending(false)
      isProcessingRef.current = false
    }
  }

  // Replaces the last empty bot message with its finalized text.
  function commitLastBotMessage(full: string) {
    setMessages(prev => {
      const updated = [...prev]
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'bot' && !updated[i].text) {
          updated[i] = { role: 'bot', text: full }
          break
        }
      }
      return updated
    })
  }

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
