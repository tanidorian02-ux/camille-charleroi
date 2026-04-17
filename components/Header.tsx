'use client'

import { useState } from 'react'

const CharleroisLogo = () => (
  <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" fill="#866ca0" width="100%" height="100%">
    <polygon points="4,38 22,3 40,38"/>
    <polygon points="30,38 50,1 70,38"/>
    <polygon points="60,38 78,3 96,38"/>
    <path d="M80 57 A46 46 0 1 0 80 127 L67 113 A27 27 0 1 1 67 71 Z"/>
  </svg>
)

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between h-[68px] gap-6">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-[44px]">
            <CharleroisLogo />
          </div>
          <div className="leading-none">
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-brand-black">Charleroi</p>
            <p className="text-[9px] font-normal tracking-widest text-brand-mid uppercase mt-0.5">Projet Camille</p>
          </div>
        </a>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] font-medium text-brand-mid tracking-wide uppercase flex-1 justify-center">
          <a href="#services" className="nav-link">Services</a>
          <a href="#apropos"  className="nav-link">À propos</a>
          <a href="#bot"      className="nav-link">Camille</a>
        </nav>

        {/* Search + CTA desktop */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-[12px] text-brand-mid hover:border-brand-red transition-colors cursor-pointer">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="#6B6B6B" strokeWidth="1.5"/>
              <path d="M14 14l3 3" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Rechercher un service...
          </div>
          <a href="#bot" className="inline-flex items-center gap-2 bg-brand-black text-white rounded-full text-[11px] font-semibold tracking-wider uppercase px-5 py-2.5 hover:bg-brand-black/80 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Parler à Camille
          </a>
        </div>

        {/* CTA mobile/tablet */}
        <div className="flex items-center gap-2 lg:hidden">
          <a href="#bot" className="bg-brand-red text-white text-[11px] font-semibold tracking-wider uppercase px-4 py-2.5 rounded-full hidden sm:inline-flex">
            Parler à Camille
          </a>
          <button
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden p-2 flex flex-col gap-1.5 focus:outline-none"
          >
            <span className={`w-5 h-[1.5px] bg-brand-black block transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`w-5 h-[1.5px] bg-brand-black block transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-[1.5px] bg-brand-black block transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1">
          {[
            { href: "#services", label: "Services" },
            { href: "#apropos",  label: "À propos" },
            { href: "#bot",      label: "Camille" },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="nav-link py-2.5 text-sm font-medium uppercase tracking-wide border-b border-gray-100 text-brand-mid"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#bot"
            onClick={() => setMenuOpen(false)}
            className="mt-2 bg-brand-red text-white text-[11px] font-semibold tracking-wider uppercase px-5 py-3 rounded-full text-center"
          >
            Parler à Camille
          </a>
        </div>
      )}
    </header>
  )
}
