// Server Component — statique
const CharleroisLogo = ({ fill = "white" }: { fill?: string }) => (
  <svg viewBox="0 0 250 549.04" xmlns="http://www.w3.org/2000/svg" fill={fill} width="18" height="40">
    <polygon points="177.02 0 178.03 0 228.52 84.98 23.88 85 73.97 0 74.96 0 100.18 42.27 126 .14 151.78 42.2 177.02 0"/>
    <path d="M249.42,241.54c.96,14.04.43,27.58.43,41.92l-81.9-.46c-.92-22.59,4.51-44.98-12.3-60.55s-47.87-13.75-62.19,3.95c-6.25,7.72-9.27,16.9-9.27,27.24l.04,171.69c0,15.39,8.22,27.74,21.74,33.71,16.04,7.09,34.8,5.22,48.65-5.08,6.91-6.43,12.81-13.52,12.92-23.36l.42-38.61,81.94.33v42.66s-.84,4.06-.84,4.06c-4.01,43.42-28.26,80.03-68.2,98.02-65.58,29.55-148.44,3.26-173.1-66.79-3.35-9.52-5.78-19.14-6.72-29.24l-1.03-6.05.09-193.96c2.58-25.31,10.18-48.99,26.11-68.75,46.89-58.17,143.89-59.37,193.55-3.92,18.03,20.13,27.8,45.92,29.67,73.18Z"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-[#2a1d3a] text-white/50 pt-14 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/10">

        {/* Branding */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <CharleroisLogo />
            <div>
              <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-white">Charleroi</p>
              <p className="text-[10px] text-white/40 tracking-widest uppercase">Projet Camille</p>
            </div>
          </div>
          <p className="text-sm font-light leading-relaxed max-w-xs text-white/50">
            La plateforme numérique des services administratifs de la Ville de Charleroi —
            moderne, accessible, sécurisée.
          </p>
          <div className="flex gap-2 mt-5">
            <div className="w-6 h-[2px] bg-brand-red rounded" />
            <div className="w-2 h-[2px] bg-brand-red opacity-40 rounded" />
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-red mb-4 sm:mb-5">Services</p>
          <ul className="flex flex-col gap-2 text-[13px] font-light">
            {["État Civil", "Urbanisme", "Travaux publics", "Mobilité", "Environnement", "Logement"].map(s => (
              <li key={s}>
                <a href="#services" className="hover:text-white transition-colors">{s}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Informations */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-red mb-4 sm:mb-5">Informations</p>
          <ul className="flex flex-col gap-2 text-[13px] font-light">
            <li><a href="https://www.charleroi.be" target="_blank" rel="noopener" className="hover:text-white transition-colors">charleroi.be</a></li>
            <li><a href="#bot" className="hover:text-white transition-colors">Camille – Bot vocal</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Vie privée</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Accessibilité</a></li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/25">
        <p>2025 Ville de Charleroi. Tous droits réservés.</p>
        <p>Camille – Administration numérique</p>
      </div>
    </footer>
  )
}
