// Épelle chaque chiffre individuellement — évite toute confusion ElevenLabs
// entre les nombres belges (septante) et français (soixante-dix).
// Ex: "071" → "zéro-sept-un" | "86" → "huit-six"
const CHIFFRE: Record<string, string> = {
  '0': 'zéro', '1': 'un', '2': 'deux', '3': 'trois', '4': 'quatre',
  '5': 'cinq', '6': 'six', '7': 'sept', '8': 'huit', '9': 'neuf',
}

function lireGroupe(g: string): string {
  return g.split('').map(c => CHIFFRE[c] ?? c).join('-')
}

// "071 86 00 00" → "zéro-sept-un, huit-six, zéro-zéro, zéro-zéro"
function formatNumeroTelephone(num: string): string {
  const normalise = num.replace(/^\+32\s?/, '0')
  const groupes   = normalise.split(/[\s./]+/).filter(Boolean)
  return groupes.map(lireGroupe).join(', ')
}

// Supprime markdown et caractères spéciaux qui perturbent la prosodie ElevenLabs.
// Ex: "**Urbanisme** : voir *ici*" → "Urbanisme : voir ici"
export function nettoyerTTS(texte: string): string {
  return texte
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^[-•–]\s+/gm, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // URLs : charleroi.be → "charleroi point be"
    .replace(/\b([\w-]+)\.(be|com|org|net|eu|gouv|wallonie)\b/gi, '$1 point $2')
    // Numéros de téléphone belges : 071 86 00 00 / 0800 24 063 / +32 71 86 00 00
    .replace(/(?:\+32\s?)?(?:0\d{1,3})(?:[\s./]\d{2,3}){2,4}/g, m => formatNumeroTelephone(m))
    .replace(/\s+/g, ' ')
    .trim()
}

// Remplace les formes françaises de France par leurs équivalents belges.
// S'applique UNIQUEMENT sur les mots écrits en toutes lettres — jamais sur
// des chiffres isolés ni des expressions de temps (9h, 14h30…).
export function belgiciserNombres(texte: string): string {
  // Étape 1 — Protège les expressions de temps (7h, 9h00, 14h30…)
  const times: string[] = []
  let t = texte.replace(/\b\d{1,2}h\d{0,2}\b/gi, m => {
    times.push(m)
    return `\x00T${times.length - 1}\x00`
  })

  // Étape 2 — Chiffres isolés 70-79 et 90-99
  // (?<!\d) et (?!\d) évitent de toucher "071", "1970", etc.
  t = t
    .replace(/(?<!\d)79(?!\d)/g, 'septante-neuf')
    .replace(/(?<!\d)78(?!\d)/g, 'septante-huit')
    .replace(/(?<!\d)77(?!\d)/g, 'septante-sept')
    .replace(/(?<!\d)76(?!\d)/g, 'septante-six')
    .replace(/(?<!\d)75(?!\d)/g, 'septante-cinq')
    .replace(/(?<!\d)74(?!\d)/g, 'septante-quatre')
    .replace(/(?<!\d)73(?!\d)/g, 'septante-trois')
    .replace(/(?<!\d)72(?!\d)/g, 'septante-deux')
    .replace(/(?<!\d)71(?!\d)/g, 'septante un')
    .replace(/(?<!\d)70(?!\d)/g, 'septante')
    .replace(/(?<!\d)99(?!\d)/g, 'nonante-neuf')
    .replace(/(?<!\d)98(?!\d)/g, 'nonante-huit')
    .replace(/(?<!\d)97(?!\d)/g, 'nonante-sept')
    .replace(/(?<!\d)96(?!\d)/g, 'nonante-six')
    .replace(/(?<!\d)95(?!\d)/g, 'nonante-cinq')
    .replace(/(?<!\d)94(?!\d)/g, 'nonante-quatre')
    .replace(/(?<!\d)93(?!\d)/g, 'nonante-trois')
    .replace(/(?<!\d)92(?!\d)/g, 'nonante-deux')
    .replace(/(?<!\d)91(?!\d)/g, 'nonante un')
    .replace(/(?<!\d)90(?!\d)/g, 'nonante')

  // Étape 3 — Mots écrits en toutes lettres (soixante-dix, quatre-vingt-dix…)
  // "septante-et-un" avec tirets perturbe ElevenLabs → "septante un" (espace seul)
  t = t
    .replace(/\bsoixante[\s-]dix\b/gi,                          'septante')
    .replace(/\bsoixante[\s-]et[\s-]onze\b/gi,                  'septante un')
    .replace(/\bsoixante[\s-]onze\b/gi,                         'septante un')
    .replace(/\bsoixante[\s-]douze\b/gi,                        'septante-deux')
    .replace(/\bsoixante[\s-]treize\b/gi,                       'septante-trois')
    .replace(/\bsoixante[\s-]quatorze\b/gi,                     'septante-quatre')
    .replace(/\bsoixante[\s-]quinze\b/gi,                       'septante-cinq')
    .replace(/\bsoixante[\s-]seize\b/gi,                        'septante-six')
    .replace(/\bsoixante[\s-]dix[\s-]sept\b/gi,                 'septante-sept')
    .replace(/\bsoixante[\s-]dix[\s-]huit\b/gi,                 'septante-huit')
    .replace(/\bsoixante[\s-]dix[\s-]neuf\b/gi,                 'septante-neuf')
    .replace(/\bquatre[\s-]vingt[\s-]dix\b/gi,                  'nonante')
    .replace(/\bquatre[\s-]vingt[\s-](?:et[\s-])?onze\b/gi,     'nonante un')
    .replace(/\bquatre[\s-]vingt[\s-]douze\b/gi,                'nonante-deux')
    .replace(/\bquatre[\s-]vingt[\s-]treize\b/gi,               'nonante-trois')
    .replace(/\bquatre[\s-]vingt[\s-]quatorze\b/gi,             'nonante-quatre')
    .replace(/\bquatre[\s-]vingt[\s-]quinze\b/gi,               'nonante-cinq')
    .replace(/\bquatre[\s-]vingt[\s-]seize\b/gi,                'nonante-six')
    .replace(/\bquatre[\s-]vingt[\s-]dix[\s-]sept\b/gi,         'nonante-sept')
    .replace(/\bquatre[\s-]vingt[\s-]dix[\s-]huit\b/gi,         'nonante-huit')
    .replace(/\bquatre[\s-]vingt[\s-]dix[\s-]neuf\b/gi,         'nonante-neuf')

  // Étape 4 — Restaure les expressions de temps protégées
  t = t.replace(/\x00T(\d+)\x00/g, (_, i) => times[parseInt(i)])

  return t
}

// Découpe le texte aux frontières de phrases pour le chunking ElevenLabs.
// ElevenLabs bafouille sur les longs paragraphes — on sépare avant d'envoyer.
export function decoupeEnPhrases(texte: string): string[] {
  return texte
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-ÙÂÊÎÔÛÄËÏÖÜa-z])|(?<=;)\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
}
