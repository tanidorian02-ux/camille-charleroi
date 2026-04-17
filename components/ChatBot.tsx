'use client'

import { useState, useRef, useEffect } from 'react'
import type { Message, Language, ChatMode } from '@/lib/types'

const WELCOME: Record<Language, string> = {
  fr: "Bonjour ! Je suis Camille, votre assistante de la Ville de Charleroi. Comment puis-je vous aider aujourd'hui ?",
  nl: "Goedag! Ik ben Camille, uw assistent van de Stad Charleroi. Hoe kan ik u vandaag helpen?",
  en: "Hello! I'm Camille, your assistant from the City of Charleroi. How can I help you today?",
}

const SUGGESTIONS: Record<Language, Array<{ label: string; question: string }>> = {
  fr: [
    { label: "Comment obtenir un acte de naissance ?",    question: "Comment obtenir un acte de naissance ?" },
    { label: "Horaires de la maison communale ?",          question: "Quelles sont les heures d'ouverture de la maison communale ?" },
    { label: "Demande de permis de construire ?",         question: "Comment déposer une demande de permis de construire ?" },
    { label: "Signaler un problème de voirie ?",          question: "Comment signaler un problème de voirie ?" },
  ],
  nl: [
    { label: "Hoe een geboorteakte aanvragen?",           question: "Hoe vraag ik een geboorteakte aan?" },
    { label: "Openingsuren stadhuis?",                    question: "Wat zijn de openingsuren van het stadhuis?" },
    { label: "Bouwvergunning aanvragen?",                 question: "Hoe dien ik een bouwvergunningaanvraag in?" },
    { label: "Wegprobleem melden?",                       question: "Hoe meld ik een wegprobleem?" },
  ],
  en: [
    { label: "How to get a birth certificate?",           question: "How do I get a birth certificate?" },
    { label: "City Hall opening hours?",                  question: "What are the City Hall opening hours?" },
    { label: "Building permit application?",              question: "How do I apply for a building permit?" },
    { label: "Report a road issue?",                      question: "How do I report a road problem?" },
  ],
}

const LANG_SPEECH: Record<Language, string> = { fr: 'fr-BE', nl: 'nl-BE', en: 'en-US' }
const CONFIDENCE_THRESHOLD = 0.30
const MAX_HISTORY          = 6

// ── VAD (Voice Activity Detection) ────────────────────────────────────────────
// Délai de silence avant d'envoyer la phrase accumulée
const SILENCE_TIMEOUT = 2500
// Seuil RMS de détection vocale (0–1). En dessous = bruit de fond ignoré.
const RMS_THRESHOLD   = 0.12
// Mots minimum dans le transcript pour déclencher un envoi
const MIN_WORDS       = 3
// Mots de remplissage qui seuls ne justifient pas un envoi
const FILLER_RE       = /^(euh+|ah+|mmm+|hm+|hein|bah|ben|ouais|voilà?|okay|ok)\s*[,;.!?]*$/i

// ── Écho & Barge-In ───────────────────────────────────────────────────────────
const BARGE_IN_MUTE_MS  = 1500  // immunité initiale après canplaythrough (1,5 s)
// Seuil adaptatif = RMS écho mesuré × BARGE_IN_BOOST
// 2.0 : l'utilisateur doit parler 2× plus fort que l'écho calibré
const BARGE_IN_BOOST    = 2.0
// Plafond absolu du seuil barge-in : évite qu'un écho fort (haut-parleur proche)
// rende l'interruption impossible
const BARGE_IN_MAX_THRESHOLD = 0.28
// Frames RMS consécutives au-dessus du seuil avant barge-in (~200 ms à 60 fps)
const BARGE_IN_MIN_FRAMES = 12

// ── Dictionnaire de correction STT (Post-traitement phonétique) ───────────────
// Termes belges fréquemment mal transcrits par le moteur de reconnaissance vocale.
// Appliqué sur chaque résultat final AVANT d'accumuler dans accTranscriptRef.
const STT_CORRECTIONS: Array<[RegExp, string]> = [
  // Bourgmestre — orthographes fautives courantes
  [/\bbourg\s*ma[iî]tr[ae]?\b/gi,   'bourgmestre'],
  [/\bbourm?[ae]str[ae]?\b/gi,      'bourgmestre'],
  [/\bbourg\s*me?str[ae]?\b/gi,     'bourgmestre'],
  [/\bbourg\s*m[eè]tr[ae]?\b/gi,    'bourgmestre'],
  // Quartiers de Charleroi
  [/\bmarsin[ae]l+[ae]?\b/gi,       'Marcinelle'],
  [/\bmarsin[eè]l\b/gi,             'Marcinelle'],
  [/\bgossel[iï]s?\b/gi,            'Gosselies'],
  [/\bgos+[ae]l[iï]e?s?\b/gi,       'Gosselies'],
  [/\bgil+[iy]\b/gi,                'Gilly'],
  [/\bchat[ei]lin[ea]u\b/gi,        'Châtelet'],
  [/\bcoul+[iy][ae]t?\b/gi,         'Couillet'],
  [/\bmont[iy]gn[iy][eè]s?\b/gi,    'Montignies'],
  [/\bmontig[ny]\b/gi,              'Montignies'],
  // Institutions
  [/\bc[\s-]?p[\s-]?a[\s-]?s\b/gi,  'CPAS'],
  [/\burban[iï]sm[ae]?\b/gi,        'urbanisme'],
]

function correctSTT(text: string): string {
  let result = text
  for (const [pattern, replacement] of STT_CORRECTIONS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

type Turn = { role: 'user' | 'assistant'; content: string }

export default function ChatBot() {
  // ── States ──────────────────────────────────────────────────────────────────
  const [langue, setLangue]               = useState<Language>('fr')
  const [mode, setMode]                   = useState<ChatMode>('vocal')
  const [messages, setMessages]           = useState<Message[]>([{ role: 'bot', text: WELCOME.fr }])
  const [isListening, setIsListening]     = useState(false)
  const [isSpeaking, setIsSpeaking]       = useState(false)
  const [isPending, setIsPending]         = useState(false)
  const [chatInput, setChatInput]         = useState('')
  const [interimText, setInterimText]     = useState('')   // ghost bubble
  const [typingDisplayed, setTypingDisplayed] = useState('')
  const [isTyping, setIsTyping]           = useState(false)
  const [welcomeReady, setWelcomeReady]   = useState(false)
  const [vadActive, setVadActive]         = useState(false) // voix RMS détectée

  // ── Refs stables ─────────────────────────────────────────────────────────────
  const transcriptRef    = useRef<HTMLDivElement>(null)
  const audioRef         = useRef<HTMLAudioElement | null>(null)
  const recognitionRef   = useRef<any>(null)
  const historyRef       = useRef<Turn[]>([])
  const cacheRef         = useRef<Map<string, string>>(new Map())
  const typeTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingFullRef    = useRef('')
  const speakResolveRef  = useRef<(() => void) | null>(null)
  const welcomePlayedRef = useRef(false)

  // Refs VAD / mode continu
  const silenceTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accTranscriptRef = useRef('')          // finals accumulés (mode continu)
  const analyserRef      = useRef<AnalyserNode | null>(null)
  const audioCtxRef      = useRef<AudioContext | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)
  const rmsRafRef        = useRef<number | null>(null)

  // Refs miroir des states — lisibles dans les callbacks sans stale closure
  const isListeningRef      = useRef(false)
  const isProcessingRef     = useRef(false)   // verrou global API + audio
  const isSpeakingRef       = useRef(false)   // true pendant la lecture ElevenLabs
  const vadActiveRef        = useRef(false)
  const baselineEchoRmsRef  = useRef(0)       // RMS d'écho calibré
  const bargeInMutedRef     = useRef(false)   // immunité post-canplaythrough
  const bargeInFrameCountRef = useRef(0)      // frames consécutives au-dessus du seuil
  const audioBlobUrlRef     = useRef<string | null>(null)
  const userMicOnRef        = useRef(false)              // user intent : micro activé
  const langueRef           = useRef<Language>('fr')     // miroir ref de langue
  const speakAbortRef       = useRef<AbortController | null>(null) // annule fetch en cours

  // ── Scroll automatique ───────────────────────────────────────────────────────
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, typingDisplayed])

  // ── Sync langueRef ───────────────────────────────────────────────────────────
  useEffect(() => { langueRef.current = langue }, [langue])

  // ── Cleanup au démontage ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      stopRmsAnalysis()
      stopTypewriter()
      speakResolveRef.current?.()
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Autoplay message d'accueil ───────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (welcomePlayedRef.current) return
      playWelcome('fr').catch(() => setWelcomeReady(true))
    }, 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function playWelcome(l: Language) {
    if (welcomePlayedRef.current) return
    welcomePlayedRef.current = true
    await speakRaw(WELCOME[l], l)
  }

  // ── Helpers état + ref synchronisés ─────────────────────────────────────────
  function setListening(val: boolean) {
    isListeningRef.current = val
    setIsListening(val)
  }

  // ── Typewriter ───────────────────────────────────────────────────────────────
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

    const totalChars        = text.length
    const defaultIntervalMs = 28
    const intervalMs        = audioDurationMs
      ? Math.max(8, (audioDurationMs * 0.9) / totalChars)
      : defaultIntervalMs

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

  function finalizeTypewriter() {
    stopTypewriter()
    const full = typingFullRef.current
    if (!full) return
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
    setTypingDisplayed('')
    typingFullRef.current = ''
  }

  // ── Audio (ElevenLabs) ───────────────────────────────────────────────────────
  function setSpeakingSync(val: boolean) {
    isSpeakingRef.current = val
    setIsSpeaking(val)
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.onended = null   // supprime les handlers AVANT pause
      audioRef.current.onerror = null   // évite onerror sur blob déjà révoqué
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
    speakResolveRef.current    = null
    // Réinitialise écho + compteur barge-in + transcript accumulé
    // (le transcript pourrait contenir la voix de Camille captée avant le barge-in)
    baselineEchoRmsRef.current  = 0
    bargeInMutedRef.current     = false
    bargeInFrameCountRef.current = 0
    accTranscriptRef.current    = ''
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }

  function speakRaw(text: string, currentLangue: Language, onReady?: (durationMs: number) => void): Promise<void> {
    // Annule tout fetch audio encore en vol pour éviter la superposition de chunks
    speakAbortRef.current?.abort()
    const controller = new AbortController()
    speakAbortRef.current = controller

    stopAudio()
    return new Promise(resolve => {
      speakResolveRef.current = resolve
      fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langue: currentLangue }),
        signal: controller.signal,
      })
        .then(res => { if (!res.ok) throw new Error(); return res.blob() })
        .then(blob => {
          const url   = URL.createObjectURL(blob)
          audioBlobUrlRef.current = url   // mémorisé pour révocation dans stopAudio()
          const audio = new Audio(url)
          audioRef.current = audio

          // Calibration typewriter + écho
          audio.addEventListener('canplaythrough', () => {
            onReady?.(audio.duration * 1000)

            // Mute window : ignore les résultats STT pendant BARGE_IN_MUTE_MS
            // (empêche l'écho des enceintes de déclencher immédiatement le barge-in)
            bargeInMutedRef.current = true
            setTimeout(() => { bargeInMutedRef.current = false }, BARGE_IN_MUTE_MS)

            // Calibration écho : mesure le RMS du micro après la fenêtre de mute
            // pour estimer le volume de l'écho et fixer le seuil de barge-in
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
                // Seuil = écho mesuré × 1.20 (l'utilisateur doit parler 20 % plus fort)
                baselineEchoRmsRef.current = Math.min(
                  Math.max(echoRms * BARGE_IN_BOOST, RMS_THRESHOLD),
                  BARGE_IN_MAX_THRESHOLD
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
        .catch((err) => {
          // Fetch annulé volontairement (nouveau speakRaw) — résoudre silencieusement
          if ((err as any)?.name === 'AbortError') { resolve(); return }
          setSpeakingSync(false)
          speakResolveRef.current = null
          resolve()
        })
    })
  }

  // ── RMS Analysis (AudioContext) ──────────────────────────────────────────────
  // Analyse le volume en temps réel pour :
  //   • Barge-in propre (RMS > seuil → coupe l'audio de Camille)
  //   • Breathing window (parole reprend → réinitialise le silence timer)
  //   • Indicateur visuel vadActive
  function startRmsAnalysis(stream: MediaStream) {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
    const ctx      = new AudioCtx()
    const source   = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize               = 256
    analyser.smoothingTimeConstant = 0.8
    source.connect(analyser)
    audioCtxRef.current = ctx
    analyserRef.current = analyser

    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      if (!analyserRef.current) return
      analyserRef.current.getByteTimeDomainData(data)

      // Calcul RMS
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)

      // Seuil adaptatif : pendant la lecture, utilise le RMS écho calibré × 1.20
      // afin que l'écho passif des enceintes ne déclenche pas le barge-in
      const dynamicThreshold = (audioRef.current && baselineEchoRmsRef.current > 0)
        ? baselineEchoRmsRef.current
        : RMS_THRESHOLD

      const active = rms > dynamicThreshold

      // Mise à jour état visuel uniquement si changement (évite re-renders inutiles)
      if (active !== vadActiveRef.current) {
        vadActiveRef.current = active
        setVadActive(active)
      }

      if (active && !bargeInMutedRef.current) {
        bargeInFrameCountRef.current++

        // Breathing window : si la parole reprend, réinitialise le silence timer
        if (silenceTimerRef.current && accTranscriptRef.current.trim()) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
          armSilenceTimer()
        }

        // Barge-in propre : exige BARGE_IN_MIN_FRAMES frames consécutives au-dessus
        // du seuil pour éviter les faux positifs (claquement, transitoire sonore…)
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

  // ── Silence Timer (VAD déclencheur d'envoi) ──────────────────────────────────
  // Lance/réinitialise le compte à rebours. À l'expiration, envoie la phrase
  // accumulée si elle passe les filtres (mots de remplissage, longueur, verrou).
  function armSilenceTimer() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

    silenceTimerRef.current = setTimeout(() => {
      silenceTimerRef.current = null
      const text = accTranscriptRef.current.trim()
      accTranscriptRef.current = ''
      setInterimText('')

      if (!text) return

      // Filtre 1 — mots de remplissage seuls (euh, ah, mmm…)
      if (FILLER_RE.test(text)) return

      // Filtre 2 — phrase trop courte (sens minimal)
      const wordCount = text.split(/\s+/).filter(Boolean).length
      if (wordCount < MIN_WORDS && text.length < 12) return

      // Verrou IS_PROCESSING — Camille encore en train de parler/traiter
      // On préserve le transcript et on relance le timer pour réessayer
      if (isProcessingRef.current) {
        accTranscriptRef.current = text
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null
          const pending = accTranscriptRef.current.trim()
          if (!pending) return
          if (!isProcessingRef.current) {
            accTranscriptRef.current = ''
            setInterimText('')
            sendMessage(pending)
          } else {
            accTranscriptRef.current = pending
            armSilenceTimer()
          }
        }, 600)
        return
      }

      sendMessage(text)
    }, SILENCE_TIMEOUT)
  }

  // ── Envoi message ────────────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || isProcessingRef.current) return

    // Barge-in explicite (bouton / suggestion) : coupe l'audio en cours
    if (audioRef.current) stopAudio()
    else stopTypewriter()

    // Coupe le moteur STT pendant l'appel API + lecture ElevenLabs (anti-écho)
    if (isListeningRef.current) pauseRecognition()

    setInterimText('')
    isProcessingRef.current = true   // verrou global (API + audio)

    // Cache
    const cacheKey = `${langue}:${text.toLowerCase().trim()}`
    const cached   = cacheRef.current.get(cacheKey)
    if (cached) {
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: '' }])
      startTypewriter(cached)
      speakRaw(cached, langue, durationMs => startTypewriter(cached, durationMs))
        .then(() => {
          finalizeTypewriter()
          isProcessingRef.current = false
          if (userMicOnRef.current) resumeRecognitionOnly()  // relance micro si actif
        })
      return
    }

    setMessages(prev => [...prev, { role: 'user', text }])
    setIsPending(true)

    const prevHistory = historyRef.current
    historyRef.current = [...prevHistory, { role: 'user' as const, content: text }].slice(-MAX_HISTORY)

    try {
      const res   = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, langue, history: prevHistory }),
      })
      const data  = await res.json()
      const reply: string = data.reply ?? "Une erreur est survenue. Veuillez réessayer."

      historyRef.current = [...historyRef.current, { role: 'assistant' as const, content: reply }].slice(-MAX_HISTORY)

      if (cacheRef.current.size >= 30) cacheRef.current.delete(cacheRef.current.keys().next().value!)
      cacheRef.current.set(cacheKey, reply)

      setMessages(prev => [...prev, { role: 'bot', text: '' }])
      setIsPending(false)

      startTypewriter(reply)
      speakRaw(reply, langue, durationMs => startTypewriter(reply, durationMs))
        .then(() => {
          finalizeTypewriter()
          isProcessingRef.current = false                    // libère le verrou après l'audio
          if (userMicOnRef.current) resumeRecognitionOnly()  // relance micro si actif
        })

    } catch {
      historyRef.current = prevHistory
      setMessages(prev => [...prev, { role: 'bot', text: "Une erreur est survenue. Veuillez réessayer." }])
      setIsPending(false)
      isProcessingRef.current = false
    }
  }

  // ── Arrêt micro ──────────────────────────────────────────────────────────────
  function stopMic() {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null   // empêche l'auto-restart dans onend
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    stopRmsAnalysis()
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    accTranscriptRef.current = ''
    userMicOnRef.current = false            // intention utilisateur : micro coupé
    setListening(false)
    setInterimText('')
  }

  // ── Pause recognition (sans couper le RMS) ────────────────────────────────────
  // Arrête le moteur STT mais conserve l'analyse RMS (barge-in).
  // N'efface PAS userMicOnRef — le micro sera relancé automatiquement après la parole.
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

  // ── Moteur STT partagé (handleMic + reprise auto) ────────────────────────────
  function startRecognitionEngine() {
    const SR = typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null
    if (!SR || !streamRef.current) return

    const recognition          = new SR()
    recognition.lang           = LANG_SPEECH[langueRef.current]
    recognition.continuous     = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognitionRef.current     = recognition

    recognition.onstart = () => setListening(true)

    // Relance auto si le navigateur ferme le flux — mais PAS pendant la parole/processing
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
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        stopMic()
        setMessages(prev => [...prev, {
          role: 'bot',
          text: "Accès au microphone perdu. Vérifiez les permissions de votre navigateur.",
        }])
      }
      // 'no-speech', 'aborted' → bénins en mode continu, la reconnaissance reprend seule
    }

    recognition.onresult = (event: any) => {
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) {
          // Ignore TOUS les finals pendant que Camille parle
          if (isSpeakingRef.current) continue

          const conf = r[0].confidence
          if (!conf || conf >= CONFIDENCE_THRESHOLD) {
            const corrected = correctSTT(r[0].transcript.trim())
            accTranscriptRef.current +=
              (accTranscriptRef.current ? ' ' : '') + corrected
          }
        } else {
          interim += r[0].transcript
        }
      }

      const preview = [accTranscriptRef.current, interim].filter(Boolean).join(' ')
      setInterimText(preview)

      if (accTranscriptRef.current || interim) {
        armSilenceTimer()
      }
    }

    try { recognition.start() } catch {}
  }

  // ── Reprise automatique du micro après lecture ElevenLabs ─────────────────────
  function resumeRecognitionOnly() {
    if (!userMicOnRef.current || !streamRef.current || isProcessingRef.current) return
    accTranscriptRef.current = ''
    startRecognitionEngine()
  }

  // ── Démarrage micro (mode continu) ───────────────────────────────────────────
  async function handleMic() {
    // Barge-in manuel : si Camille parle, l'interrompre
    // On NE relance PAS le micro ici — la chaîne .then() de sendMessage s'en charge
    // (double appel à resumeRecognitionOnly provoque un conflit entre deux instances SR)
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
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez le mode écrit.",
      }])
      return
    }

    // Ferme le stream/AudioContext précédent avant d'en créer un nouveau
    // (évite le conflit de ressources si l'utilisateur reclique "Démarrer")
    if (streamRef.current) stopRmsAnalysis()

    // getUserMedia pour l'analyse RMS (barge-in + breathing window)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Accès au microphone refusé. Vérifiez les permissions de votre navigateur.",
      }])
      return
    }

    userMicOnRef.current = true   // intention utilisateur : micro activé
    startRmsAnalysis(stream)
    startRecognitionEngine()
  }

  // ── Autres actions ───────────────────────────────────────────────────────────
  function handleChatSend() {
    sendMessage(chatInput)
    setChatInput('')
  }

  function switchLangue(l: Language) {
    stopMic()
    stopAudio()
    historyRef.current = []
    cacheRef.current.clear()
    setInterimText('')
    setLangue(l)
    setMessages([{ role: 'bot', text: WELCOME[l] }])
    welcomePlayedRef.current = false
    setTimeout(() => playWelcome(l).catch(() => {}), 400)
  }

  function clearTranscript() {
    stopMic()
    stopAudio()
    historyRef.current = []
    setInterimText('')
    setMessages([{ role: 'bot', text: WELCOME[langue] }])
  }

  // ── Statuts ──────────────────────────────────────────────────────────────────
  const isWaving = (isListening && vadActive) || isSpeaking
  const status   = isPending
    ? 'Réponse en cours...'
    : isSpeaking
    ? 'Camille parle...'
    : isListening
    ? vadActive ? 'Voix détectée...' : "À l'écoute..."
    : 'En attente'

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <section id="bot" className="bg-brand-dark py-16 sm:py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-red opacity-60" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Titre */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-6 h-[2px] bg-brand-red" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Assistant vocal IA</span>
            <div className="w-6 h-[2px] bg-brand-red" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Bonjour, je suis <span className="text-brand-red">Camille</span>
          </h2>
          <p className="mt-3 text-white/60 text-sm sm:text-base font-light max-w-md mx-auto leading-relaxed">
            Votre assistante vocale pour toutes vos démarches auprès de la Ville de Charleroi.
          </p>

          {/* Bouton accueil — affiché si autoplay a été refusé par le navigateur */}
          {welcomeReady && !isSpeaking && !isListening && (
            <button
              onClick={() => { setWelcomeReady(false); playWelcome(langue).catch(() => {}) }}
              className="mt-3 inline-flex items-center gap-2 text-[11px] text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-4 py-1.5 rounded-full transition-all"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Écouter l&apos;accueil de Camille
            </button>
          )}

          {/* Sélecteur de langue */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {(['fr', 'nl', 'en'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => switchLangue(l)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase border transition-all ${
                  langue === l
                    ? 'bg-brand-red border-brand-red text-white'
                    : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white/70'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Carte chat */}
        <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: 360, maxHeight: 'clamp(420px, calc(100vh - 260px), 640px)' }}>

          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/15 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50">Conversation</span>
            </div>
            <div className="flex bg-white/10 rounded-full p-0.5 gap-0.5">
              <button
                onClick={() => setMode('vocal')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all ${
                  mode === 'vocal' ? 'bg-brand-red text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                Vocal
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase transition-all ${
                  mode === 'chat' ? 'bg-brand-red text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Écrit
              </button>
            </div>
            <button onClick={clearTranscript} className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wide">
              Effacer
            </button>
          </div>

          {/* Fil de messages */}
          <div ref={transcriptRef} className="chat-transcript flex-1 p-5 sm:p-6 flex flex-col gap-2 overflow-y-auto">
            {messages.map((msg, i) => {
              const isLastBot    = msg.role === 'bot' && i === messages.length - 1
              const displayText  = isLastBot && isTyping ? typingDisplayed : msg.text

              return msg.role === 'bot' ? (
                <div key={i} className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex-shrink-0 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    </svg>
                  </div>
                  <div className="bubble-ai">
                    {displayText}
                    {isLastBot && isTyping && (
                      <span className="inline-block w-[2px] h-[1em] bg-white/70 ml-[2px] align-middle animate-pulse" />
                    )}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3 items-start">
                  <div className="ml-auto flex gap-3 items-start flex-row-reverse max-w-xs">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                    </div>
                    <div className="bg-brand-red/80 px-4 py-2.5 text-sm text-white font-light leading-relaxed rounded-lg">
                      {msg.text}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Indicateur "..." pendant la requête API */}
            {isPending && (
              <div className="flex gap-3 items-end">
                <div className="w-8 h-8 rounded-full bg-brand-red flex-shrink-0 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  </svg>
                </div>
                <div className="bubble-ai opacity-60">...</div>
              </div>
            )}
          </div>

          {/* Ghost bubble — texte en cours de transcription (interim + finals accumulés) */}
          {interimText && (
            <div className="px-5 pb-1 flex-shrink-0">
              <div className="ml-auto max-w-xs bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[12px] text-white/40 italic font-light">
                {interimText}
                <span className="inline-block w-[2px] h-[0.9em] bg-white/30 ml-[2px] align-middle animate-pulse" />
              </div>
            </div>
          )}

          {/* Visualiseur d'ondes — animé uniquement si voix détectée ou Camille parle */}
          <div className={`flex items-end justify-center gap-[3px] h-7 px-5 pb-2 flex-shrink-0 transition-opacity duration-300 ${isWaving ? 'opacity-100' : 'opacity-30'}`}>
            {[40, 70, 100, 80, 100, 70, 40].map((h, i) => (
              <div
                key={i}
                className={`wave-bar w-[4px] bg-brand-red rounded-full ${isWaving ? 'animate' : ''}`}
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Barre d'entrée — sticky pour rester visible même si le contenu déborde */}
          <div className="sticky bottom-0 border-t border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0 bg-[#1a1025]/95 backdrop-blur-sm z-10">
            <p className="text-[10px] tracking-[0.12em] uppercase text-white/40 font-medium flex-shrink-0">{status}</p>

            {/* Mode Vocal */}
            {mode === 'vocal' && (
              <div className="flex items-center gap-3 flex-1 justify-end">
                {isSpeaking && (
                  <p className="text-[10px] text-white/30 hidden sm:block">Parlez pour interrompre</p>
                )}
                {isListening && !isSpeaking && !vadActive && (
                  <p className="text-[10px] text-white/30 hidden sm:block">En attente de votre voix...</p>
                )}
                {isListening && vadActive && (
                  <p className="text-[10px] text-white/50 hidden sm:block">Voix captée — 2,5 s de silence pour envoyer</p>
                )}
                {!isListening && (
                  <p className="text-[10px] text-white/30 hidden sm:block">Cliquez et parlez naturellement</p>
                )}
                <button
                  onClick={handleMic}
                  disabled={isPending}
                  className={`inline-flex items-center gap-2 font-semibold text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 rounded-full transition-all disabled:opacity-50 ${
                    isSpeaking
                      ? 'bg-white/20 text-white border border-white/40 hover:bg-white/30'  // interrompre
                      : isListening
                        ? vadActive
                          ? 'bg-white text-brand-black ring-2 ring-white/40'
                          : 'bg-white text-brand-black'
                        : 'bg-brand-red text-white hover:bg-brand-red/90'
                  }`}
                >
                  {isSpeaking
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                  }
                  {isSpeaking ? 'Interrompre' : isListening ? (vadActive ? 'Écoute...' : 'Arrêter') : 'Démarrer'}
                </button>
              </div>
            )}

            {/* Mode Écrit */}
            {mode === 'chat' && (
              <div className="flex flex-1 items-center gap-2">
                <textarea
                  rows={1}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend() }
                  }}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-red resize-none"
                />
                <button
                  onClick={handleChatSend}
                  disabled={isPending || !chatInput.trim()}
                  className="flex items-center justify-center w-10 h-10 bg-brand-red text-white rounded-full flex-shrink-0 hover:bg-brand-red/90 disabled:opacity-50 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Questions fréquentes */}
        <div className="mt-5">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-3">Questions fréquentes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUGGESTIONS[langue].map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.question)}
                disabled={isPending}
                className="text-left px-4 py-3 border border-white/10 rounded-lg text-[12px] text-white/60 font-light hover:border-brand-red hover:text-white hover:bg-white/5 transition-all duration-150 disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Infos de contact */}
        <div className="mt-4 grid grid-cols-3 gap-0 border border-white/10 divide-x divide-white/10 rounded-xl overflow-hidden">
          {[
            { label: "Adresse",   value: "Place Charles II\n6000 Charleroi" },
            { label: "Téléphone", value: "+32 71 86 00 00" },
            { label: "Horaires",  value: "Lun - Ven\n08h30 - 16h30" },
          ].map(item => (
            <div key={item.label} className="p-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-red mb-1.5">{item.label}</p>
              <p className="text-[12px] text-white/60 font-light leading-snug whitespace-pre-line">{item.value}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
