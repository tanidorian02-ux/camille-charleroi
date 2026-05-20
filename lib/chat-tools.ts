// Defines the two AI tool schemas exposed to the LLM (identity verification
// and appointment booking) and implements their server-side execution logic.

interface CitoyenFictif {
  id: string
  prenom: string
  nom: string
  date_naissance: string
  adresse: string
  commune_naissance: string
}

export const TOOLS: object[] = []

function getAdresseService(_service: string): string {
  return ''
}

function executerVerificationIdentite(_args: {
  nom: string
  prenom: string
  date_naissance: string
}): string {
  return JSON.stringify({ statut: 'non_trouvé' })
}

function executerPriseRendezVous(_args: { service: string; motif?: string }): string {
  return JSON.stringify({ creneaux: [] })
}

export function executerOutil(_nom: string, _argumentsStr: string): string {
  return JSON.stringify({ error: 'not implemented' })
}
