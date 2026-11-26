import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Menu, X } from 'lucide-react';
import { BUSINESS_LOGO, BUSINESS_NAME } from '../../data/mockData';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigateToSimulator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigateToSimulator,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Diseña tu Evento', href: '#disena-tu-evento', highlight: true },
    { label: 'Paquetes', href: '#nuestros-paquetes' },
    { label: 'Catálogo', href: '#tienda-boutique' },
    { label: 'Galería', href: '#instagram-galeria' },
    { label: 'Testimonios', href: '#testimonios' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FCE9EC]/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Full Uncropped Logo & Brand Wordmark */}
        <a
          href="#"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-13 h-13 rounded-full bg-[#EB7B82] border-2 border-[#FFFDFB] shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={BUSINESS_LOGO}
              alt={BUSINESS_NAME}
              className="w-full h-full object-contain scale-105"
            />
          </div>
          <span className="font-serif-display text-xl md:text-2xl font-bold tracking-tight text-[#3A2529]">
            {BUSINESS_NAME}
          </span>
        </a>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#75565C]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`hover:text-[#C84673] transition-colors whitespace-nowrap shrink-0 ${
                link.highlight
                  ? 'text-[#C84673] font-bold underline underline-offset-4 decoration-[#F9E396] decoration-2'
                  : ''
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Cart & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-[#FFFDFB] hover:bg-[#F6CFD6] text-[#3A2529] border border-[#F6CFD6] transition-colors flex items-center gap-1.5"
            title="Bolsa de compras"
          >
            <ShoppingBag className="w-4 h-4 text-[#C84673]" />
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#C84673] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onNavigateToSimulator}
            className="hidden sm:flex px-4 py-2.5 text-xs font-bold text-white bg-[#C84673] hover:bg-[#B03862] rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0 items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F9E396]" />
            Diseña tu Evento
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#3A2529] hover:bg-[#FFFDFB]"
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Delicate Scalloped Pastel-Pink Awning Edge (Reference Motif) */}
      <div
        aria-hidden="true"
        className="w-full h-3 overflow-hidden pointer-events-none select-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12px 0, #FCE9EC 11px, transparent 11.5px)',
          backgroundSize: '24px 12px',
          backgroundRepeat: 'repeat-x',
        }}
      />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDFB] border-b border-[#EFE2E4] px-6 py-5 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#3A2529] py-1.5 hover:text-[#C84673]"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigateToSimulator();
            }}
            className="w-full mt-3 py-2.5 text-xs font-semibold text-white bg-[#C84673] rounded-xl shadow-sm flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F9E396]" />
            Diseña tu Evento
          </button>
        </div>
      )}
    </header>
  );
};
