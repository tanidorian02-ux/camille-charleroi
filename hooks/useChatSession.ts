import { useRef, useState } from 'react'
import type { Message, Language } from '@/lib/types'
import { WELCOME, MAX_HISTORY, type Turn } from '@/lib/chatbot.constants'

const RE_ACCENTS   = /[̀-ͯ]/g
const RE_PUNCT     = /[^\w\s]/g
const RE_STOPWORDS = /\b(je|me|ma|mon|mes|un|une|des|le|la|les|de|du|en|et|ou|est|pour|comment|puis|veux|voudrais|peux|peut|bien|alors|donc|svp|sil vous plait)\b/g
const RE_SPACES    = /\s+/g

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

  // Updates the last bot message in-place (used for streaming tokens).
  function updateLastBotMessage(text: string) {
    setMessages(prev => {
      const updated = [...prev]
      for (let i = updated.length - 1; i >= 0; i--) {
        if (updated[i].role === 'bot') {
          updated[i] = { role: 'bot', text }
          return updated
        }
      }
      return prev
    })
  }

  function resetMessages(lang: Language) {
    setMessages([{ role: 'bot', text: WELCOME[lang] }])
  }

  function resetSession() {
    historyRef.current = []
    cacheRef.current.clear()
  }

  function normalizeForCache(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(RE_ACCENTS, '')
      .replace(RE_PUNCT, ' ')
      .replace(RE_STOPWORDS, ' ')
      .replace(RE_SPACES, ' ')
      .trim()
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isProcessingRef.current) return

    if (audioRef.current) stopAudio()
    else stopTypewriter()

    if (isListeningRef.current) pauseRecognition()

    isProcessingRef.current = true

    // ── Cache hit ─────────────────────────────────────────────────────────────
    const cacheKey = `${langue}:${normalizeForCache(text)}`
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

    // ── Streaming ─────────────────────────────────────────────────────────────
    setMessages(prev => [...prev, { role: 'user', text }])
    setIsPending(true)

    const prevHistory = historyRef.current
    historyRef.current = [...prevHistory, { role: 'user' as const, content: text }].slice(-MAX_HISTORY)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, langue, history: prevHistory, stream: true }),
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer   = ''
      let accumulated = ''
      let botAdded    = false
      let isStatusMsg = false
      let finished    = false

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const chunks = sseBuffer.split('\n\n')
        sseBuffer = chunks.pop() ?? ''

        for (const chunk of chunks) {
          const line = chunk.trim()
          if (!line.startsWith('data: ')) continue
          let event: { t: string; c?: string; message?: string }
          try { event = JSON.parse(line.slice(6)) } catch { continue }

          if (event.t === 'status' && event.c) {
            // Tool call in progress — show interim status message.
            if (!botAdded) {
              setMessages(prev => [...prev, { role: 'bot', text: event.c! }])
              setIsPending(false)
              botAdded    = true
              isStatusMsg = true
            }

          } else if (event.t === 'tok' && event.c) {
            if (isStatusMsg) {
              // First real token replaces the status message entirely.
              accumulated = event.c
              isStatusMsg = false
            } else {
              accumulated += event.c
            }
            if (!botAdded) {
              // First token: replace pending indicator with real bot bubble.
              setMessages(prev => [...prev, { role: 'bot', text: accumulated }])
              setIsPending(false)
              botAdded = true
            } else {
              updateLastBotMessage(accumulated)
            }

          } else if (event.t === 'done') {
            finished = true
            const reply = accumulated

            historyRef.current = [...historyRef.current, { role: 'assistant' as const, content: reply }].slice(-MAX_HISTORY)
            if (cacheRef.current.size >= 30) cacheRef.current.delete(cacheRef.current.keys().next().value!)
            cacheRef.current.set(cacheKey, reply)

            // Text already displayed — start TTS without restarting typewriter.
            speakRaw(reply, langue)
              .then(() => {
                isProcessingRef.current = false
                if (userMicOnRef.current) resumeRecognitionOnly()
              })
            break outer

          } else if (event.t === 'error') {
            const errMsg = event.message ?? 'Une erreur est survenue. Veuillez réessayer.'
            if (!botAdded) {
              addBotMessage(errMsg)
              setIsPending(false)
            } else {
              updateLastBotMessage(errMsg)
            }
            historyRef.current  = prevHistory
            isProcessingRef.current = false
            break outer
          }
        }
      }

      // Guard: stream closed without 'done' but we have partial text.
      if (!finished && accumulated) {
        historyRef.current = [...historyRef.current, { role: 'assistant' as const, content: accumulated }].slice(-MAX_HISTORY)
        cacheRef.current.set(cacheKey, accumulated)
        speakRaw(accumulated, langue)
          .then(() => {
            isProcessingRef.current = false
            if (userMicOnRef.current) resumeRecognitionOnly()
          })
      } else if (!finished && !accumulated) {
        historyRef.current = prevHistory
        if (!botAdded) {
          addBotMessage('Une erreur est survenue. Veuillez réessayer.')
          setIsPending(false)
        }
        isProcessingRef.current = false
      }

    } catch {
      historyRef.current = prevHistory
      addBotMessage('Une erreur est survenue. Veuillez réessayer.')
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
