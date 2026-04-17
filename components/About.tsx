// Server Component — statique
export default function About() {
  return (
    <section id="apropos" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        {/* Gauche : texte + stats */}
        <div>
          <div className="rose-line mb-6">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-red">Projet Camille</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] font-bold text-brand-black leading-tight mb-5">
            Pourquoi des milliers de citoyens<br />choisissent Camille
          </h2>
          <p className="text-brand-mid text-sm sm:text-base font-light leading-relaxed mb-6">
            De l&apos;état civil aux permis de construire, nous rendons l&apos;administration de Charleroi
            plus simple, plus rapide et accessible à tous — avec un accompagnement humain et numérique.
          </p>
          <p className="text-brand-mid text-sm font-light leading-relaxed mb-10">
            Notre plateforme centralise toutes vos démarches en un seul endroit, élimine les files
            d&apos;attente et vous tient informé en temps réel.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
            {[
              { value: "200k+", label: "Citoyens heureux" },
              { value: "6",     label: "Pôles de services" },
              { value: "50+",   label: "Démarches en ligne" },
            ].map(stat => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-brand-black">{stat.value}</p>
                <p className="text-[12px] text-brand-mid font-light mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Droite : feature cards */}
        <div className="flex flex-col gap-4">
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              ),
              title: "Administration locale",
              desc: "Des agents municipaux certifiés vous accompagnent avec une connaissance précise des procédures locales.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              ),
              title: "Tout en un seul endroit",
              desc: "Déposez, suivez et recevez tous vos documents officiels depuis votre espace personnel sécurisé.",
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              ),
              title: "Assistance 24h/24",
              desc: "Camille répond à vos questions à tout moment. Notre équipe humaine prend le relais sous 24h ouvrables.",
            },
          ].map(card => (
            <div key={card.title} className="feature-card">
              <div className="feature-icon">{card.icon}</div>
              <div>
                <h4 className="font-bold text-brand-black text-sm mb-1">{card.title}</h4>
                <p className="text-brand-mid text-sm font-light leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
