// Server Component — statique
const CharleroisLogo = ({ fill = "white" }: { fill?: string }) => (
  <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" fill={fill} width="28" height="40">
    <polygon points="4,38 22,3 40,38"/>
    <polygon points="30,38 50,1 70,38"/>
    <polygon points="60,38 78,3 96,38"/>
    <path d="M80 57 A46 46 0 1 0 80 127 L67 113 A27 27 0 1 1 67 71 Z"/>
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
