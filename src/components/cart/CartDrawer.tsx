import React, { useState } from 'react';
import { CartItem } from '../../types';
import { X, Trash2, ShoppingBag, MessageCircle, Check, Calendar } from 'lucide-react';
import { BUSINESS_NAME, BUSINESS_WHATSAPP_CLEAN } from '../../data/mockData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [eventDate, setEventDate] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckoutWhatsapp = () => {
    if (items.length === 0) return;
    const itemList = items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.product.name} ${
            i.customEngraving ? `(Grabado: "${i.customEngraving}")` : ''
          } - $${(i.product.price * i.quantity).toLocaleString('es-CO')} COP`
      )
      .join('%0A');

    const msg = `Hola ${BUSINESS_NAME}! 🛍️ Quiero realizar el siguiente pedido desde su tienda en Pasto, Nariño:%0A%0A${itemList}%0A%0A*Total del Pedido:* $${subtotal.toLocaleString(
      'es-CO'
    )} COP%0A*Fecha deseada de entrega/evento:* ${
      eventDate || 'Por coordinar'
    }%0A%0A¿Cómo podemos proceder con el pago y confirmación?`;

    window.open(`https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=${msg}`, '_blank');
    setOrderConfirmed(true);
    setTimeout(() => {
      onClearCart();
      setOrderConfirmed(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      <div className="relative w-full max-w-md bg-[#FFFDFB] h-full shadow-2xl flex flex-col z-10 border-l border-[#F6CFD6]">
        <div className="p-5 border-b border-[#EFE2E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#C84673]" />
            <h3 className="font-serif-display text-2xl text-[#3A2529]">Tu Bolsa de Compras</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FCE9EC] text-[#3A2529] flex items-center justify-center hover:bg-[#F6CFD6] text-xs font-semibold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#75565C]">
              <div className="w-16 h-16 rounded-full bg-[#FCE9EC] flex items-center justify-center mb-3">
                <ShoppingBag className="w-7 h-7 text-[#C84673]" />
              </div>
              <h4 className="font-serif-display text-xl text-[#3A2529]">Tu bolsa está vacía</h4>
              <p className="text-xs max-w-xs mt-1">
                Explora nuestras cerámicas, anchetas y paquetes de decoración para añadir a tu pedido.
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl border border-[#EFE2E4] bg-[#FDF5F7] flex gap-3 relative"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-[#FCE9EC] shrink-0"
                />
                <div className="flex-1 min-w-0 pr-6">
                  <h5 className="text-xs font-semibold text-[#3A2529] truncate">{item.product.name}</h5>
                  {item.customEngraving && (
                    <div className="text-[10px] text-[#75565C] italic truncate">
                      Grabado: "{item.customEngraving}"
                    </div>
                  )}
                  {item.selectedColor && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-[#75565C]">Color:</span>
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: item.selectedColor }}
                      />
                    </div>
                  )}
                  <div className="text-xs font-serif-display font-bold text-[#C84673] mt-1">
                    ${(item.product.price * item.quantity).toLocaleString('es-CO')} COP
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-[#FFFDFB] border border-[#EFE2E4] text-xs font-semibold flex items-center justify-center text-[#3A2529]"
                    >
                      -
                    </button>
                    <span className="text-xs font-medium text-[#3A2529]">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#FFFDFB] border border-[#EFE2E4] text-xs font-semibold flex items-center justify-center text-[#3A2529]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-rose-600 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-[#EFE2E4] bg-[#FFFDFB] space-y-3.5">
            <div>
              <label className="text-[11px] font-medium text-[#3A2529] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#C84673]" />
                Fecha estimada del Evento o Entrega:
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
              />
            </div>

            <div className="flex items-center justify-between text-sm font-semibold text-[#3A2529] pt-2 border-t border-[#EFE2E4]">
              <span>Subtotal:</span>
              <span className="text-xl font-bold font-serif-display text-[#C84673]">
                ${subtotal.toLocaleString('es-CO')} COP
              </span>
            </div>

            {orderConfirmed ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                ¡Pedido canalizado por WhatsApp!
              </div>
            ) : (
              <button
                onClick={handleCheckoutWhatsapp}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Continuar Pedido por WhatsApp
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
