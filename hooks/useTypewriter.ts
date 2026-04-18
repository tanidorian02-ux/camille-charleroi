import { useState, useRef } from 'react'

export function useTypewriter() {
  const [typingDisplayed, setTypingDisplayed] = useState('')
  const [isTyping, setIsTyping]               = useState(false)
  const typeTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingFullRef = useRef('')

  function stopTypewriter() {
    if (typeTimerRef.current !== null) {
      clearTimeout(typeTimerRef.current)
      typeTimerRef.current = null
    }
    setIsTyping(false)
  }

  function startTypewriter(text: string, audioDurationMs?: number) {
    stopTypewriter()
    typingFullRef.current = text
    setIsTyping(true)
    setTypingDisplayed('')

    const totalChars = text.length
    const intervalMs = audioDurationMs
      ? Math.max(8, (audioDurationMs * 0.9) / totalChars)
      : 28

    let i = 0
    function tick() {
      i++
      if (i >= totalChars) {
        setTypingDisplayed(text)
        setIsTyping(false)
        typeTimerRef.current = null
        return
      }
      setTypingDisplayed(text.slice(0, i))
      typeTimerRef.current = setTimeout(tick, intervalMs)
    }
    typeTimerRef.current = setTimeout(tick, intervalMs)
  }

  // Stops the animation and returns the full text so the caller can commit it to messages.
  function finalizeTypewriter(): string {
    stopTypewriter()
    const full = typingFullRef.current
    typingFullRef.current = ''
    setTypingDisplayed('')
    return full
  }

  return { typingDisplayed, isTyping, startTypewriter, stopTypewriter, finalizeTypewriter }
}
