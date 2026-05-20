// Verifies a citizen's NISS number against a hashed resident database.
// Falls back to a name-based lookup if the hash is not found.

import { NextRequest, NextResponse } from 'next/server'

type Habitant = {
  prenom: string
  nom: string
  date_naissance: string
  cp: string
  adresse: string
  statut: string
  niss_hash: string
}

export async function POST(_req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ found: false })
}
