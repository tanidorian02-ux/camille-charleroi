'use client'

import { useState, useRef, useEffect } from 'react'
import type { Language, ChatMode } from '@/lib/types'
import { WELCOME, SUGGESTIONS } from '@/lib/chatbot.constants'
import { useTypewriter }   from '@/hooks/useTypewriter'
import { useAudioPlayer }  from '@/hooks/useAudioPlayer'
import { useVoiceInput }   from '@/hooks/useVoiceInput'
import { useChatSession }  from '@/hooks/useChatSession'

export default function ChatBot() {
  const [langue, setLangue]           = useState<Language>('fr')
  const [mode, setMode]               = useState<ChatMode>('vocal')
  const [chatInput, setChatInput]     = useState('')
  const [welcomeReady, setWelcomeReady] = useState(false)

  // Shared refs — read/written by multiple hooks.
  const langueRef       = useRef<Language>('fr')
  const isProcessingRef = useRef(false)
  const analyserRef     = useRef<AnalyserNode | null>(null)

  useEffect(() => { langueRef.current = langue }, [langue])

  // Callback refs break the circular dependency between voiceInput ↔ chatSession.
  const sendMessageRef    = useRef<(text: string) => void>(() => {})
  const addBotMsgRef      = useRef<(msg: string) => void>(() => {})
  const clearAccSpeechRef = useRef<() => void>(() => {})

  // ── Hooks (init order matches dependency graph) ──────────────────────────────
  const typewriter = useTypewriter()

  const audioPlayer = useAudioPlayer({
    analyserRef,
    stopTypewriter: typewriter.stopTypewriter,
    onStop: () => clearAccSpeechRef.current(),
  })

  const voiceInput = useVoiceInput({
    langueRef,
    isSpeakingRef:        audioPlayer.isSpeakingRef,
    isProcessingRef,
    audioRef:             audioPlayer.audioRef,
    analyserRef,
    baselineEchoRmsRef:   audioPlayer.baselineEchoRmsRef,
    bargeInMutedRef:      audioPlayer.bargeInMutedRef,
    bargeInFrameCountRef: audioPlayer.bargeInFrameCountRef,
    stopAudio:            audioPlayer.stopAudio,
    onTranscript: (text) => sendMessageRef.current(text),
    onError:      (msg)  => addBotMsgRef.current(msg),
  })

  const chatSession = useChatSession({
    langue,
    isProcessingRef,
    isListeningRef:        voiceInput.isListeningRef,
    userMicOnRef:          voiceInput.userMicOnRef,
    audioRef:              audioPlayer.audioRef,
    speakRaw:              audioPlayer.speakRaw,
    stopAudio:             audioPlayer.stopAudio,
    startTypewriter:       typewriter.startTypewriter,
    stopTypewriter:        typewriter.stopTypewriter,
    finalizeTypewriter:    typewriter.finalizeTypewriter,
    pauseRecognition:      voiceInput.pauseRecognition,
    resumeRecognitionOnly: voiceInput.resumeRecognitionOnly,
  })

  // Wire circular refs (safe: user interactions only happen after render).
  sendMessageRef.current    = chatSession.sendMessage
  addBotMsgRef.current      = chatSession.addBotMessage
  clearAccSpeechRef.current = voiceInput.clearAccumulatedSpeech

  // ── Scroll automatique ───────────────────────────────────────────────────────
  const transcriptRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (transcriptRef.current)
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
  }, [chatSession.messages, typewriter.typingDisplayed])

  // ── Autoplay message d'accueil ───────────────────────────────────────────────
  const welcomePlayedRef = useRef(false)

  async function playWelcome(l: Language) {
    if (welcomePlayedRef.current) return
    welcomePlayedRef.current = true
    await audioPlayer.speakRaw(WELCOME[l], l)
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (welcomePlayedRef.current) return
      playWelcome('fr').catch(() => setWelcomeReady(true))
    }, 1000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Cleanup au démontage ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      voiceInput.cleanup()
      typewriter.stopTypewriter()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Actions UI ───────────────────────────────────────────────────────────────
  function switchLangue(l: Language) {
    voiceInput.stopMic()
    audioPlayer.stopAudio()
    chatSession.resetSession()
    setLangue(l)
    chatSession.resetMessages(l)
    welcomePlayedRef.current = false
    setTimeout(() => playWelcome(l).catch(() => {}), 400)
  }

  function clearTranscript() {
    voiceInput.stopMic()
    audioPlayer.stopAudio()
    chatSession.resetSession()
    chatSession.resetMessages(langue)
  }

  function handleChatSend() {
    chatSession.sendMessage(chatInput)
    setChatInput('')
  }

  // ── Statuts ──────────────────────────────────────────────────────────────────
  const { isListening, vadActive, interimText } = voiceInput
  const { isSpeaking }                          = audioPlayer
  const { messages, isPending }                 = chatSession
  const { typingDisplayed, isTyping }           = typewriter

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
              const isLastBot   = msg.role === 'bot' && i === messages.length - 1
              const displayText = isLastBot && isTyping ? typingDisplayed : msg.text

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

          {/* Ghost bubble */}
          {interimText && (
            <div className="px-5 pb-1 flex-shrink-0">
              <div className="ml-auto max-w-xs bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[12px] text-white/40 italic font-light">
                {interimText}
                <span className="inline-block w-[2px] h-[0.9em] bg-white/30 ml-[2px] align-middle animate-pulse" />
              </div>
            </div>
          )}

          {/* Visualiseur d'ondes */}
          <div className={`flex items-end justify-center gap-[3px] h-7 px-5 pb-2 flex-shrink-0 transition-opacity duration-300 ${isWaving ? 'opacity-100' : 'opacity-30'}`}>
            {[40, 70, 100, 80, 100, 70, 40].map((h, i) => (
              <div
                key={i}
                className={`wave-bar w-[4px] bg-brand-red rounded-full ${isWaving ? 'animate' : ''}`}
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>

          {/* Barre d'entrée */}
          <div className="sticky bottom-0 border-t border-white/10 px-4 py-3 flex items-center gap-3 flex-shrink-0 bg-[#1a1025]/95 backdrop-blur-sm z-10">
            <p className="text-[10px] tracking-[0.12em] uppercase text-white/40 font-medium flex-shrink-0">{status}</p>

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
                  onClick={voiceInput.handleMic}
                  disabled={isPending}
                  className={`inline-flex items-center gap-2 font-semibold text-[11px] tracking-[0.1em] uppercase px-5 py-2.5 rounded-full transition-all disabled:opacity-50 ${
                    isSpeaking
                      ? 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
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
                onClick={() => chatSession.sendMessage(s.question)}
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
