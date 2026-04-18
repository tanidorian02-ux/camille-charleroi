import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/types'
import { SYSTEM_PROMPT } from '@/lib/system-prompts'
import { TOOLS, executerOutil } from '@/lib/chat-tools'

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions'

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: object[],
  withTools: boolean,
): Promise<Response> {
  return fetch(OR_URL, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      'X-Title':      'Camille - Ville de Charleroi',
    },
    body: JSON.stringify({
      model,
      messages,
      ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
    }),
  })
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model  = process.env.OPENROUTER_MODEL ?? 'mistralai/mistral-medium-3'

  if (!apiKey) {
    console.error('[/api/chat] OPENROUTER_API_KEY absent')
    return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
  }

  try {
    const body            = await req.json()
    const message: string  = body.message ?? ''
    const langue: Language = body.langue  ?? 'fr'
    const effectiveModel   = (body._benchmarkModel as string | undefined) ?? model

    type Turn = { role: 'user' | 'assistant'; content: string }
    const rawHistory: Turn[] = Array.isArray(body.history) ? body.history : []
    const history = rawHistory
      .slice(-6)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: String(m.content ?? '').slice(0, 800) }))

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    const baseMessages = [
      { role: 'system', content: SYSTEM_PROMPT[langue] },
      ...history,
      { role: 'user', content: message },
    ]

    // Premier appel (avec outils disponibles)
    const res1  = await callOpenRouter(apiKey, effectiveModel, baseMessages, true)
    const data1 = await res1.json()

    if (!res1.ok) {
      console.error('[/api/chat] OpenRouter error (1):', res1.status, JSON.stringify(data1))
      return NextResponse.json({ error: data1?.error?.message ?? 'Erreur OpenRouter' }, { status: 502 })
    }

    const msg1 = data1.choices?.[0]?.message

    // Si le modèle a appelé un outil → second appel avec le résultat
    if (msg1?.tool_calls?.length) {
      const toolCall   = msg1.tool_calls[0]
      const toolResult = executerOutil(toolCall.function.name, toolCall.function.arguments)

      console.log('[/api/chat] tool_call:', toolCall.function.name, '→', toolResult.slice(0, 120))

      const messagesWithTool = [
        ...baseMessages,
        msg1,
        { role: 'tool', tool_call_id: toolCall.id, content: toolResult },
      ]

      const res2  = await callOpenRouter(apiKey, effectiveModel, messagesWithTool, false)
      const data2 = await res2.json()

      if (!res2.ok) {
        console.error('[/api/chat] OpenRouter error (2):', res2.status, JSON.stringify(data2))
        return NextResponse.json({ error: data2?.error?.message ?? 'Erreur OpenRouter' }, { status: 502 })
      }

      const reply: string = data2.choices?.[0]?.message?.content ?? ''
      const usage = {
        prompt_tokens:     (data1.usage?.prompt_tokens     ?? 0) + (data2.usage?.prompt_tokens     ?? 0),
        completion_tokens: (data1.usage?.completion_tokens ?? 0) + (data2.usage?.completion_tokens ?? 0),
        total_tokens:      (data1.usage?.total_tokens      ?? 0) + (data2.usage?.total_tokens      ?? 0),
      }
      return NextResponse.json({ reply, usage })
    }

    // Réponse texte directe (aucun outil appelé)
    return NextResponse.json({ reply: msg1?.content ?? '', usage: data1.usage ?? null })

  } catch (err) {
    console.error('[/api/chat] Exception:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
