import React from 'react';
import { MessageCircle, Heart, Instagram, Facebook, Phone, MapPin, Lock } from 'lucide-react';
import {
  BUSINESS_ADDRESS,
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_LOGO,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP_CLEAN,
} from '../../data/mockData';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const floatingWhatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=${encodeURIComponent(
    `Hola ${BUSINESS_NAME}! ✨ Sí, quiero solicitar mi código para la previsualización de mi evento.`
  )}`;

  return (
    <>
      <footer className="bg-[#FDF5F7] border-t border-[#F6CFD6] text-[#3A2529] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#EFE2E4]">
            {/* Col 1: Logo, Wordmark & Manifesto */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#EB7B82] border-2 border-[#FFFDFB] shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={BUSINESS_LOGO}
                    alt={BUSINESS_NAME}
                    className="w-full h-full object-contain scale-105"
                  />
                </div>
                <span className="font-serif-display text-3xl font-semibold tracking-tight block text-[#3A2529]">
                  {BUSINESS_NAME}
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#75565C] leading-relaxed max-w-sm">
                Estudio creativo de decoración de eventos, arcos orgánicos, mobiliario, cerámicas artesanales y
                anchetas personalizadas en Pasto y Nariño, Colombia.
              </p>
              <div className="text-xs text-[#75565C] flex items-center gap-1.5 pt-2">
                <span>Hecho con amor y delicadeza en Pasto, Nariño</span>
                <Heart className="w-3.5 h-3.5 text-[#C84673] fill-[#C84673]" />
              </div>
            </div>

            {/* Col 2: Services Quick Links */}
            <div className="lg:col-span-3 space-y-3">
              <h5 className="font-serif-display text-lg text-[#3A2529] font-semibold">
                Nuestros Servicios
              </h5>
              <ul className="space-y-2 text-xs text-[#75565C]">
                <li><a href="#disena-tu-evento" className="hover:text-[#C84673] transition-colors">Diseña tu Evento en RA</a></li>
                <li><a href="#nuestros-paquetes" className="hover:text-[#C84673] transition-colors">Paquetes: Esencial, Especial e Inolvidable</a></li>
                <li><a href="#tienda-boutique" className="hover:text-[#C84673] transition-colors">Catálogo, Cerámicas & Anchetas</a></li>
                <li><a href="#instagram-galeria" className="hover:text-[#C84673] transition-colors">Galería @el_rinconcitode_eli</a></li>
                <li><a href="#testimonios" className="hover:text-[#C84673] transition-colors">Testimonios Reales</a></li>
                <li><a href="#contacto" className="hover:text-[#C84673] transition-colors">Contacto & Preguntas</a></li>
              </ul>
            </div>

            {/* Col 3: Contact & Hours */}
            <div className="lg:col-span-4 space-y-3">
              <h5 className="font-serif-display text-lg text-[#3A2529] font-semibold">
                Taller & Atención Directa
              </h5>
              <div className="space-y-2 text-xs text-[#75565C]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C84673] shrink-0 mt-0.5" />
                  <span>{BUSINESS_ADDRESS}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C84673] shrink-0" />
                  <span>{BUSINESS_PHONE} (WhatsApp Oficial)</span>
                </p>
                <p>Lunes a Sábado: 8:30 AM – 6:30 PM (Pasto)</p>
                <p className="text-[11px] text-[#75565C]/90">
                  Instagram:{' '}
                  <a
                    href={BUSINESS_INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#C84673] hover:underline"
                  >
                    {BUSINESS_INSTAGRAM_HANDLE}
                  </a>{' '}
                  · Atención directa por WhatsApp
                </p>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <a
                  href={BUSINESS_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#FFFDFB] border border-[#F6CFD6] flex items-center justify-center text-[#C84673] hover:bg-[#C84673] hover:text-white transition-colors"
                  title={`Instagram ${BUSINESS_INSTAGRAM_HANDLE}`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#FFFDFB] border border-[#F6CFD6] flex items-center justify-center text-[#C84673] hover:bg-[#C84673] hover:text-white transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={floatingWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#FFFDFB] border border-[#F6CFD6] flex items-center justify-center text-[#25D366] hover:border-[#25D366] transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#75565C] gap-4">
            <p>© {new Date().getFullYear()} {BUSINESS_NAME}. Pasto, Nariño, Colombia. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <span>Pasto & Nariño</span>
              <span>·</span>
              <a
                href={BUSINESS_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C84673] transition-colors"
              >
                {BUSINESS_INSTAGRAM_HANDLE}
              </a>
              {onOpenAdmin && (
                <>
                  <span>·</span>
                  <button
                    onClick={onOpenAdmin}
                    className="inline-flex items-center gap-1 text-[#75565C]/70 hover:text-[#C84673] transition-colors"
                    title="Acceso exclusivo para la administradora"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Administración</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky WhatsApp Button (+57 324 5642497) */}
      <a
        href={floatingWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3 rounded-full shadow-xl flex items-center gap-2.5 group transition-transform hover:scale-105"
        title={`Solicitar código para previsualización por WhatsApp (${BUSINESS_PHONE})`}
      >
        <MessageCircle className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">
          Pedir código · {BUSINESS_PHONE}
        </span>
      </a>
    </>
  );
};
