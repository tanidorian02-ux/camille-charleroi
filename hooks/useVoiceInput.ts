import { useRef, useState } from 'react'
import type { Language } from '@/lib/types'
import {
  LANG_SPEECH,
  CONFIDENCE_THRESHOLD,
  RMS_THRESHOLD,
  BARGE_IN_MIN_FRAMES,
  SUSTAINED_VAD_FRAMES,
  FILLER_RE,
  MIN_WORDS,
  SILENCE_TIMEOUT,
  correctSTT,
} from '@/lib/chatbot.constants'

interface UseVoiceInputParams {
  langueRef:            React.MutableRefObject<Language>
  isSpeakingRef:        React.MutableRefObject<boolean>
  isProcessingRef:      React.MutableRefObject<boolean>
  audioRef:             React.MutableRefObject<HTMLAudioElement | null>
  analyserRef:          React.MutableRefObject<AnalyserNode | null>
  baselineEchoRmsRef:   React.MutableRefObject<number>
  bargeInMutedRef:      React.MutableRefObject<boolean>
  bargeInFrameCountRef: React.MutableRefObject<number>
  stopAudio:            () => void
  onTranscript:         (text: string) => void
  onError:              (msg: string) => void
}

export function useVoiceInput({
  langueRef,
  isSpeakingRef,
  isProcessingRef,
  audioRef,
  analyserRef,
  baselineEchoRmsRef,
  bargeInMutedRef,
  bargeInFrameCountRef,
  stopAudio,
  onTranscript,
  onError,
}: UseVoiceInputParams) {
  const [isListening, setIsListening] = useState(false)
  const [vadActive, setVadActive]     = useState(false)
  const [interimText, setInterimText] = useState('')

  const isListeningRef    = useRef(false)
  const vadActiveRef      = useRef(false)
  const audioCtxRef       = useRef<AudioContext | null>(null)
  const streamRef         = useRef<MediaStream | null>(null)
  const rmsRafRef         = useRef<number | null>(null)
  const silenceTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accTranscriptRef  = useRef('')
  const recognitionRef    = useRef<any>(null)
  const userMicOnRef      = useRef(false)
  const calibratedRmsRef  = useRef(RMS_THRESHOLD)

  function setListening(val: boolean) {
    isListeningRef.current = val
    setIsListening(val)
  }

  function clearAccumulatedSpeech() {
    accTranscriptRef.current = ''
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }

  function armSilenceTimer() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

    silenceTimerRef.current = setTimeout(() => {
      silenceTimerRef.current = null
      const text = accTranscriptRef.current.trim()
      accTranscriptRef.current = ''
      setInterimText('')

      if (!text) return
      if (FILLER_RE.test(text)) return
      const wordCount = text.split(/\s+/).filter(Boolean).length
      if (wordCount < MIN_WORDS && text.length < 12) return

      // Still processing — preserve transcript and retry after a short delay.
      if (isProcessingRef.current) {
        accTranscriptRef.current = text
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null
          const pending = accTranscriptRef.current.trim()
          if (!pending) return
          if (!isProcessingRef.current) {
            accTranscriptRef.current = ''
            setInterimText('')
            onTranscript(pending)
          } else {
            accTranscriptRef.current = pending
            armSilenceTimer()
          }
        }, 600)
        return
      }

      onTranscript(text)
    }, SILENCE_TIMEOUT)
  }

  function startRmsAnalysis(stream: MediaStream) {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
    const ctx      = new AudioCtx()
    const source   = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize               = 256
    analyser.smoothingTimeConstant = 0.8

    // High-pass filter: cuts low-frequency vibrations (footsteps, table taps < 200Hz)
    // while preserving speech (fundamental starts at ~85Hz but harmonics from 200Hz+).
    const highpass = ctx.createBiquadFilter()
    highpass.type            = 'highpass'
    highpass.frequency.value = 200
    highpass.Q.value         = 0.7
    source.connect(highpass)
    highpass.connect(analyser)

    audioCtxRef.current = ctx
    analyserRef.current = analyser

    // Reset to default so calibration always runs fresh on each mic session.
    calibratedRmsRef.current = RMS_THRESHOLD

    const data = new Uint8Array(analyser.frequencyBinCount)

    // Collect ambient RMS for 1s to set a context-aware VAD threshold.
    let calibDone = false
    const ambientSamples: number[] = []
    const calibDeadline = performance.now() + 1000

    function tick() {
      if (!analyserRef.current) return
      analyserRef.current.getByteTimeDomainData(data)

      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)

      if (!calibDone) {
        if (performance.now() < calibDeadline) {
          ambientSamples.push(rms)
        } else if (ambientSamples.length > 0) {
          const mean = ambientSamples.reduce((a, b) => a + b, 0) / ambientSamples.length
          calibratedRmsRef.current = Math.max(0.08, Math.min(0.20, mean * 2.5))
          calibDone = true
        }
      }

      // During playback use the echo-calibrated threshold; otherwise use ambient-calibrated threshold.
      const dynamicThreshold = (audioRef.current && baselineEchoRmsRef.current > 0)
        ? baselineEchoRmsRef.current
        : calibratedRmsRef.current

      const active = rms > dynamicThreshold

      if (active !== vadActiveRef.current) {
        vadActiveRef.current = active
        setVadActive(active)
      }

      if (active && !bargeInMutedRef.current) {
        bargeInFrameCountRef.current++

        // Only reset silence timer if voice is sustained — ignores transient taps/knocks.
        if (bargeInFrameCountRef.current >= SUSTAINED_VAD_FRAMES &&
            silenceTimerRef.current && accTranscriptRef.current.trim()) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
          armSilenceTimer()
        }

        // Barge-in: require N consecutive frames above threshold to avoid false positives.
        if (bargeInFrameCountRef.current >= BARGE_IN_MIN_FRAMES && audioRef.current) {
          stopAudio()
        }
      } else {
        bargeInFrameCountRef.current = 0
      }

      rmsRafRef.current = requestAnimationFrame(tick)
    }
    rmsRafRef.current = requestAnimationFrame(tick)
  }

  function stopRmsAnalysis() {
    if (rmsRafRef.current !== null) {
      cancelAnimationFrame(rmsRafRef.current)
      rmsRafRef.current = null
    }
    analyserRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    vadActiveRef.current = false
    setVadActive(false)
  }

  function startRecognitionEngine() {
    const SR = typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null
    if (!SR || !streamRef.current) return

    const recognition           = new SR()
    recognition.lang            = LANG_SPEECH[langueRef.current]
    recognition.continuous      = true
    recognition.interimResults  = true
    recognition.maxAlternatives = 1
    recognitionRef.current      = recognition

    recognition.onstart = () => setListening(true)

    // Auto-restart if the browser closes the stream — but not while Camille is speaking/processing.
    recognition.onend = () => {
      if (
        isListeningRef.current &&
        recognitionRef.current &&
        !isSpeakingRef.current &&
        !isProcessingRef.current
      ) {
        try { recognition.start() } catch {}
      } else {
        setListening(false)
        setInterimText('')
      }
    }

    recognition.onerror = (e: any) => {
      if (
        e.error === 'not-allowed' ||
        e.error === 'service-not-allowed' ||
        e.error === 'audio-capture'
      ) {
        stopMic()
        onError("Accès au microphone perdu. Vérifiez les permissions de votre navigateur.")
      }
      // 'no-speech', 'aborted' → benign in continuous mode, recognition restarts itself.
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let addedFinal = false

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) {
          if (isSpeakingRef.current) continue  // discard finals while Camille is speaking
          const conf = r[0].confidence
          if (!conf || conf >= CONFIDENCE_THRESHOLD) {
            const corrected = correctSTT(r[0].transcript.trim())
            accTranscriptRef.current += (accTranscriptRef.current ? ' ' : '') + corrected
            addedFinal = true
          }
        } else {
          interim += r[0].transcript
        }
      }

      const preview = [accTranscriptRef.current, interim].filter(Boolean).join(' ')
      setInterimText(preview)

      // Reset timer only when new speech content is confirmed by sustained VAD.
      // Taps produce 1-3 VAD frames and may generate STT noise — both checks
      // must pass to avoid restarting the timer on transient sounds.
      if (addedFinal || (interim.trim() && bargeInFrameCountRef.current >= SUSTAINED_VAD_FRAMES)) {
        armSilenceTimer()
      }
    }

    try { recognition.start() } catch {}
  }

  function pauseRecognition() {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    accTranscriptRef.current = ''
    setInterimText('')
    setListening(false)
  }

  function stopMic() {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    stopRmsAnalysis()
    clearAccumulatedSpeech()
    userMicOnRef.current = false
    setListening(false)
    setInterimText('')
  }

  function resumeRecognitionOnly() {
    if (!userMicOnRef.current || !streamRef.current || isProcessingRef.current) return
    accTranscriptRef.current = ''
    startRecognitionEngine()
  }

  async function handleMic() {
    // Manual barge-in: if Camille is speaking, cut her off.
    // Do NOT restart the mic here — sendMessage's .then() chain handles it.
    if (isSpeakingRef.current) {
      stopAudio()
      isProcessingRef.current = false
      return
    }
    if (isListeningRef.current) { stopMic(); return }

    const SR = typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null

    if (!SR) {
      onError("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez le mode écrit.")
      return
    }

    if (streamRef.current) stopRmsAnalysis()

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
    } catch {
      onError("Accès au microphone refusé. Vérifiez les permissions de votre navigateur.")
      return
    }

    userMicOnRef.current = true
    startRmsAnalysis(stream)
    startRecognitionEngine()
  }

  function cleanup() {
    recognitionRef.current?.abort()
    stopRmsAnalysis()
    clearAccumulatedSpeech()
  }

  return {
    isListening,
    isListeningRef,
    vadActive,
    interimText,
    userMicOnRef,
    handleMic,
    stopMic,
    pauseRecognition,
    resumeRecognitionOnly,
    clearAccumulatedSpeech,
    stopRmsAnalysis,
    cleanup,
  }
}
