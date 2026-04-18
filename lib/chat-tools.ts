import { readFileSync } from 'fs'
import { join } from 'path'

interface CitoyenFictif {
  id: string
  prenom: string
  nom: string
  date_naissance: string   // DD/MM/YYYY
  adresse: string
  commune_naissance: string
}

let CITOYENS: CitoyenFictif[] = []
try {
  CITOYENS = JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'citoyens_fictifs.json'), 'utf8')
  )
} catch {
  console.warn('[/api/chat] citoyens_fictifs.json introuvable — outil vérification désactivé')
}

export const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'verifier_identite_citoyen',
      description:
        "Vérifie l'identité d'un citoyen pour simuler la délivrance d'un document administratif " +
        "(acte de naissance, attestation de résidence, etc.). " +
        "N'appelle cette fonction QUE si le nom, le prénom et la date de naissance " +
        'ont été explicitement fournis par le citoyen dans la conversation.',
      parameters: {
        type: 'object',
        properties: {
          nom:            { type: 'string', description: 'Nom de famille' },
          prenom:         { type: 'string', description: 'Prénom' },
          date_naissance: { type: 'string', description: 'Date de naissance au format JJ/MM/AAAA' },
        },
        required: ['nom', 'prenom', 'date_naissance'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'simuler_prise_rendez_vous',
      description:
        "Propose deux créneaux de rendez-vous disponibles dans les 48h pour un service communal. " +
        "N'appelle cette fonction QUE si le citoyen demande EXPLICITEMENT un rendez-vous. " +
        "Appelle-la IMMÉDIATEMENT dès que le service est identifié — ne demande PAS le motif au citoyen.",
      parameters: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            description: "Nom exact du service (ex : 'État Civil', 'Urbanisme', 'CPAS', 'Logement')",
          },
          motif: {
            type: 'string',
            description: "Motif court déduit du contexte (ex : 'Logement social', 'Permis de construire'). Facultatif.",
          },
        },
        required: ['service'],
      },
    },
  },
]

const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS_FR  = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

const SERVICE_ADRESSES: Record<string, string> = {
  'état civil':  'Avenue E. Mascaux 100, 6001 Marcinelle',
  'etat civil':  'Avenue E. Mascaux 100, 6001 Marcinelle',
  'urbanisme':   'Place Jules Destrée 1, 6060 Gilly',
  'logement':    'Place Jules Destrée 20, 6060 Gilly',
  'cpas':        'Boulevard Joseph II 13, 6000 Charleroi',
  'mobilité':    'Boulevard Mayence 67, 6000 Charleroi',
  'mobilite':    'Boulevard Mayence 67, 6000 Charleroi',
  'crèches':     "Avenue de la Toison d'Or 50, 6000 Charleroi",
  'creches':     "Avenue de la Toison d'Or 50, 6000 Charleroi",
  'enseignement':'Place Vauban 14-15, 6000 Charleroi',
}

function getAdresseService(service: string): string {
  return SERVICE_ADRESSES[service.toLowerCase().trim()] ?? 'Place Vauban 14-15, 6000 Charleroi'
}

function executerVerificationIdentite(args: {
  nom: string
  prenom: string
  date_naissance: string
}): string {
  const citoyen = CITOYENS.find(
    c =>
      c.nom.toLowerCase()    === args.nom.toLowerCase().trim() &&
      c.prenom.toLowerCase() === args.prenom.toLowerCase().trim() &&
      c.date_naissance       === args.date_naissance.trim()
  )

  if (citoyen) {
    return JSON.stringify({
      statut:                'trouvé',
      prenom:                citoyen.prenom,
      nom:                   citoyen.nom,
      adresse:               citoyen.adresse,
      commune_naissance:     citoyen.commune_naissance,
      documents_disponibles: [
        'acte de naissance',
        'attestation de résidence',
        'extrait du registre de la population',
      ],
    })
  }

  return JSON.stringify({
    statut:  'non_trouvé',
    message: "Aucun profil correspondant dans la base de données. Vérifier l'orthographe ou inviter le citoyen à se présenter au guichet.",
  })
}

function executerPriseRendezVous(args: { service: string; motif?: string }): string {
  const HEURES = [9, 10, 11, 14, 15, 16]
  const now    = new Date()
  const creneaux: { jour: string; date: string; heure: string }[] = []

  let offset = 1
  while (creneaux.length < 2 && offset <= 10) {
    const d   = new Date(now)
    d.setDate(d.getDate() + offset)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      const heure = HEURES[Math.floor(Math.random() * HEURES.length)]
      creneaux.push({
        jour:  JOURS_FR[dow],
        date:  `${d.getDate()} ${MOIS_FR[d.getMonth()]} ${d.getFullYear()}`,
        heure: `${heure}h00`,
      })
    }
    offset++
  }

  return JSON.stringify({
    service: args.service,
    motif:   args.motif ?? args.service,
    adresse: getAdresseService(args.service),
    creneaux,
  })
}

export function executerOutil(nom: string, argumentsStr: string): string {
  try {
    const args = JSON.parse(argumentsStr)
    switch (nom) {
      case 'verifier_identite_citoyen':  return executerVerificationIdentite(args)
      case 'simuler_prise_rendez_vous':  return executerPriseRendezVous(args)
      default: return JSON.stringify({ error: `Outil inconnu : ${nom}` })
    }
  } catch (err) {
    return JSON.stringify({ error: 'Erreur exécution outil', detail: String(err) })
  }
}
