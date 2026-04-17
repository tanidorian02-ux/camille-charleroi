/**
 * Test de non-régression — Intentions RAG
 * Appelle /api/chat avec 20 questions et vérifie que Gemini
 * mentionne le bon service dans sa réponse.
 *
 * Usage : node test-intentions.js [--url http://localhost:3000]
 */

const BASE_URL = (() => {
  const idx = process.argv.indexOf('--url')
  return idx !== -1 ? process.argv[idx + 1] : 'http://localhost:3000'
})()

// ── Définition des services attendus ─────────────────────────────────────────
// Pour chaque service, on liste les signaux textuels qu'on s'attend à trouver
// dans la réponse de Camille (numéro de téléphone OU mot-clé fort).
// Les signaux sont testés dans l'ordre — le téléphone exact est le signal le plus fort.
// IMPORTANT : tester logement AVANT cpas pour éviter que "allocation" ne dévie vers cpas.
// Règle : le numéro de téléphone exact est toujours le signal prioritaire.
// Ordre important : logement avant cpas, enseignement avant etat-civil.
// Éviter les signaux trop génériques (ex: "gilly" = présent dans 2 services).
// Ordre critique : participation-citoyenne AVANT travaux-publics pour éviter que
// "salle communale" ne soit absorbé par travaux-publics.
// etat-civil : "maison citoyenne de marcinelle" est un signal fort car c'est le seul
// service exclusivement localisé à Marcinelle.
const SIGNAUX_SERVICE = {
  'urbanisme':                    ['071 86 38 00', 'service urbanisme', 'urbanisme', 'permis d\'urbanisme', 'permis de construire', 'permit.environnement'],
  'piscines':                     ['071 24 21 30', '071 29 74 02', 'piscine helios', 'helios', 'charleroi-les-bains', 'natation'],
  'etat-civil':                   ['071 86 67 77', 'etat civil', 'etat-civil', 'acte de mariage', 'maison citoyenne de marcinelle', 'avenue mascaux'],
  'logement':                     ['071 86 40 77', 'service logement', 'logement social', 'salubrité', 'allocation loyer'],
  'mobilite':                     ['071 86 17 91', 'rca-charleroi', 'carte riverain', 'mobilit'],
  'cpas':                         ['071 23 30 23', 'cpas', 'aide sociale', 'revenu d\'integration'],
  'creches':                      ['071 86 70 37', 'creche', 'petite enfance', 'my.one'],
  'enseignement':                 ['071 86 08 39', 'enseignement communal', 'ecole communale', 'ecole primaire', 'ecole maternelle', 'carnet de vaccination'],
  'participation-citoyenne':      ['071 86 13 41', 'salle jules destree', 'salle communale', 'participation citoyenne'],
  'travaux-publics':              ['071 86 94 10', 'travaux publics', 'service travaux'],
  'service_culturel_bibliotheque':['071 31 58 89', 'bibliotheque', 'rimbaud'],
  'urgences-voisinage':           ['071 21 03 33', 'police locale', 'porter plainte', 'cambriolage', 'agression', 'numero 101', 'le 101', 'appeler le 101', 'police'],
}

// ── Les 20 questions (identiques à l'ancien test) ───────────────────────────
const QUESTIONS = [
  { q: 'Quel est le numero de GSM personnel du bourgmestre ?',             attendu: null },
  { q: 'Je veux construire une piscine dans mon jardin, je contacte qui ?', attendu: 'urbanisme' },
  { q: 'Quels sont les horaires de la piscine Helios ?',                    attendu: 'piscines' },
  { q: 'Il y a trop de chlore dans la piscine, quel service appeler ?',     attendu: 'piscines' },
  { q: 'Pour un permis de construire une veranda, quel service ?',          attendu: 'urbanisme' },
  { q: 'Je dois demander un permis pour un bassin exterieur.',              attendu: 'urbanisme' },
  { q: 'Un nid de poule est apparu dans ma rue.',                           attendu: 'travaux-publics' },
  { q: 'Le lampadaire de ma rue ne fonctionne plus.',                       attendu: 'travaux-publics' },
  { q: 'Je veux demander une aide sociale urgente.',                        attendu: 'cpas' },
  { q: 'Comment obtenir le revenu d integration ?',                         attendu: 'cpas' },
  { q: 'Je dois declarer une naissance.',                                   attendu: 'etat-civil' },
  { q: 'Je veux un acte de mariage.',                                       attendu: 'etat-civil' },
  { q: 'Je cherche un logement social ou une allocation loyer.',            attendu: 'logement' },
  { q: 'Je veux contester un PV de stationnement.',                         attendu: 'mobilite' },
  { q: 'Ou demander une carte riverain ?',                                  attendu: 'mobilite' },
  { q: 'Je cherche une creche pour mon bebe.',                              attendu: 'creches' },
  { q: 'Quels documents pour inscrire mon enfant a l ecole ?',             attendu: 'enseignement' },
  { q: 'Je veux reserver une salle communale.',                             attendu: 'participation-citoyenne' },
  { q: 'Comment contacter la bibliotheque Rimbaud ?',                       attendu: 'service_culturel_bibliotheque' },
  { q: 'Je veux signaler un cambriolage ou une agression.',                 attendu: 'urgences-voisinage' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function normaliser(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, "'")
}

function detecterService(reponse) {
  const rep = normaliser(reponse)
  for (const [serviceId, signaux] of Object.entries(SIGNAUX_SERVICE)) {
    if (signaux.some(s => rep.includes(normaliser(s)))) {
      return serviceId
    }
  }
  return null
}

function refuseRepondre(reponse) {
  const rep = normaliser(reponse)
  const marqueurs = [
    'ne peut pas', 'ne peux pas', 'pas en mesure', 'impossible',
    'ne dispose pas', 'information personnelle', 'gsm personnel',
    'numero prive', 'en dehors de', 'hors de mon perimetre',
    'ne suis pas habilite', 'redirige', 'contactez directement',
    'je n\'ai pas acces', 'coordonnees personnelles'
  ]
  return marqueurs.some(m => rep.includes(m))
}

async function appellerChat(question) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question, langue: 'fr' }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data.reply ?? ''
}

// ── Runner principal ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\nTest de non-régression — Camille Next.js`)
  console.log(`Serveur : ${BASE_URL}`)
  console.log(`Questions : ${QUESTIONS.length}\n`)
  console.log('─'.repeat(70))

  // Vérification que le serveur répond
  try {
    await fetch(`${BASE_URL}/`)
  } catch {
    console.error(`\nERREUR : impossible de joindre ${BASE_URL}`)
    console.error('Lancez le serveur avec : npm run dev\n')
    process.exit(1)
  }

  let ok = 0
  let echecs = 0

  for (let i = 0; i < QUESTIONS.length; i++) {
    const { q, attendu } = QUESTIONS[i]
    const num = String(i + 1).padStart(2, '0')

    let reponse
    try {
      reponse = await appellerChat(q)
    } catch (err) {
      console.log(`ERREUR ${num} -> ${err.message} | ${q}`)
      echecs++
      continue
    }

    const obtenu = detecterService(reponse)

    // Cas attendu = null (question piège — Camille doit refuser ou ne pas citer de service)
    if (attendu === null) {
      const refus = refuseRepondre(reponse) || obtenu === null
      if (refus) {
        console.log(`OK  ${num} -> null (refus correct) | ${q}`)
        ok++
      } else {
        console.log(`NOK ${num} -> a cite "${obtenu}" au lieu de refuser | ${q}`)
        console.log(`        Réponse : ${reponse.slice(0, 120)}...`)
        echecs++
      }
      continue
    }

    // Cas normal — vérifier que le bon service est mentionné
    if (obtenu === attendu) {
      console.log(`OK  ${num} -> ${obtenu} | ${q}`)
      ok++
    } else {
      console.log(`NOK ${num} -> obtenu "${obtenu ?? 'aucun'}" attendu "${attendu}" | ${q}`)
      console.log(`        Réponse : ${reponse.slice(0, 150)}...`)
      echecs++
    }

    // Petite pause entre les appels pour éviter le rate limiting
    await new Promise(r => setTimeout(r, 400))
  }

  console.log('─'.repeat(70))
  console.log(`\nRésultat : ${ok}/${QUESTIONS.length}`)

  if (echecs === 0) {
    console.log('SUCCES — 20/20 maintenu\n')
    process.exit(0)
  } else {
    console.log(`ECHEC   — ${echecs} régression(s) détectée(s)\n`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
