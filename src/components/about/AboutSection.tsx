import React from 'react';
import {
  SHOP_PLATO_CERAMICA_IMAGE,
  SHOP_PAQUETE_ESENCIAL_IMAGE,
  BUSINESS_LOGO,
  BUSINESS_NAME,
} from '../../data/mockData';
import { Sparkles, Heart, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="sobre-nosotros" className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#EFE2E4]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden bg-[#FCE9EC] shadow-xl border border-[#F6CFD6] h-96">
            <img
              src={SHOP_PLATO_CERAMICA_IMAGE}
              alt={`Taller artesanal ${BUSINESS_NAME}`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="absolute -bottom-8 -right-4 w-3/5 rounded-3xl overflow-hidden bg-[#FFFDFB] shadow-2xl border-4 border-[#FFFDFB] hidden sm:block h-52">
            <img
              src={SHOP_PAQUETE_ESENCIAL_IMAGE}
              alt={`Decoración natural de eventos ${BUSINESS_NAME} en Pasto`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EB7B82] border-2 border-[#F6CFD6] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={BUSINESS_LOGO}
                alt={BUSINESS_NAME}
                className="w-full h-full object-contain scale-105"
              />
            </div>
            <span className="text-xs tracking-widest text-[#C84673] uppercase font-semibold">
              Nuestra Esencia · {BUSINESS_NAME} · Pasto, Nariño
            </span>
          </div>

          <h2 className="font-serif-display text-4xl md:text-5xl text-[#3A2529] leading-tight">
            "Cada celebración merece un rincón lleno de armonía, calidez y buen gusto"
          </h2>

          <p className="text-sm md:text-base text-[#75565C] leading-relaxed">
            {BUSINESS_NAME} nació en Pasto, Nariño, con el propósito de transformar reuniones familiares, cumpleaños
            de damas, bautizos y aniversarios en escenarios memorables, lejos de lo recargado o genérico.
          </p>

          <p className="text-sm text-[#3A2529] leading-relaxed">
            Combinamos arcos orgánicos con paletas en rosas pasteles, rosas fuertes y amarillo suave junto a
            mobiliario limpio, floristería fresca, cerámica hecha a mano y anchetas personalizadas diseñadas con cariño.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#EFE2E4]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3A2529]">
                <Sparkles className="w-4 h-4 text-[#C84673]" />
                Estilo Natural
              </div>
              <p className="text-xs text-[#75565C]">
                Diseños femeninos y elegantes pensados para lucir reales en tu espacio.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3A2529]">
                <Heart className="w-4 h-4 text-[#C84673]" />
                Hecho en Pasto
              </div>
              <p className="text-xs text-[#75565C]">
                Atención cercana, montaje puntual y detalles hechos a mano.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3A2529]">
                <Compass className="w-4 h-4 text-[#C84673]" />
                Visualizador 3D
              </div>
              <p className="text-xs text-[#75565C]">
                Prueba colores, arcos y paquetes antes de confirmar tu fecha.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
