// Server Component — statique
import { SERVICES } from '@/lib/services.constants'

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
