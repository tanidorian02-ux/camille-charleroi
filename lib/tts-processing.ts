// Pre-processes bot text before sending to ElevenLabs TTS:
// strips markdown, expands Belgian phone numbers digit-by-digit,
// converts French number words to Belgian equivalents (septante/nonante),
// and splits text at sentence boundaries for chunked synthesis.

export function nettoyerTTS(_texte: string): string {
  return ''
}

export function belgiciserNombres(_texte: string): string {
  return ''
}

export function decoupeEnPhrases(_texte: string): string[] {
  return []
}
