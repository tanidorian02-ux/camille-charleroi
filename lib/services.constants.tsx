export const SERVICES = [
  {
    title:    "État Civil",
    badge:    "Gratuit",
    gradient: "linear-gradient(135deg, #9b7db5 0%, #4a2d6a 100%)",
    rating:   "4.9",
    meta:     "Actes & attestations",
    loc:      "Centre-Ville",
    desc:     "Naissance, mariage, décès",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
      </svg>
    ),
  },
  {
    title:    "Urbanisme",
    badge:    "En ligne",
    gradient: "linear-gradient(135deg, #5a4a8a 0%, #2d2050 100%)",
    rating:   "4.7",
    meta:     "Permis & plans",
    loc:      "Charleroi",
    desc:     "Construire, rénover",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><rect x="9" y="13" width="6" height="8"/>
      </svg>
    ),
  },
  {
    title:    "Travaux publics",
    badge:    "Signalement",
    gradient: "linear-gradient(135deg, #866ca0 0%, #4a2a6a 100%)",
    rating:   "4.6",
    meta:     "Voirie & chantiers",
    loc:      "Charleroi",
    desc:     "Signaler, suivre",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    title:    "Mobilité",
    badge:    "Gratuit",
    gradient: "linear-gradient(135deg, #6b5490 0%, #2d2040 100%)",
    rating:   "4.8",
    meta:     "Transport & parking",
    loc:      "Charleroi",
    desc:     "Vélo, bus, stationnement",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    title:    "Environnement",
    badge:    "Durable",
    gradient: "linear-gradient(135deg, #8a7aaa 0%, #4a3a6a 100%)",
    rating:   "4.7",
    meta:     "Déchets & espaces verts",
    loc:      null,
    desc:     "Tri, qualité de l'air",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12"/><path d="M5 12C5 7.03 8.58 3 13 3s8 4.03 8 9c0 3-1.5 5.5-4 7"/><path d="M5 12c0 3 1.5 5.5 4 7"/>
      </svg>
    ),
  },
  {
    title:    "Logement",
    badge:    "Aides dispo",
    gradient: "linear-gradient(135deg, #d44e7a 0%, #7a2a4a 100%)",
    rating:   "4.9",
    meta:     "Aides & logements sociaux",
    loc:      null,
    desc:     "Primes, rénovation",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]
