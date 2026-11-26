import React, { useState } from 'react';
import { Phone, MapPin, Clock, MessageCircle, Send, Check, ChevronDown } from 'lucide-react';
import {
  BUSINESS_ADDRESS,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP_CLEAN,
} from '../../data/mockData';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventType: 'Cumpleaños de Damas',
    date: '',
    city: 'Pasto, Nariño',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        eventType: 'Cumpleaños de Damas',
        date: '',
        city: 'Pasto, Nariño',
        notes: '',
      });
    }, 3000);
  };

  const FAQS = [
    {
      q: '¿Con cuánto tiempo de anticipación debo reservar mi evento en Pasto o Nariño?',
      a: 'Recomendamos agendar con un mínimo de 10 a 20 días de anticipación para celebraciones, bautizos y aniversarios. Para anchetas y cerámicas personalizadas contamos con entregas en 24 a 48 horas en Pasto.',
    },
    {
      q: '¿Puedo personalizar los colores de los paquetes Rinconcito Esencial, Especial e Inolvidable?',
      a: '¡Sí! En nuestro simulador "Diseña tu Evento" puedes cargar cualquiera de los 3 paquetes y cambiar los colores de cada arco, panel o mobiliario a tu gusto.',
    },
    {
      q: '¿Realizan montajes y entregas fuera del centro de Pasto?',
      a: '¡Sí! Atendemos montajes en Morasurco, Las Cuadras, Chachagüí, Catambuco, Ipiales, Túquerres y municipios cercanos en Nariño.',
    },
    {
      q: '¿Cómo recibo la previsualización de mi diseño?',
      a: 'En el Paso 5 del simulador ingresas tu correo electrónico y te enviaremos la previsualización visual junto con tu presupuesto desglosado, además de nuestra atención directa por WhatsApp.',
    },
  ];

  return (
    <section
      id="contacto"
      className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#EFE2E4] scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-7">
          <div>
            <span className="text-xs tracking-widest text-[#C84673] uppercase font-semibold">
              {BUSINESS_NAME} · Pasto, Nariño
            </span>
            <h2 className="font-serif-display text-4xl md:text-5xl text-[#3A2529] mt-2">
              Conversemos sobre tu Celebración
            </h2>
            <p className="text-sm text-[#75565C] mt-3 leading-relaxed">
              Atención cálida y personalizada en Pasto, Nariño. Escríbenos a nuestra línea oficial de WhatsApp o
              déjanos tus datos para asesorarte sin compromiso.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FCE9EC] text-[#C84673] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#75565C] block">Taller Creativo:</span>
                <span className="text-sm font-semibold text-[#3A2529]">{BUSINESS_ADDRESS}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FCE9EC] text-[#C84673] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#75565C] block">WhatsApp Oficial de la Empresa:</span>
                <span className="text-sm font-semibold text-[#3A2529]">
                  {BUSINESS_PHONE} (Línea directa en Colombia)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF5D1] text-[#A87E1E] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#75565C] block">Horario de Atención:</span>
                <span className="text-sm font-semibold text-[#3A2529]">
                  Lunes a Sábado: 8:30 AM – 6:30 PM (Pasto, Nariño)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FCE9EC]/60 border border-[#F6CFD6] text-xs text-[#75565C] leading-relaxed">
              <span className="font-semibold text-[#3A2529]">Canal Oficial: </span>
              {BUSINESS_NAME} no maneja correo corporativo abierto; atendemos todas tus cotizaciones directamente por
              nuestra línea de WhatsApp ({BUSINESS_PHONE}) y en nuestro taller en Pasto.
            </div>
          </div>

          <a
            href={`https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=Hola%20${encodeURIComponent(
              BUSINESS_NAME
            )}!%20Quisiera%20solicitar%20asesor%C3%ADa%20para%20un%20evento%20en%20Pasto%20Nari%C3%B1o.`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl bg-[#25D366] text-white flex items-center justify-between shadow-md hover:bg-[#20ba5a] transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <div className="text-xs font-medium opacity-95">WhatsApp de {BUSINESS_NAME}</div>
                <div className="text-sm font-bold">{BUSINESS_PHONE} · Chatear Ahora</div>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full font-semibold">
              Pasto, Nariño
            </span>
          </a>
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div className="bg-[#FFFDFB] p-6 md:p-8 rounded-3xl border border-[#EFE2E4] shadow-sm">
            <h3 className="font-serif-display text-2xl text-[#3A2529] mb-1">
              Solicitar Cotización Personalizada
            </h3>
            <p className="text-xs text-[#75565C] mb-6">
              Déjanos tu número de WhatsApp y fecha estimada para enviarte opciones ideales.
            </p>

            {formSubmitted ? (
              <div className="p-8 text-center bg-[#FCE9EC]/60 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#C84673] text-white flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-serif-display text-xl text-[#3A2529] font-semibold">
                  ¡Solicitud Recibida!
                </h4>
                <p className="text-xs text-[#75565C] mt-1 max-w-sm mx-auto">
                  Nuestro equipo en Pasto te escribirá a tu WhatsApp muy pronto.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Tu Nombre *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Luz Marina Córdoba"
                      className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Tu WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+57 300 000 0000"
                      className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Tipo de Evento</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                    >
                      <option>Cumpleaños de Damas</option>
                      <option>Boda o Aniversario</option>
                      <option>Bautizo o Primera Comunión</option>
                      <option>Baby Shower</option>
                      <option>Graduación</option>
                      <option>Evento Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Fecha Estimada</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Ciudad / Municipio</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Pasto, Nariño..."
                      className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#3A2529] block mb-1">
                    Detalles, Paquete de Interés o Colores:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ej: Me interesa el paquete Rinconcito Especial en tonos rosa pastel y amarillo suave..."
                    className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Solicitud de Asesoría
                </button>
              </form>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-serif-display text-2xl text-[#3A2529]">Preguntas Frecuentes</h4>
            <div className="space-y-2">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-[#EFE2E4] bg-[#FFFDFB] overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-[#3A2529] hover:bg-[#FDF5F7]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#C84673] transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#75565C] leading-relaxed border-t border-[#EFE2E4] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
