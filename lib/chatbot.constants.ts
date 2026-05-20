// Global constants: welcome messages, suggestion chips, VAD/barge-in thresholds,
// STT post-correction rules for Belgian place names, and session limits.

import type { Language } from '@/lib/types'

export const WELCOME: Record<Language, string> = {
  fr: "Bonjour ! Je suis Camille, votre assistante de la Ville de Charleroi. Comment puis-je vous aider aujourd'hui ?",
  nl: "Goedag! Ik ben Camille, uw assistent van de Stad Charleroi. Hoe kan ik u vandaag helpen?",
  en: "Hello! I'm Camille, your assistant from the City of Charleroi. How can I help you today?",
}

export const SUGGESTIONS: Record<Language, Array<{ label: string; question: string }>> = {
  fr: [
    { label: "Comment obtenir un acte de naissance ?",   question: "Comment obtenir un acte de naissance ?" },
    { label: "Horaires de la maison communale ?",         question: "Quelles sont les heures d'ouverture de la maison communale ?" },
    { label: "Demande de permis de construire ?",        question: "Comment déposer une demande de permis de construire ?" },
    { label: "Signaler un problème de voirie ?",         question: "Comment signaler un problème de voirie ?" },
  ],
  nl: [
    { label: "Hoe een geboorteakte aanvragen?",          question: "Hoe vraag ik een geboorteakte aan?" },
    { label: "Openingsuren stadhuis?",                   question: "Wat zijn de openingsuren van het stadhuis?" },
    { label: "Bouwvergunning aanvragen?",                question: "Hoe dien ik een bouwvergunningaanvraag in?" },
    { label: "Wegprobleem melden?",                      question: "Hoe meld ik een wegprobleem?" },
  ],
  en: [
    { label: "How to get a birth certificate?",          question: "How do I get a birth certificate?" },
    { label: "City Hall opening hours?",                 question: "What are the City Hall opening hours?" },
    { label: "Building permit application?",             question: "How do I apply for a building permit?" },
    { label: "Report a road issue?",                     question: "How do I report a road problem?" },
  ],
}

export const LANG_SPEECH: Record<Language, string> = { fr: 'fr-BE', nl: 'nl-BE', en: 'en-US' }

export const STATUS_TOOL: Record<Language, string> = {
  fr: 'Je vérifie vos informations…',
  nl: 'Ik controleer uw gegevens…',
  en: 'Let me check your information…',
}

export const CONFIDENCE_THRESHOLD = 0.30
export const MAX_HISTORY          = 6

export const SILENCE_TIMEOUT = 2500
export const RMS_THRESHOLD   = 0.12
export const MIN_WORDS        = 3
export const FILLER_RE        = /^$/

export const BARGE_IN_MUTE_MS       = 0
export const BARGE_IN_BOOST         = 1.0
export const BARGE_IN_MAX_THRESHOLD = 0
export const BARGE_IN_MIN_FRAMES    = 0
export const SUSTAINED_VAD_FRAMES   = 0

export const STT_CORRECTIONS: Array<[RegExp, string]> = []

export function correctSTT(text: string): string {
  return text
}

export type Turn = { role: 'user' | 'assistant'; content: string }
