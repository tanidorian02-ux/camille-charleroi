// Server Component — statique
export default function Hero() {
  return (
    <section className="hero-bg relative overflow-hidden min-h-screen flex flex-col justify-center">

      {/* Pattern grille */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M60 0H0V60" fill="none" stroke="white" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Accents décoratifs */}
      <div className="absolute right-[-120px] top-[-120px] w-[500px] h-[500px] rounded-full bg-brand-red/10 blur-3xl pointer-events-none" />
      <div className="absolute left-[-80px] bottom-[-80px] w-[350px] h-[350px] rounded-full bg-brand-black/20 blur-3xl pointer-events-none" />

      {/* Watermark */}
      <div className="hero-watermark">CHARLEROI</div>

      {/* Contenu */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-24 lg:pb-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Texte + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
                Ville de Charleroi · 2025
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-[1.08] mb-6">
              Vos démarches,<br />
              <span className="font-extrabold text-white">enfin simples.</span>
            </h1>

            <p className="text-white/70 text-base lg:text-lg font-light leading-relaxed mb-10 max-w-lg">
              Camille accompagne les citoyens de Charleroi dans toutes leurs démarches
              administratives — simplement, rapidement, 24h/24.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <a
                href="#services"
                className="inline-flex items-center gap-2.5 bg-brand-red text-white font-semibold text-[12px] tracking-[0.1em] uppercase px-7 py-3.5 rounded-full hover:bg-brand-red/90 transition-colors"
              >
                Découvrir les services
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#bot"
                className="inline-flex items-center gap-2.5 border border-white/25 text-white font-medium text-[12px] tracking-[0.1em] uppercase px-7 py-3.5 rounded-full hover:border-brand-red hover:text-brand-red transition-colors duration-200"
              >
                Parler à Camille
              </a>
            </div>

            {/* Badges confiance */}
            <div className="flex items-center gap-6 flex-wrap">
              {["Service officiel", "100% gratuit", "Sécurisé & confidentiel"].map(label => (
                <div key={label} className="flex items-center gap-2 text-white/50 text-[12px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="#d44e7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="#d44e7a" strokeWidth="1.5" />
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Cartes statistiques */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <div className="col-span-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/50 mb-1">Citoyens servis</p>
              <p className="text-3xl font-bold text-white">200 000+</p>
              <p className="text-[11px] text-white/40 mt-1">habitants de Charleroi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-[11px] text-white/50 mt-1">Pôles de services</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
              <p className="text-2xl font-bold text-white">24h/24</p>
              <p className="text-[11px] text-white/50 mt-1">Disponible</p>
            </div>
            <div className="bg-brand-red/80 backdrop-blur-sm border border-brand-red/30 rounded-2xl p-5">
              <p className="text-2xl font-bold text-white">&lt; 24h</p>
              <p className="text-[11px] text-white/80 mt-1">Délai de réponse</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
              <p className="text-2xl font-bold text-white">10 ans</p>
              <p className="text-[11px] text-white/50 mt-1">D&apos;expérience</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-[10px] tracking-[0.2em] uppercase">Découvrir</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}
