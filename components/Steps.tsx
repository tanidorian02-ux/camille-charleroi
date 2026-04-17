// Server Component — statique
const STEPS = [
  {
    num: "1",
    title: "Choisissez votre service",
    desc: "Parcourez les 6 pôles de services et sélectionnez la démarche qui vous concerne.",
  },
  {
    num: "2",
    title: "Parlez à Camille",
    desc: "Notre assistante IA vous guide, répond à vos questions et prépare votre dossier.",
  },
  {
    num: "3",
    title: "Recevez votre document",
    desc: "Votre démarche est traitée sous 24h. Recevez vos documents directement en ligne.",
  },
]

export default function Steps() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-[2px] bg-brand-red rounded" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-red">Simple</span>
            <div className="w-6 h-[2px] bg-brand-red rounded" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-black">
            Aussi simple que 1&#8209;2&#8209;3.
          </h2>
          <p className="mt-3 text-brand-mid text-sm sm:text-base font-light max-w-md mx-auto">
            Effectuez vos démarches en quelques clics, sans déplacement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Connecteur desktop */}
          <div className="hidden sm:block absolute top-6 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-[1px] bg-gradient-to-r from-brand-red via-brand-black to-brand-red opacity-20" />

          {STEPS.map(step => (
            <div key={step.num} className="step-card text-center sm:text-left">
              <div className="step-num mx-auto sm:mx-0">{step.num}</div>
              <h4 className="font-bold text-brand-black text-base mb-2">{step.title}</h4>
              <p className="text-brand-mid text-sm font-light leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
