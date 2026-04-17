import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'

type Habitant = {
  prenom: string
  nom: string
  date_naissance: string
  cp: string
  adresse: string
  statut: string
  niss_hash: string
}

// Chargé une seule fois au démarrage du serveur
const habitants: Habitant[] = JSON.parse(
  readFileSync(join(process.cwd(), 'data', 'habitants.json'), 'utf8')
)

function sha256(str: string) {
  return createHash('sha256').update(str).digest('hex')
}

// Normalise un NISS vocal/texte → 11 chiffres bruts
function normaliserNISS(saisie: string): string {
  const chiffres = saisie.replace(/\D/g, '')
  return chiffres.length === 11 ? chiffres : saisie.trim()
}

export async function POST(req: NextRequest) {
  try {
    const { niss } = await req.json()
    const saisie = normaliserNISS(String(niss ?? ''))

    if (!saisie) return NextResponse.json({ found: false })

    // 1. Recherche par hash SHA-256 du NISS
    const habitantParNiss = habitants.find(h => h.niss_hash === sha256(saisie))
    if (habitantParNiss) {
      const { niss_hash, ...safe } = habitantParNiss
      return NextResponse.json({ found: true, habitant: safe })
    }

    // 2. Recherche par nom / prénom (fallback)
    const mots = saisie.toLowerCase().split(/\s+/).filter(m => m.length > 1)
    const habitantParNom = habitants.find(h =>
      mots.some(mot =>
        h.prenom.toLowerCase().includes(mot) ||
        h.nom.toLowerCase().includes(mot)
      )
    )

    if (habitantParNom) {
      const { niss_hash, ...safe } = habitantParNom
      return NextResponse.json({ found: true, habitant: safe })
    }

    return NextResponse.json({ found: false })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
