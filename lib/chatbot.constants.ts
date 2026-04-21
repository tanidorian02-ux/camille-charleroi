import type { Language } from '@/lib/types'

export const WELCOME: Record<Language, string> = {
  fr: "Bonjour ! Je suis Camille, votre assistante de la Ville de Charleroi. Comment puis-je vous aider aujourd'hui ?",
  nl: "Goedag! Ik ben Camille, uw assistent van de Stad Charleroi. Hoe kan ik u vandaag helpen?",
  en: "Hello! I'm Camille, your assistant from the City of Charleroi. How can I help you today?",
}

export const SUGGESTIONS: Record<Language, Array<{ label: string; question: string }>> = {
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

export const LANG_SPEECH: Record<Language, string> = { fr: 'fr-BE', nl: 'nl-BE', en: 'en-US' }

export const CONFIDENCE_THRESHOLD = 0.30
export const MAX_HISTORY          = 6

export const SILENCE_TIMEOUT = 2500
export const RMS_THRESHOLD   = 0.12
export const MIN_WORDS       = 3
export const FILLER_RE       = /^(euh+|ah+|mmm+|hm+|hein|bah|ben|ouais|voilà?|okay|ok)\s*[,;.!?]*$/i

export const BARGE_IN_MUTE_MS       = 700
export const BARGE_IN_BOOST         = 2.0
export const BARGE_IN_MAX_THRESHOLD = 0.28
export const BARGE_IN_MIN_FRAMES    = 12

export const STT_CORRECTIONS: Array<[RegExp, string]> = [
  [/\bbourg\s*ma[iî]tr[ae]?\b/gi,   'bourgmestre'],
  [/\bbourm?[ae]str[ae]?\b/gi,      'bourgmestre'],
  [/\bbourg\s*me?str[ae]?\b/gi,     'bourgmestre'],
  [/\bbourg\s*m[eè]tr[ae]?\b/gi,    'bourgmestre'],
  [/\bmarsin[ae]l+[ae]?\b/gi,       'Marcinelle'],
  [/\bmarsin[eè]l\b/gi,             'Marcinelle'],
  [/\bgossel[iï]s?\b/gi,            'Gosselies'],
  [/\bgos+[ae]l[iï]e?s?\b/gi,       'Gosselies'],
  [/\bgil+[iy]\b/gi,                'Gilly'],
  [/\bchat[ei]lin[ea]u\b/gi,        'Châtelet'],
  [/\bcoul+[iy][ae]t?\b/gi,         'Couillet'],
  [/\bmont[iy]gn[iy][eè]s?\b/gi,    'Montignies'],
  [/\bmontig[ny]\b/gi,              'Montignies'],
  [/\bc[\s-]?p[\s-]?a[\s-]?s\b/gi,  'CPAS'],
  [/\burban[iï]sm[ae]?\b/gi,        'urbanisme'],
]

export function correctSTT(text: string): string {
  let result = text
  for (const [pattern, replacement] of STT_CORRECTIONS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

export type Turn = { role: 'user' | 'assistant'; content: string }
