// Server Component — statique
const SERVICES = [
  {
    title: "État Civil",
    badge: "Gratuit",
    gradient: "linear-gradient(135deg, #9b7db5 0%, #4a2d6a 100%)",
    rating: "4.9",
    meta: "Actes & attestations",
    loc: "Centre-Ville",
    desc: "Naissance, mariage, décès",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="18" height="20" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
      </svg>
    ),
  },
  {
    title: "Urbanisme",
    badge: "En ligne",
    gradient: "linear-gradient(135deg, #5a4a8a 0%, #2d2050 100%)",
    rating: "4.7",
    meta: "Permis & plans",
    loc: "Charleroi",
    desc: "Construire, rénover",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><rect x="9" y="13" width="6" height="8"/>
      </svg>
    ),
  },
  {
    title: "Travaux publics",
    badge: "Signalement",
    gradient: "linear-gradient(135deg, #866ca0 0%, #4a2a6a 100%)",
    rating: "4.6",
    meta: "Voirie & chantiers",
    loc: "Charleroi",
    desc: "Signaler, suivre",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    title: "Mobilité",
    badge: "Gratuit",
    gradient: "linear-gradient(135deg, #6b5490 0%, #2d2040 100%)",
    rating: "4.8",
    meta: "Transport & parking",
    loc: "Charleroi",
    desc: "Vélo, bus, stationnement",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    title: "Environnement",
    badge: "Durable",
    gradient: "linear-gradient(135deg, #8a7aaa 0%, #4a3a6a 100%)",
    rating: "4.7",
    meta: "Déchets & espaces verts",
    loc: null,
    desc: "Tri, qualité de l'air",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12"/><path d="M5 12C5 7.03 8.58 3 13 3s8 4.03 8 9c0 3-1.5 5.5-4 7"/><path d="M5 12c0 3 1.5 5.5 4 7"/>
      </svg>
    ),
  },
  {
    title: "Logement",
    badge: "Aides dispo",
    gradient: "linear-gradient(135deg, #d44e7a 0%, #7a2a4a 100%)",
    rating: "4.9",
    meta: "Aides & logements sociaux",
    loc: null,
    desc: "Primes, rénovation",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-[#f8f7fa] py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="rose-line mb-3">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-red">Services municipaux</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-black">Services disponibles</h2>
          </div>
          <p className="text-brand-mid text-sm font-light max-w-xs leading-relaxed sm:text-right">
            Six pôles pour toutes vos démarches auprès de la Ville de Charleroi.
          </p>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(svc => (
            <div key={svc.title} className="svc-dest-card">
              <div className="svc-dest-img" style={{ background: svc.gradient }}>
                <span className="svc-dest-badge">{svc.badge}</span>
                <div style={{ width: 56, height: 56, opacity: 0.85 }}>{svc.icon}</div>
              </div>
              <div className="svc-dest-info">
                <h3 className="font-bold text-brand-black text-[15px] tracking-tight">{svc.title}</h3>
                <div className="svc-dest-meta">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#d44e7a">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="text-brand-black font-semibold">{svc.rating}</span>
                  <span className="text-gray-300">·</span>
                  <span>{svc.meta}</span>
                  {svc.loc && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1 text-brand-red">
                        <svg width="9" height="11" viewBox="0 0 12 16" fill="#d44e7a">
                          <circle cx="6" cy="6" r="4"/><path d="M6 10c-4 0-5 3-5 4h10c0-1-1-4-5-4z"/>
                        </svg>
                        {svc.loc}
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-brand-mid font-light">{svc.desc}</span>
                  <span className="text-[11px] font-bold text-brand-red tracking-wide uppercase">Accéder →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
