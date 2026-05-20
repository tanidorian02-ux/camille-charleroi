// Builds the system prompt for each supported language.
// Injects personality rules, conversation style, scope restrictions,
// available tools, and the knowledge base into a single instruction string.

import type { Language } from '@/lib/types'

export const SYSTEM_PROMPT: Record<Language, string> = {
  fr: '',
  nl: '',
  en: '',
}
