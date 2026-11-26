import React from 'react';
import {
  IG_BIRTHDAY_IMAGE,
  IG_BAPTISM_IMAGE,
  IG_ANCHETAS_IMAGE,
  NATURAL_ANNIVERSARY_IMAGE,
  BUSINESS_NAME,
} from '../../data/mockData';
import { ArrowRight, Star } from 'lucide-react';

interface TestimonialsSectionProps {
  onNavigateToSimulator?: () => void;
}

interface ClientTestimonial {
  id: string;
  quote: string;
  outcome: string;
  clientName: string;
  occasion: string;
  packageUsed: string;
  location: string;
  dateLabel: string;
  image: string;
}

const FEATURED_TESTIMONIAL: ClientTestimonial = {
  id: 'test-featured',
  quote:
    'Queríamos celebrar los 50 años de mi mamá en la sala de la casa sin que se viera recargado ni infantil. En el simulador probamos los tonos rosa pastel, rosa fuerte y el toque amarillo suave, y el día del montaje quedó idéntico, cálido y lleno de flores frescas.',
  outcome: 'Montaje completo en 2 horas · Más de 30 invitados sorprendidos en casa',
  clientName: 'Gloria Inés Córdoba & Familia',
  occasion: 'Cumpleaños de Damas',
  packageUsed: 'Paquete Rinconcito Especial',
  location: 'Morasurco, Pasto',
  dateLabel: 'Octubre 2026',
  image: IG_BIRTHDAY_IMAGE,
};

const EDITORIAL_REVIEWS: ClientTestimonial[] = [
  {
    id: 'test-2',
    quote:
      'Antes de reservar me daba miedo que los colores no combinaran con el salón. Al enviar mi previsualización me asesoraron por WhatsApp y ajustaron los pedestales acanalados con eucalipto. La mesa principal parecía de revista.',
    outcome: 'Previsualización aprobada 15 días antes · Puntualidad en montaje',
    clientName: 'Dra. Patricia Montenegro',
    occasion: 'Aniversario & Grado Familiar',
    packageUsed: 'Paquete Rinconcito Inolvidable',
    location: 'Las Cuadras, Pasto',
    dateLabel: 'Septiembre 2026',
    image: NATURAL_ANNIVERSARY_IMAGE,
  },
  {
    id: 'test-3',
    quote:
      'Para el bautizo de nuestra hija buscábamos algo luminoso, tierno y delicado para el almuerzo familiar. El aro dorado con rosas frescas y los floreros de cerámica artesanal armonizaron perfecto con la luz natural del comedor.',
    outcome: 'Ambientación diurna con floristería natural y cerámica artesanal',
    clientName: 'Andrea Rosero & Juan Carlos Enríquez',
    occasion: 'Bautizo & Mesa de Postres',
    packageUsed: 'Paquete Rinconcito Especial',
    location: 'San Ignacio, Pasto',
    dateLabel: 'Noviembre 2026',
    image: IG_BAPTISM_IMAGE,
  },
  {
    id: 'test-4',
    quote:
      'Encargué una ancheta en caja de madera con taza marcada a mano y flores preservadas para el cumpleaños de mi mamá. Llegó puntual en Pasto, con una presentación tan cuidada que guardó hasta la cinta y la tarjeta caligrafiada.',
    outcome: 'Entrega en menos de 24 horas en Pasto con cerámica personalizada',
    clientName: 'Camila Andrea Benavides',
    occasion: 'Regalo & Ancheta Personalizada',
    packageUsed: 'Ancheta Celebración de Dama',
    location: 'Pasto, Nariño',
    dateLabel: 'Noviembre 2026',
    image: IG_ANCHETAS_IMAGE,
  },
];

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onNavigateToSimulator,
}) => {
  return (
    <section
      id="testimonios"
      className="py-24 px-4 md:px-8 bg-[#F7EFE6]/70 border-t border-[#EFE2E4] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E6D5CD]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs tracking-widest text-[#C84673] uppercase font-semibold">
              <span>Testimonios Reales</span>
              <span aria-hidden="true">·</span>
              <span>{BUSINESS_NAME}</span>
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#3A2529] mt-2 leading-tight text-balance">
              Historias que Florecieron en{' '}
              <span className="italic text-[#C84673] font-medium">Pasto & Nariño</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-[#75565C]">
            <div className="flex items-center gap-1 text-[#C84673]" aria-label="Calificación 5 de 5">
              {[0, 1, 2, 3, 4].map((idx) => (
                <Star key={idx} className="w-4 h-4 fill-[#C84673] text-[#C84673]" />
              ))}
            </div>
            <div className="leading-snug">
              <span className="font-semibold text-[#3A2529] tabular-nums">4.9 / 5.0</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Familias y anfitrionas verificadas en Nariño</span>
            </div>
          </div>
        </div>

        {/* Asymmetric Editorial Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          {/* Featured Editorial Story (5 Columns) */}
          <article className="lg:col-span-5 bg-[#FCE9EC]/85 rounded-3xl border border-[#F6CFD6] shadow-sm p-7 sm:p-9 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-[#75565C]">
                <span className="font-semibold text-[#C84673]">{FEATURED_TESTIMONIAL.occasion}</span>
                <span>{FEATURED_TESTIMONIAL.dateLabel}</span>
              </div>

              <div className="h-52 rounded-2xl overflow-hidden border border-[#FFFDFB] bg-[#FFFDFB]">
                <img
                  src={FEATURED_TESTIMONIAL.image}
                  alt={`${FEATURED_TESTIMONIAL.occasion} - ${FEATURED_TESTIMONIAL.clientName}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <blockquote className="font-serif-display italic text-2xl md:text-[26px] text-[#3A2529] leading-[1.35]">
                “{FEATURED_TESTIMONIAL.quote}”
              </blockquote>

              <p className="text-xs text-[#75565C] leading-relaxed">
                {FEATURED_TESTIMONIAL.outcome}
              </p>
            </div>

            <footer className="pt-5 border-t border-[#F6CFD6] flex items-end justify-between gap-4">
              <div>
                <div className="font-serif-display text-xl font-semibold text-[#3A2529]">
                  {FEATURED_TESTIMONIAL.clientName}
                </div>
                <div className="text-xs text-[#75565C] mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span>{FEATURED_TESTIMONIAL.packageUsed}</span>
                  <span aria-hidden="true">·</span>
                  <span>{FEATURED_TESTIMONIAL.location}</span>
                </div>
              </div>
            </footer>
          </article>

          {/* Editorial Review Column (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            {EDITORIAL_REVIEWS.map((review) => (
              <article
                key={review.id}
                className="bg-[#FFFDFB] rounded-3xl border border-[#EFE2E4] shadow-xs p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start hover:border-[#F6CFD6] transition-colors"
              >
                <div className="w-full sm:w-28 h-40 sm:h-28 rounded-2xl overflow-hidden bg-[#FCE9EC] shrink-0">
                  <img
                    src={review.image}
                    alt={`${review.occasion} - ${review.clientName}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#75565C]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#C84673]">{review.occasion}</span>
                      <span aria-hidden="true">·</span>
                      <span>{review.packageUsed}</span>
                    </div>
                    <span>{review.dateLabel}</span>
                  </div>

                  <blockquote className="font-serif-display italic text-xl md:text-[22px] text-[#3A2529] leading-snug">
                    “{review.quote}”
                  </blockquote>

                  <div className="pt-2 border-t border-[#F7EFE6] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#3A2529]">{review.clientName}</span>
                      <span className="mx-1.5 text-[#75565C]" aria-hidden="true">·</span>
                      <span className="text-[#75565C]">{review.location}</span>
                    </div>
                    <span className="text-[11px] text-[#75565C]">{review.outcome}</span>
                  </div>
                </div>
              </article>
            ))}

            {onNavigateToSimulator && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <p className="text-xs text-[#75565C]">
                  ¿Lista para crear tu propia celebración con acompañamiento cercano?
                </p>
                <button
                  onClick={onNavigateToSimulator}
                  className="px-5 py-2.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Diseñar mi Celebración</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
