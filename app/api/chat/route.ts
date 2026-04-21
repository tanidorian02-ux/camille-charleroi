import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/types'
import { SYSTEM_PROMPT } from '@/lib/system-prompts'
import { TOOLS, executerOutil } from '@/lib/chat-tools'

const OR_URL = 'https://openrouter.ai/api/v1/chat/completions'

function buildRequest(
  apiKey: string,
  model: string,
  messages: object[],
  withTools: boolean,
  stream: boolean,
): RequestInit {
  return {
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
      stream,
      ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
    }),
  }
}

// Parses an OpenRouter SSE stream into JSON objects.
async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<Record<string, unknown>> {
  const reader  = body.getReader()
  const decoder = new TextDecoder()
  let buffer    = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const payload = trimmed.slice(6)
        if (payload === '[DONE]') return
        try { yield JSON.parse(payload) } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// Non-streaming call — kept for the benchmark script that expects { reply, usage }.
async function callJSON(
  apiKey: string,
  model: string,
  messages: object[],
  withTools: boolean,
): Promise<Response> {
  return fetch(OR_URL, buildRequest(apiKey, model, messages, withTools, false))
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model  = process.env.OPENROUTER_MODEL ?? 'mistralai/mistral-medium-3'

  if (!apiKey) {
    console.error('[/api/chat] OPENROUTER_API_KEY absent')
    return NextResponse.json({ error: 'Clé API manquante' }, { status: 500 })
  }

  const body             = await req.json()
  const message: string  = body.message ?? ''
  const langue: Language = body.langue  ?? 'fr'
  const useStream        = body.stream  === true
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

  // ── JSON mode (benchmark, legacy) ────────────────────────────────────────────
  if (!useStream) {
    try {
      const res1  = await callJSON(apiKey, effectiveModel, baseMessages, true)
      const data1 = await res1.json()
      if (!res1.ok) {
        console.error('[/api/chat] OpenRouter error (1):', res1.status, JSON.stringify(data1))
        return NextResponse.json({ error: data1?.error?.message ?? 'Erreur OpenRouter' }, { status: 502 })
      }
      const msg1 = data1.choices?.[0]?.message
      if (msg1?.tool_calls?.length) {
        const tc         = msg1.tool_calls[0]
        const toolResult = executerOutil(tc.function.name, tc.function.arguments)
        console.log('[/api/chat] tool_call:', tc.function.name, '→', toolResult.slice(0, 120))
        const res2  = await callJSON(apiKey, effectiveModel, [
          ...baseMessages, msg1,
          { role: 'tool', tool_call_id: tc.id, content: toolResult },
        ], false)
        const data2 = await res2.json()
        if (!res2.ok) {
          console.error('[/api/chat] OpenRouter error (2):', res2.status, JSON.stringify(data2))
          return NextResponse.json({ error: data2?.error?.message ?? 'Erreur OpenRouter' }, { status: 502 })
        }
        const usage = {
          prompt_tokens:     (data1.usage?.prompt_tokens     ?? 0) + (data2.usage?.prompt_tokens     ?? 0),
          completion_tokens: (data1.usage?.completion_tokens ?? 0) + (data2.usage?.completion_tokens ?? 0),
          total_tokens:      (data1.usage?.total_tokens      ?? 0) + (data2.usage?.total_tokens      ?? 0),
        }
        return NextResponse.json({ reply: data2.choices?.[0]?.message?.content ?? '', usage })
      }
      return NextResponse.json({ reply: msg1?.content ?? '', usage: data1.usage ?? null })
    } catch (err) {
      console.error('[/api/chat] Exception (JSON mode):', err)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }

  // ── SSE streaming mode ────────────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }

      try {
        const res1 = await fetch(OR_URL, buildRequest(apiKey, effectiveModel, baseMessages, true, true))
        if (!res1.ok || !res1.body) {
          const errText = await res1.text()
          console.error('[/api/chat] OpenRouter stream error (1):', res1.status, errText)
          send({ t: 'error', message: 'Erreur OpenRouter' })
          controller.close()
          return
        }

        // Accumulate first stream — detect whether it's a text response or a tool call.
        interface ToolCallAccum { id: string; name: string; arguments: string }
        let toolCall:    ToolCallAccum | null = null
        let finishReason: string | null       = null

        for await (const event of parseSSE(res1.body)) {
          const choice = (event as { choices?: { delta?: Record<string, unknown>; finish_reason?: string }[] }).choices?.[0]
          if (!choice) continue
          const delta = (choice.delta ?? {}) as Record<string, unknown>
          finishReason = choice.finish_reason ?? finishReason

          const toolCalls = delta.tool_calls as { index?: number; id?: string; function?: { name?: string; arguments?: string } }[] | undefined
          if (toolCalls?.length) {
            const tc = toolCalls[0]
            if (!toolCall) toolCall = { id: tc.id ?? '', name: tc.function?.name ?? '', arguments: '' }
            if (tc.function?.arguments) toolCall.arguments += tc.function.arguments
          } else if (typeof delta.content === 'string' && delta.content) {
            send({ t: 'tok', c: delta.content })
          }
        }

        // Tool call branch — execute tool then stream second LLM call.
        if (toolCall && finishReason === 'tool_calls') {
          console.log('[/api/chat] stream tool_call:', toolCall.name)
          const STATUS_TOOL: Record<string, string> = {
            fr: 'Je vérifie vos informations…',
            nl: 'Ik controleer uw gegevens…',
            en: 'Let me check your information…',
          }
          send({ t: 'status', c: STATUS_TOOL[langue] ?? STATUS_TOOL.fr })
          const toolResult  = executerOutil(toolCall.name, toolCall.arguments)
          const assistantMsg = {
            role: 'assistant', content: null,
            tool_calls: [{ id: toolCall.id, type: 'function', function: { name: toolCall.name, arguments: toolCall.arguments } }],
          }
          const toolMsg = { role: 'tool', tool_call_id: toolCall.id, content: toolResult }

          const res2 = await fetch(OR_URL, buildRequest(apiKey, effectiveModel, [...baseMessages, assistantMsg, toolMsg], false, true))
          if (!res2.ok || !res2.body) {
            const errText = await res2.text()
            console.error('[/api/chat] OpenRouter stream error (2):', res2.status, errText)
            send({ t: 'error', message: 'Erreur OpenRouter (2)' })
            controller.close()
            return
          }
          for await (const event of parseSSE(res2.body)) {
            const token = ((event as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content) ?? ''
            if (token) send({ t: 'tok', c: token })
          }
        }

        send({ t: 'done' })
        controller.close()

      } catch (err) {
        console.error('[/api/chat] Exception (stream):', err)
        send({ t: 'error', message: 'Erreur serveur' })
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
