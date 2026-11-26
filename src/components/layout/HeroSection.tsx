import React, { useState } from 'react';
import {
  HERO_BLEED_IMAGE,
  HERO_EVENT_CLASSIC,
  IG_BIRTHDAY_IMAGE,
  IG_BAPTISM_IMAGE,
  IG_ANCHETAS_IMAGE,
  NATURAL_BIRTHDAY_LADIES_IMAGE,
  NATURAL_BAPTISM_SHOWER_IMAGE,
  BABY_SHOWER_IMAGE,
  BALLOONS_IMAGE,
  NATURAL_ANNIVERSARY_IMAGE,
  WEDDING_IMAGE,
  CERAMICS_IMAGE,
  DECOR_PACKAGES,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP_CLEAN,
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_LOGO,
} from '../../data/mockData';
import { DecorPackagePreset } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Check,
  MessageCircle,
  Flower2,
  Armchair,
  Award,
  Cake,
  GraduationCap,
  Baby,
  Crown,
  Instagram,
  Gift,
} from 'lucide-react';

interface HeroSectionProps {
  onNavigateToSimulator: () => void;
  onExplorePackages: () => void;
  onSelectPackage: (pkg: DecorPackagePreset) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateToSimulator,
  onExplorePackages,
  onSelectPackage,
}) => {
  const [quickEmail, setQuickEmail] = useState('');
  const [quickVoucherNote, setQuickVoucherNote] = useState(false);

  const eventTypes = [
    {
      title: 'Cumpleaños',
      sub: 'Damas & Familia',
      image: NATURAL_BIRTHDAY_LADIES_IMAGE,
      icon: Cake,
      href: '#nuestros-paquetes',
    },
    {
      title: 'Bautizos',
      sub: 'Luz Natural',
      image: NATURAL_BAPTISM_SHOWER_IMAGE,
      icon: Flower2,
      href: '#nuestros-paquetes',
    },
    {
      title: 'Baby Shower',
      sub: 'Dulce Espera',
      image: BABY_SHOWER_IMAGE,
      icon: Baby,
      href: '#nuestros-paquetes',
    },
    {
      title: 'Aniversarios',
      sub: 'Bodas & Cenas',
      image: WEDDING_IMAGE,
      icon: Heart,
      href: '#nuestros-paquetes',
    },
    {
      title: 'Graduaciones',
      sub: 'Recepción',
      image: NATURAL_ANNIVERSARY_IMAGE,
      icon: GraduationCap,
      href: '#nuestros-paquetes',
    },
    {
      title: 'Eventos VIP',
      sub: 'A Medida',
      image: HERO_EVENT_CLASSIC,
      icon: Crown,
      href: '#disena-tu-evento',
    },
  ];

  const instagramFeed = [
    {
      src: IG_BAPTISM_IMAGE,
      caption: 'Mesa de té & bautizo · Aro dorado con eucalipto y cerámica artesanal',
    },
    {
      src: IG_ANCHETAS_IMAGE,
      caption: 'Anchetas de madera & tazas pintadas a mano para regalar con cariño',
    },
    {
      src: BALLOONS_IMAGE,
      caption: 'Arcos orgánicos multicalibre en tonos rosa pastel, fucsia y mantequilla',
    },
    {
      src: CERAMICS_IMAGE,
      caption: 'Piezas de cerámica torneadas a mano y detalles florales en Pasto, Nariño',
    },
  ];

  const handleQuickRibbonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail.trim()) return;
    setQuickVoucherNote(true);
    setTimeout(() => {
      onNavigateToSimulator();
    }, 900);
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* BAND 1: EDITORIAL GRID HERO WITH FULL-BLEED ("SANGRADA") DECORATION PHOTO */}
      <section className="relative bg-editorial-grid border-b border-[#F6CFD6]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-5 xl:col-span-5 px-6 sm:px-10 md:px-14 py-12 lg:py-20 flex flex-col justify-center space-y-6 relative z-10">
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#C84673] font-semibold">
              <span>Pasto, Nariño</span>
              <span aria-hidden="true">·</span>
              <span>{BUSINESS_INSTAGRAM_HANDLE}</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl xl:text-[58px] text-[#3A2529] font-semibold leading-[1.06] tracking-tight text-balance">
              Convertimos tus momentos en{' '}
              <span className="italic text-[#C84673] font-medium">
                recuerdos inolvidables
              </span>
            </h1>

            <p className="text-sm md:text-base text-[#75565C] leading-relaxed max-w-md">
              Decoración elegante y femenina con arcos orgánicos, mobiliario, cerámicas artesanales y anchetas
              pensadas para celebraciones en casa o salón.
            </p>

            {/* Primary CTA & Secondary Link */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onNavigateToSimulator}
                className="px-7 py-3.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 group whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#F9E396]" />
                <span>Diseña tu Evento en RA</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExplorePackages}
                className="px-5 py-3.5 bg-[#FFFDFB] hover:bg-[#FCE9EC] text-[#3A2529] text-xs font-semibold rounded-xl border border-[#F6CFD6] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>Ver paquetes</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C84673]" />
              </button>
            </div>

            {/* Hand-drawn curved arrow flourish (Editorial motif from reference) */}
            <div className="hidden lg:flex items-center gap-3 pt-2 text-[#C84673]/80">
              <svg
                width="82"
                height="38"
                viewBox="0 0 82 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 8C20 34 48 34 74 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M65 11L76 11L72 21"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-serif-display italic text-lg text-[#75565C]">
                ¡visualízalo en tu espacio antes de reservar!
              </span>
            </div>

            {/* Clean Typographic Trust Strip */}
            <div className="pt-4 border-t border-[#F6CFD6]/80 grid grid-cols-3 gap-3 text-[11px] text-[#75565C]">
              <div className="flex items-center gap-1.5">
                <Flower2 className="w-3.5 h-3.5 text-[#C84673] shrink-0" />
                <span className="font-medium">Arcos & Rosas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-[#A87E1E] shrink-0" />
                <span className="font-medium">Mobiliario</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#C84673] shrink-0" />
                <span className="font-medium">Hecho en Pasto</span>
              </div>
            </div>
          </div>

          {/* Right Column: FULL-BLEED ("IMAGEN SANGRADA") DECORATION PHOTO */}
          <div className="lg:col-span-7 xl:col-span-7 relative min-h-[380px] sm:min-h-[460px] lg:min-h-[590px]">
            <div className="w-full h-full lg:rounded-tl-[48px] overflow-hidden relative shadow-xl border-t-2 lg:border-l-2 border-[#FFFDFB]">
              <img
                src={HERO_BLEED_IMAGE}
                alt="Decoración elegante con arco orgánico rosa pastel, rosa fuerte y amarillo suave - El Rinconcito de Eli"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A2529]/50 via-transparent to-transparent" />

              {/* Editorial Callout Script Card on Photo Corner */}
              <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-sm bg-[#FFFDFB]/95 backdrop-blur-sm px-5 py-3.5 rounded-2xl border border-[#F6CFD6] shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EB7B82] border border-[#FFFDFB] flex items-center justify-center overflow-hidden shrink-0">
                  <img src={BUSINESS_LOGO} alt={BUSINESS_NAME} className="w-full h-full object-contain scale-105" />
                </div>
                <div>
                  <div className="font-serif-display text-lg font-semibold text-[#3A2529] leading-tight">
                    Montaje Real en Casa & Salón
                  </div>
                  <div className="text-[11px] text-[#75565C]">
                    Paleta en rosas pasteles, fuerte & amarillo mantequilla
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: DEEP ROSE SCALLOPED PLANNER SHEET (Inspired by Reference Band 2) */}
      <section className="bg-[#C84673] py-14 px-4 md:px-8 relative">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Cream Binder Notebook Sheet with Circular Punched Holes */}
          <div className="bg-[#FFFDFB] rounded-2xl shadow-xl overflow-hidden border border-[#F6CFD6]">
            {/* Top Binder Perforation Row */}
            <div
              aria-hidden="true"
              className="h-7 w-full bg-[#FFFDFB] border-b border-dashed border-[#F6CFD6] flex items-center justify-around px-4"
            >
              {Array.from({ length: 14 }).map((_, idx) => (
                <span
                  key={idx}
                  className="w-3.5 h-3.5 rounded-full bg-[#C84673] shadow-inner shrink-0"
                />
              ))}
            </div>

            <div className="p-6 md:p-10">
              <div className="text-center mb-7">
                <span className="text-[11px] tracking-widest uppercase font-bold text-[#C84673]">
                  Agenda Creativa · Pasto, Nariño
                </span>
                <h2 className="font-serif-display text-3xl md:text-4xl text-[#3A2529] font-semibold mt-1">
                  ¿Qué tipo de evento quieres decorar?
                </h2>
              </div>

              {/* Structured 6-Column Planner Grid matching Reference Table Style */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-[#C84673]/30 rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#C84673]/25">
                {eventTypes.map((ev, index) => {
                  const Icon = ev.icon;
                  const headerBg =
                    index % 3 === 0
                      ? 'bg-[#3A2529] text-[#FFFDFB]'
                      : index % 3 === 1
                      ? 'bg-[#C84673] text-white'
                      : 'bg-[#EB7B82] text-white';
                  return (
                    <a
                      key={ev.title}
                      href={ev.href}
                      className="group flex flex-col bg-[#FFFDFB] hover:bg-[#FCE9EC]/50 transition-colors"
                    >
                      <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${headerBg}`}>
                        <span className="truncate">{ev.title}</span>
                        <Icon className="w-3 h-3 shrink-0 opacity-90" />
                      </div>
                      <div className="p-3 flex-1 flex flex-col items-center text-center gap-2.5">
                        <div className="w-full h-24 rounded-lg overflow-hidden bg-[#FCE9EC] border border-[#F6CFD6]">
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#3A2529] group-hover:text-[#C84673] underline underline-offset-4 decoration-[#F6CFD6]">
                          {ev.sub}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={onNavigateToSimulator}
                  className="px-6 py-2.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  <span>Diseñar mi Celebración Ahora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Blush-Pink Ribbon Banner underneath Binder (Inspired by Reference Newsletter Strip) */}
          <form
            onSubmit={handleQuickRibbonSubmit}
            className="bg-[#FCE9EC] rounded-2xl px-5 py-3.5 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 border border-[#FFFDFB]"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#3A2529] text-center md:text-left">
              <Gift className="w-4 h-4 text-[#C84673] shrink-0" />
              <span>
                ¡RECIBE LA IMAGEN DE TU PREVISUALIZACIÓN CON UN BONO DE DESCUENTO DEL 10% EN TU CORREO!
              </span>
            </div>
            {quickVoucherNote ? (
              <div className="text-xs font-bold text-[#C84673] bg-[#FFFDFB] px-4 py-1.5 rounded-xl">
                ¡Perfecto! Llevándote al diseñador para crear tu evento...
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="email"
                  required
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  placeholder="Tu correo electrónico..."
                  className="flex-1 md:w-56 text-xs px-3 py-2 rounded-lg bg-[#FFFDFB] border border-[#F6CFD6] text-[#3A2529] focus:outline-none focus:border-[#C84673]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3A2529] hover:bg-black text-white text-xs font-bold rounded-lg whitespace-nowrap shrink-0 transition-colors"
                >
                  Ir a Diseñar
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* BAND 3: VERTICAL PASTEL STRIPES SPLIT + PACKAGES (Inspired by Reference Band 3) */}
      <section id="nuestros-paquetes" className="scroll-mt-20 border-b border-[#F6CFD6]">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Copy & Enlarged Package Stamp Cards */}
          <div className="lg:col-span-7 bg-[#FFFDFB] px-6 sm:px-10 md:px-12 py-10 lg:py-14 flex flex-col justify-center">
            <div className="w-full max-w-2xl mx-auto lg:mx-0 space-y-5">
              <span className="text-xs tracking-widest text-[#C84673] uppercase font-bold block">
                Cumpleaños · Bautizos · Aniversarios · Tés de Damas
              </span>
              <h2 className="font-serif-display text-4xl sm:text-5xl text-[#3A2529] font-semibold leading-tight text-balance">
                Tu celebración merece un{' '}
                <span className="italic text-[#C84673]">rincón soñado</span>
              </h2>
              <p className="text-sm text-[#75565C] leading-relaxed max-w-xl">
                Elige uno de nuestros 3 paquetes predeterminados y personalízalo con un clic en el simulador en Realidad
                Aumentada, cambiando colores de globos, mobiliario y detalles florales.
              </p>

              {/* 3 Enlarged Iconic Pastel Stamp Cards (Esencial / Especial / Inolvidable) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {DECOR_PACKAGES.map((pkg, idx) => {
                  const stampBg =
                    idx === 0
                      ? 'bg-[#F6CFD6] text-[#3A2529] border-[#EB7B82]/50'
                      : idx === 1
                      ? 'bg-[#C84673] text-white border-[#C84673]'
                      : 'bg-[#F9E396] text-[#3A2529] border-[#E6CA85]';
                  const subText =
                    idx === 0
                      ? 'Celebración íntima'
                      : idx === 1
                      ? 'Mobiliario & neón'
                      : 'Escenario de gala';
                  return (
                    <button
                      key={pkg.id}
                      onClick={() => onSelectPackage(pkg)}
                      className={`w-full min-h-[148px] sm:min-h-[164px] rounded-[28px] border-2 border-dashed ${stampBg} px-4 py-5 flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.03] hover:shadow-md transition-all cursor-pointer`}
                      title={`Cargar ${pkg.name} en el simulador`}
                    >
                      <span className="font-serif-display text-3xl sm:text-4xl font-bold leading-none tabular-nums">
                        ${(pkg.price / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wide mt-2 leading-tight">
                        {pkg.name.replace('Rinconcito ', '')}
                      </span>
                      <span className="text-[11px] opacity-85 mt-1 leading-snug">
                        {subText}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90 mt-2.5 inline-flex items-center gap-1">
                        <span>1 clic en RA</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <button
                  onClick={onNavigateToSimulator}
                  className="px-7 py-3.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  <span>Abrir Simulador Personalizado</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Pastel Vertical Stripes + Taped Polaroid Scrapbook Photo */}
          <div className="lg:col-span-5 bg-pastel-stripes px-6 py-10 lg:py-14 flex items-center justify-center relative overflow-hidden">
            <div className="relative max-w-md w-full">
              {/* Top Scalloped Seal Badge */}
              <div className="absolute -top-5 left-6 z-20 px-4 py-1.5 rounded-full bg-[#EB7B82] text-white font-serif-display italic text-sm shadow-md -rotate-3 border border-[#FFFDFB]">
                ¡diseñado para enamorar!
              </div>

              {/* Pastel Pink Washi Tape Top-Right & Bottom-Left */}
              <div
                aria-hidden="true"
                className="w-20 h-6 bg-[#C84673]/80 absolute -top-2 right-6 z-20 rotate-12 shadow-xs"
              />
              <div
                aria-hidden="true"
                className="w-20 h-6 bg-[#F9E396]/90 absolute -bottom-2 left-6 z-20 rotate-12 shadow-xs"
              />

              {/* Polaroid Photo Card */}
              <div className="bg-[#FFFDFB] p-3.5 pb-6 rounded-2xl shadow-xl border border-[#F6CFD6] rotate-1">
                <div className="h-72 sm:h-80 rounded-xl overflow-hidden bg-[#FCE9EC]">
                  <img
                    src={IG_BIRTHDAY_IMAGE}
                    alt="Celebración de cumpleaños en Pasto - El Rinconcito de Eli"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="pt-3 flex items-center justify-between text-xs text-[#3A2529]">
                  <span className="font-serif-display italic text-base font-semibold">
                    Momentos reales en Pasto, Nariño
                  </span>
                  <span className="text-[11px] font-semibold text-[#C84673]">
                    {BUSINESS_INSTAGRAM_HANDLE}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Package Comparison Strip directly underneath */}
        <div className="bg-[#FFFDFB] py-10 px-4 md:px-8 border-t border-[#EFE2E4]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {DECOR_PACKAGES.map((pkg, idx) => {
              const isFeatured = idx === 1;
              const isLuxury = idx === 2;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all ${
                    isFeatured
                      ? 'bg-gradient-to-b from-[#FFFDFB] to-[#FCE9EC]/60 border-2 border-[#EB7B82] shadow-md'
                      : isLuxury
                      ? 'bg-gradient-to-b from-[#FFFDFB] to-[#FDF6D7]/60 border border-[#E6CA85] shadow-sm'
                      : 'bg-[#FFFDFB] border border-[#EFE2E4] shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-serif-display text-2xl font-semibold text-[#3A2529]">
                        {pkg.name}
                      </h3>
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: pkg.badgeColor }}
                      />
                    </div>
                    <p className="text-xs text-[#75565C] leading-relaxed mb-4">{pkg.tagline}</p>

                    <div className="mb-4 pb-4 border-b border-[#EFE2E4]">
                      <span className="text-[11px] text-[#75565C] block">Desde</span>
                      <span className="font-serif-display text-3xl font-bold text-[#C84673] tabular-nums">
                        ${pkg.price.toLocaleString('es-CO')}
                      </span>
                      <span className="text-xs text-[#75565C] ml-1">COP</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {pkg.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#3A2529]">
                          <Check className="w-3.5 h-3.5 text-[#C84673] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onSelectPackage(pkg)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      isFeatured || isLuxury
                        ? 'bg-[#C84673] hover:bg-[#B03862] text-white shadow-sm'
                        : 'bg-[#FCE9EC] hover:bg-[#C84673] text-[#3A2529] hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalizar este paquete</span>
                  </button>
                </div>
              );
            })}

            {/* 4th Card: Custom Idea CTA */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-[#FCE9EC] via-[#F6CFD6]/50 to-[#FDF6D7] border border-[#F6CFD6] flex flex-col justify-between text-center">
              <div className="space-y-3 pt-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFFDFB] text-[#C84673] flex items-center justify-center mx-auto shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-serif-display text-2xl font-semibold text-[#3A2529]">
                  ¿Tienes una idea en mente?
                </h3>
                <p className="text-xs text-[#75565C] leading-relaxed">
                  Cuéntanos cómo sueñas tu celebración en Pasto o Nariño y armamos una propuesta personalizada a tu
                  medida.
                </p>
              </div>

              <div className="space-y-2.5 pt-6">
                <a
                  href={`https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=${encodeURIComponent(
                    `Hola ${BUSINESS_NAME}! ✨ Sí, quiero solicitar mi código para la previsualización y cotizar mi evento.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Cotiza por WhatsApp</span>
                </a>
                <p className="text-[11px] text-[#75565C]">
                  {BUSINESS_PHONE} · Asesoría directa
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKERED GINGHAM TRANSITION RIBBON (Inspired by Reference) */}
      <div aria-hidden="true" className="w-full h-5 bg-checkered-ribbon border-y border-[#F6CFD6]" />

      {/* BAND 4: SCALLOPED INSTAGRAM SHOWCASE FRAME (@el_rinconcitode_eli) */}
      <section
        id="instagram-galeria"
        className="scroll-mt-20 bg-gradient-to-b from-[#FDF6D7]/70 via-[#FCE9EC]/60 to-[#FFFDFB] py-16 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#FFFDFB] rounded-[40px] border-4 border-dashed border-[#F6CFD6] shadow-xl p-6 sm:p-10 md:p-12 text-center space-y-8 relative">
            <div className="flex flex-col items-center space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C84673]">
                <Instagram className="w-4 h-4" />
                <span>Nuestro Estilo en Instagram</span>
                <span aria-hidden="true">·</span>
                <span>{BUSINESS_INSTAGRAM_HANDLE}</span>
              </div>
              <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl text-[#3A2529] font-semibold">
                Inspiración Real de {BUSINESS_NAME}
              </h2>
              <p className="text-xs sm:text-sm text-[#75565C] max-w-xl">
                Cada arco orgánico, pedestal, cerámica y ancheta que ves en nuestro taller cobra vida con tonos pastel,
                flores frescas y acabados delicados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
              {instagramFeed.map((post, i) => (
                <a
                  key={i}
                  href={BUSINESS_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl overflow-hidden bg-[#FDF5F7] border border-[#F6CFD6] hover:border-[#C84673] shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-52 overflow-hidden bg-[#FCE9EC]">
                    <img
                      src={post.src}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3.5 text-xs text-[#3A2529] leading-snug flex-1 flex flex-col justify-between">
                    <p className="line-clamp-2">{post.caption}</p>
                    <span className="text-[11px] font-bold text-[#C84673] mt-2 inline-flex items-center gap-1">
                      Ver en {BUSINESS_INSTAGRAM_HANDLE}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2">
              <a
                href={BUSINESS_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-2 transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#F9E396]" />
                <span>Seguir a {BUSINESS_INSTAGRAM_HANDLE} en Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
