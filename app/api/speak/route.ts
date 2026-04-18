import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/types'
import { nettoyerTTS, belgiciserNombres, decoupeEnPhrases } from '@/lib/tts-processing'

const FALLBACK_VOICE = 'EXAVITQu4vr4xnSDxMaL'

function getVoiceId(langue: Language): string {
  switch (langue) {
    case 'fr': return process.env.ELEVENLABS_VOICE_ID_FR || process.env.ELEVENLABS_VOICE_ID || FALLBACK_VOICE
    case 'nl': return process.env.ELEVENLABS_VOICE_ID_NL || process.env.ELEVENLABS_VOICE_ID || FALLBACK_VOICE
    case 'en': return process.env.ELEVENLABS_VOICE_ID_EN || process.env.ELEVENLABS_VOICE_ID || FALLBACK_VOICE
  }
}

async function fetchElevenLabsAudio(text: string, voiceId: string, apiKey: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
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

    const cleaned    = nettoyerTTS(text)
    const texteFinal = langue === 'fr' ? belgiciserNombres(cleaned) : cleaned
    const voiceId    = getVoiceId(langue)
    console.log('[/api/speak] voiceId:', voiceId, '| langue:', langue, '| chars:', texteFinal.length)
    console.log('[/api/speak] texte envoyé à ElevenLabs:', texteFinal)

    // Découpe les textes > 300 chars en phrases puis appelle ElevenLabs en parallèle.
    // Les frames MP3 étant indépendantes, la concaténation des buffers est transparente.
    const chunks  = texteFinal.length > 300 ? decoupeEnPhrases(texteFinal) : [texteFinal]
    const buffers = await Promise.all(chunks.map(chunk => fetchElevenLabsAudio(chunk, voiceId, apiKey)))
    const buffer  = Buffer.concat(buffers)

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
