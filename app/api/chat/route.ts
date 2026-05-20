// Main chat endpoint. Accepts a user message and conversation history,
// calls the LLM via streaming SSE, handles tool-call interruptions,
// and returns a token stream to the client.

import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/types'

interface ToolCallAccum { id: string; name: string; arguments: string }

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ error: 'not implemented' }, { status: 501 })
}
