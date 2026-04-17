import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/types'

const FALLBACK_VOICE = 'EXAVITQu4vr4xnSDxMaL'

// ── Nettoyage TTS ─────────────────────────────────────────────────────────────
// Supprime les symboles markdown et caractères spéciaux qui perturbent la prosodie.
// Ex: "**Urbanisme** : voir *ici*" → "Urbanisme : voir ici"
// Convertit un numéro belge en version épelée lisible par ElevenLabs
// Ex: "071 86 00 00" → "zéro septante et un, huitante-six, zéro zéro, zéro zéro"
// On utilise une lecture par paires de chiffres, naturelle en Belgique
function formatNumeroTelephone(num: string): string {
  const chiffres = num.replace(/\D/g, '')
  if (chiffres.length < 6) return num

  // Découpe en paires depuis la droite pour respecter le rythme belge
  const paires: string[] = []
  for (let i = 0; i < chiffres.length; i += 2) {
    paires.push(chiffres.slice(i, i + 2))
  }

  const dire: Record<string, string> = {
    '00': 'zéro zéro', '01': 'zéro un', '02': 'zéro deux', '03': 'zéro trois',
    '04': 'zéro quatre', '05': 'zéro cinq', '06': 'zéro six', '07': 'zéro sept',
    '08': 'zéro huit', '09': 'zéro neuf', '10': 'dix', '11': 'onze',
    '12': 'douze', '13': 'treize', '14': 'quatorze', '15': 'quinze',
    '16': 'seize', '17': 'dix-sept', '18': 'dix-huit', '19': 'dix-neuf',
    '20': 'vingt', '21': 'vingt et un', '22': 'vingt-deux', '23': 'vingt-trois',
    '24': 'vingt-quatre', '25': 'vingt-cinq', '26': 'vingt-six', '27': 'vingt-sept',
    '28': 'vingt-huit', '29': 'vingt-neuf', '30': 'trente', '31': 'trente et un',
    '32': 'trente-deux', '33': 'trente-trois', '34': 'trente-quatre', '35': 'trente-cinq',
    '36': 'trente-six', '37': 'trente-sept', '38': 'trente-huit', '39': 'trente-neuf',
    '40': 'quarante', '41': 'quarante et un', '42': 'quarante-deux', '43': 'quarante-trois',
    '44': 'quarante-quatre', '45': 'quarante-cinq', '46': 'quarante-six', '47': 'quarante-sept',
    '48': 'quarante-huit', '49': 'quarante-neuf', '50': 'cinquante', '51': 'cinquante et un',
    '52': 'cinquante-deux', '53': 'cinquante-trois', '54': 'cinquante-quatre', '55': 'cinquante-cinq',
    '56': 'cinquante-six', '57': 'cinquante-sept', '58': 'cinquante-huit', '59': 'cinquante-neuf',
    '60': 'soixante', '61': 'soixante et un', '62': 'soixante-deux', '63': 'soixante-trois',
    '64': 'soixante-quatre', '65': 'soixante-cinq', '66': 'soixante-six', '67': 'soixante-sept',
    '68': 'soixante-huit', '69': 'soixante-neuf',
    '70': 'septante', '71': 'septante et un', '72': 'septante-deux', '73': 'septante-trois',
    '74': 'septante-quatre', '75': 'septante-cinq', '76': 'septante-six', '77': 'septante-sept',
    '78': 'septante-huit', '79': 'septante-neuf',
    '80': 'quatre-vingts', '81': 'quatre-vingt-un', '82': 'quatre-vingt-deux', '83': 'quatre-vingt-trois',
    '84': 'quatre-vingt-quatre', '85': 'quatre-vingt-cinq', '86': 'quatre-vingt-six', '87': 'quatre-vingt-sept',
    '88': 'quatre-vingt-huit', '89': 'quatre-vingt-neuf',
    '90': 'nonante', '91': 'nonante et un', '92': 'nonante-deux', '93': 'nonante-trois',
    '94': 'nonante-quatre', '95': 'nonante-cinq', '96': 'nonante-six', '97': 'nonante-sept',
    '98': 'nonante-huit', '99': 'nonante-neuf',
  }

  return paires.map(p => dire[p] ?? p).join(', ')
}

function nettoyerTTS(texte: string): string {
  return texte
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^[-•–]\s+/gm, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Numéros de téléphone belges : 071 86 00 00 / 0800 24 063 / +32 71 86 00 00
    .replace(/(?:\+32\s?)?(?:0\d{1,3})(?:[\s./]\d{2,3}){2,4}/g, m => formatNumeroTelephone(m))
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Belgicismes ───────────────────────────────────────────────────────────────
// Remplace les formes françaises de France (soixante-dix, quatre-vingt-dix)
// par leurs équivalents belges (septante, nonante).
// RÈGLE : s'applique UNIQUEMENT sur les mots écrits en toutes lettres — jamais
// sur des chiffres isolés ni sur des expressions de temps (9h, 14h30, etc.).
function belgiciserNombres(texte: string): string {
  // Étape 1 — Protège les expressions de temps (7h, 9h00, 14h30…)
  // pour qu'elles ne soient jamais touchées par les remplacements suivants.
  const times: string[] = []
  let t = texte.replace(/\b\d{1,2}h\d{0,2}\b/gi, m => {
    times.push(m)
    return `\x00T${times.length - 1}\x00`
  })

  // Étape 2 — Septante (70–79)
  // 70 : "soixante-dix" (jamais de "et" pour 70 en français standard)
  t = t
    .replace(/\bsoixante[\s-]dix\b/gi,               'septante')
    // 71 : "soixante et onze" (avec "et") OU "soixante-onze" (sans "et", variante LLM)
    .replace(/\bsoixante[\s-]et[\s-]onze\b/gi,       'septante et un')
    .replace(/\bsoixante[\s-]onze\b/gi,              'septante et un')
    .replace(/\bsoixante[\s-]douze\b/gi,             'septante-deux')
    .replace(/\bsoixante[\s-]treize\b/gi,            'septante-trois')
    .replace(/\bsoixante[\s-]quatorze\b/gi,          'septante-quatre')
    .replace(/\bsoixante[\s-]quinze\b/gi,            'septante-cinq')
    .replace(/\bsoixante[\s-]seize\b/gi,             'septante-six')
    .replace(/\bsoixante[\s-]dix[\s-]sept\b/gi,      'septante-sept')
    .replace(/\bsoixante[\s-]dix[\s-]huit\b/gi,      'septante-huit')
    .replace(/\bsoixante[\s-]dix[\s-]neuf\b/gi,      'septante-neuf')
    // Étape 3 — Nonante (90–99)
    // 90 : "quatre-vingt-dix" (sans "et")
    .replace(/\bquatre[\s-]vingt[\s-]dix\b/gi,       'nonante')
    // 91 : "quatre-vingt-onze" (sans "et" — contrairement à 71, 91 n'a jamais de "et")
    .replace(/\bquatre[\s-]vingt[\s-](?:et[\s-])?onze\b/gi, 'nonante et un')
    .replace(/\bquatre[\s-]vingt[\s-]douze\b/gi,     'nonante-deux')
    .replace(/\bquatre[\s-]vingt[\s-]treize\b/gi,    'nonante-trois')
    .replace(/\bquatre[\s-]vingt[\s-]quatorze\b/gi,  'nonante-quatre')
    .replace(/\bquatre[\s-]vingt[\s-]quinze\b/gi,    'nonante-cinq')
    .replace(/\bquatre[\s-]vingt[\s-]seize\b/gi,     'nonante-six')
    .replace(/\bquatre[\s-]vingt[\s-]dix[\s-]sept\b/gi,  'nonante-sept')
    .replace(/\bquatre[\s-]vingt[\s-]dix[\s-]huit\b/gi,  'nonante-huit')
    .replace(/\bquatre[\s-]vingt[\s-]dix[\s-]neuf\b/gi,  'nonante-neuf')

  // Étape 4 — Restaure les expressions de temps protégées
  t = t.replace(/\x00T(\d+)\x00/g, (_, i) => times[parseInt(i)])

  return t
}

// ── Découpage en phrases (chunking) ───────────────────────────────────────────
// ElevenLabs bafouille sur les longs paragraphes. On découpe aux frontières de
// phrases (. ! ?) avant de concaténer les buffers audio en un seul flux MP3.
function decoupeEnPhrases(texte: string): string[] {
  return texte
    // Coupe après . ! ? suivi d'un espace + majuscule (début de nouvelle phrase)
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÙÂÊÎÔÛÄËÏÖÜa-z])|(?<=;)\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function getVoiceId(langue: Language): string {
  switch (langue) {
    case 'fr': return process.env.ELEVENLABS_VOICE_ID_FR || process.env.ELEVENLABS_VOICE_ID || FALLBACK_VOICE
    case 'nl': return process.env.ELEVENLABS_VOICE_ID_NL || process.env.ELEVENLABS_VOICE_ID || FALLBACK_VOICE
    case 'en': return process.env.ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID || FALLBACK_VOICE
  }
}

// ── Appel ElevenLabs (isolé pour permettre le chunking) ───────────────────────
async function fetchElevenLabsAudio(
  text: string,
  voiceId: string,
  apiKey: string
): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ElevenLabs ${res.status}: ${err}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    console.error('[/api/speak] ELEVENLABS_API_KEY absent')
    return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
  }

  try {
    const body             = await req.json()
    const text: string     = body.text   ?? ''
    const langue: Language = body.langue ?? 'fr'

    if (!text.trim()) {
      return NextResponse.json({ error: 'Texte vide' }, { status: 400 })
    }

    // 1. Nettoyage markdown + belgicismes (FR seulement)
    const cleaned    = nettoyerTTS(text)
    const texteFinal = langue === 'fr' ? belgiciserNombres(cleaned) : cleaned
    const voiceId    = getVoiceId(langue)
    console.log('[/api/speak] voiceId:', voiceId, '| langue:', langue, '| chars:', texteFinal.length)

    // 2. Chunking : découpe les textes > 300 caractères en phrases distinctes
    //    puis appelle ElevenLabs en parallèle pour chaque chunk.
    //    Les buffers MP3 sont ensuite concaténés (les frames MP3 sont indépendantes).
    const chunks = texteFinal.length > 300 ? decoupeEnPhrases(texteFinal) : [texteFinal]
    const buffers = await Promise.all(
      chunks.map(chunk => fetchElevenLabsAudio(chunk, voiceId, apiKey))
    )
    const buffer = Buffer.concat(buffers)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':   'audio/mpeg',
        'Content-Length': String(buffer.length),
      },
    })

  } catch (err) {
    console.error('[/api/speak] Exception:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
