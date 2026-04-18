import { useRef, useState } from 'react'
import type { Language } from '@/lib/types'
import {
  RMS_THRESHOLD,
  BARGE_IN_BOOST,
  BARGE_IN_MAX_THRESHOLD,
  BARGE_IN_MUTE_MS,
} from '@/lib/chatbot.constants'

interface UseAudioPlayerParams {
  analyserRef:    React.MutableRefObject<AnalyserNode | null>
  stopTypewriter: () => void
  // Called when stopAudio() fires so the voice-input hook can clear its accumulator.
  onStop:         () => void
}

export function useAudioPlayer({ analyserRef, stopTypewriter, onStop }: UseAudioPlayerParams) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const isSpeakingRef         = useRef(false)
  const audioRef              = useRef<HTMLAudioElement | null>(null)
  const audioBlobUrlRef       = useRef<string | null>(null)
  const speakResolveRef       = useRef<(() => void) | null>(null)
  const speakAbortRef         = useRef<AbortController | null>(null)
  const baselineEchoRmsRef    = useRef(0)
  const bargeInMutedRef       = useRef(false)
  const bargeInFrameCountRef  = useRef(0)

  function setSpeakingSync(val: boolean) {
    isSpeakingRef.current = val
    setIsSpeaking(val)
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current)
      audioBlobUrlRef.current = null
    }
    setSpeakingSync(false)
    stopTypewriter()
    speakResolveRef.current?.()
    speakResolveRef.current     = null
    baselineEchoRmsRef.current  = 0
    bargeInMutedRef.current     = false
    bargeInFrameCountRef.current = 0
    onStop()
  }

  function speakRaw(
    text: string,
    langue: Language,
    onReady?: (durationMs: number) => void,
  ): Promise<void> {
    speakAbortRef.current?.abort()
    const controller = new AbortController()
    speakAbortRef.current = controller

    stopAudio()
    return new Promise(resolve => {
      speakResolveRef.current = resolve
      fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langue }),
        signal: controller.signal,
      })
        .then(res => { if (!res.ok) throw new Error(); return res.blob() })
        .then(blob => {
          const url = URL.createObjectURL(blob)
          audioBlobUrlRef.current = url
          const audio = new Audio(url)
          audioRef.current = audio

          audio.addEventListener('canplaythrough', () => {
            onReady?.(audio.duration * 1000)

            // Mute window: ignore STT results right after playback starts to avoid
            // the speaker echo immediately triggering barge-in.
            bargeInMutedRef.current = true
            setTimeout(() => { bargeInMutedRef.current = false }, BARGE_IN_MUTE_MS)

            // Echo calibration: measure mic RMS after the mute window to set barge-in threshold.
            if (analyserRef.current) {
              const calibData = new Uint8Array(analyserRef.current.frequencyBinCount)
              setTimeout(() => {
                if (!analyserRef.current) return
                analyserRef.current.getByteTimeDomainData(calibData)
                let sum = 0
                for (let i = 0; i < calibData.length; i++) {
                  const v = (calibData[i] - 128) / 128
                  sum += v * v
                }
                const echoRms = Math.sqrt(sum / calibData.length)
                baselineEchoRmsRef.current = Math.min(
                  Math.max(echoRms * BARGE_IN_BOOST, RMS_THRESHOLD),
                  BARGE_IN_MAX_THRESHOLD,
                )
              }, BARGE_IN_MUTE_MS + 100)
            }
          }, { once: true })

          setSpeakingSync(true)
          audio.play().catch(() => {})

          const cleanup = () => {
            setSpeakingSync(false)
            if (audioBlobUrlRef.current === url) {
              URL.revokeObjectURL(url)
              audioBlobUrlRef.current = null
            }
            baselineEchoRmsRef.current   = 0
            bargeInMutedRef.current      = false
            bargeInFrameCountRef.current = 0
            speakResolveRef.current      = null
            resolve()
          }
          audio.onended = cleanup
          audio.onerror = cleanup
        })
        .catch(err => {
          if ((err as Error)?.name === 'AbortError') { resolve(); return }
          setSpeakingSync(false)
          speakResolveRef.current = null
          resolve()
        })
    })
  }

  return {
    isSpeaking,
    isSpeakingRef,
    audioRef,
    baselineEchoRmsRef,
    bargeInMutedRef,
    bargeInFrameCountRef,
    speakRaw,
    stopAudio,
  }
}
