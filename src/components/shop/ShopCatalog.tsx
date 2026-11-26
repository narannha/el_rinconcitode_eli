import React, { useState } from 'react';
import {
  SHOP_PRODUCTS,
  CERAMIC_PRODUCTS,
  ANCHETA_CUSTOM_OPTIONS,
  BUSINESS_NAME,
  BUSINESS_WHATSAPP_CLEAN,
} from '../../data/mockData';
import { ShopProduct, CartItem, CeramicProduct, AnchetaCustomOption } from '../../types';
import {
  Search,
  ShoppingBag,
  Check,
  Sparkles,
  Gift,
  MessageCircle,
} from 'lucide-react';

interface ShopCatalogProps {
  onAddToCart?: (item: CartItem) => void;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'decoracion' | 'globos' | 'ceramicas' | 'anchetas'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Ceramic customizer modal state
  const [selectedCeramic, setSelectedCeramic] = useState<CeramicProduct | null>(null);
  const [customText, setCustomText] = useState('Feliz Cumpleaños Gloria');
  const [selectedFinish, setSelectedFinish] = useState<'mate' | 'esmaltado' | 'terracota' | 'oro-rosa'>('esmaltado');
  const [selectedColor, setSelectedColor] = useState('#FFFDFB');
  const [ceramicAddedSuccess, setCeramicAddedSuccess] = useState(false);

  // Custom ancheta builder modal state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<AnchetaCustomOption>(ANCHETA_CUSTOM_OPTIONS[0]);
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'opt-drink-moet',
    'opt-cer-mug',
    'opt-choc-belgian',
    'opt-candle-soy',
    'opt-flow-bouquet',
  ]);
  const [cardMessage, setCardMessage] = useState(
    '¡Feliz cumpleaños! Que este nuevo año esté lleno de alegría y bendiciones.'
  );
  const [cardRecipient, setCardRecipient] = useState('Mamá / Amiga');

  const filteredProducts = SHOP_PRODUCTS.filter((prod) => {
    const matchesCat = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesQuery =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  }).sort((a, b) => {
    if (priceSort === 'asc') return a.price - b.price;
    if (priceSort === 'desc') return b.price - a.price;
    return 0;
  });

  const handleAdd = (prod: ShopProduct) => {
    if (onAddToCart) {
      onAddToCart({ product: prod, quantity: 1 });
    }
    setAddedId(prod.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const handleOpenCeramicModal = (product: CeramicProduct) => {
    setSelectedCeramic(product);
    setSelectedFinish(product.availableFinishes[0]);
    setSelectedColor(product.availableColors[0]);
    setCeramicAddedSuccess(false);
  };

  const handleAddCustomCeramic = () => {
    if (!selectedCeramic) return;
    const shopItem: ShopProduct = {
      id: selectedCeramic.id,
      name: `${selectedCeramic.name} (${selectedFinish})`,
      category: 'ceramicas',
      price: selectedCeramic.price,
      description: selectedCeramic.description,
      image: selectedCeramic.image,
      rating: 5.0,
      inStock: true,
      leadTime: 'Elaboración artesanal en 5 días hábiles',
    };

    if (onAddToCart) {
      onAddToCart({
        product: shopItem,
        quantity: 1,
        selectedColor,
        customEngraving: customText,
      });
    }

    setCeramicAddedSuccess(true);
    setTimeout(() => {
      setSelectedCeramic(null);
      setCeramicAddedSuccess(false);
    }, 1200);
  };

  const toggleAnchetaItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const customAnchetaTotal =
    selectedBox.price +
    selectedItems.reduce((acc, id) => {
      const opt = ANCHETA_CUSTOM_OPTIONS.find((o) => o.id === id);
      return acc + (opt ? opt.price : 0);
    }, 0);

  const customAnchetaWhatsAppHref = (() => {
    const includedNames = selectedItems
      .map((id) => ANCHETA_CUSTOM_OPTIONS.find((o) => o.id === id)?.name)
      .filter(Boolean);

    const msg = `Hola ${BUSINESS_NAME}! 🎁 Quiero encargar una Ancheta Personalizada desde Cero en Pasto, Nariño:\n\n*Empaque:* ${selectedBox.name}\n*Para:* ${cardRecipient}\n*Contenido:*\n${includedNames
      .map((n) => `• ${n}`)
      .join('\n')}\n\n*Dedicatoria:* "${cardMessage}"\n*Total Estimado:* $${customAnchetaTotal.toLocaleString(
      'es-CO'
    )} COP\n\n¿Tienen disponibilidad de entrega para esta semana en Pasto?`;

    return `https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=${encodeURIComponent(msg)}`;
  })();

  return (
    <section
      id="tienda-boutique"
      className="scroll-mt-20 py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-[#EFE2E4]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
        <div>
          <span className="text-xs tracking-widest text-[#C84673] uppercase font-semibold">
            Boutique & Reservas · Pasto, Nariño
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl text-[#3A2529] mt-2">
            Catálogo, Cerámicas & Anchetas
          </h2>
          <p className="text-sm text-[#75565C] max-w-xl mt-2 leading-relaxed">
            Reserva paquetes de decoración, adquiere piezas de cerámica artesanal grabadas a mano o diseña una
            ancheta personalizada para regalar en cualquier ocasión especial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenCeramicModal(CERAMIC_PRODUCTS[2])}
            className="px-4 py-2.5 bg-[#FCE9EC] hover:bg-[#F6CFD6] text-[#3A2529] text-xs font-semibold rounded-xl border border-[#F6CFD6] transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#C84673]" />
            <span>Personalizar Cerámica</span>
          </button>

          <button
            onClick={() => setIsBuilderOpen(true)}
            className="px-4 py-2.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Gift className="w-4 h-4 text-[#F9E396]" />
            <span>Armar Ancheta desde Cero</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Todo el Catálogo' },
            { key: 'decoracion', label: 'Paquetes & Montajes' },
            { key: 'globos', label: 'Arcos Orgánicos' },
            { key: 'ceramicas', label: 'Cerámicas' },
            { key: 'anchetas', label: 'Anchetas & Regalos' },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === c.key
                  ? 'bg-[#C84673] text-white shadow-xs'
                  : 'bg-[#FCE9EC] text-[#3A2529] hover:bg-[#F6CFD6]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#C84673]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el catálogo..."
              className="text-xs pl-9 pr-3 py-2 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] w-48 sm:w-56 focus:outline-none focus:border-[#C84673]"
            />
          </div>

          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value as any)}
            className="text-xs py-2 px-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529] focus:outline-none"
          >
            <option value="default">Ordenar por</option>
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="group rounded-3xl overflow-hidden bg-[#FFFDFB] border border-[#EFE2E4] shadow-sm hover:shadow-md hover:border-[#F6CFD6] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-64 overflow-hidden bg-[#FCE9EC]">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-6">
                <div className="text-[11px] uppercase tracking-wider text-[#C84673] font-semibold mb-1.5 flex items-center gap-1.5 flex-wrap">
                  <span>{prod.category}</span>
                  <span aria-hidden="true" className="text-[#75565C]">·</span>
                  <span className="normal-case font-medium text-[#75565C]">{prod.leadTime}</span>
                </div>
                <h4 className="font-serif-display text-2xl text-[#3A2529] group-hover:text-[#C84673] transition-colors mb-2">
                  {prod.name}
                </h4>
                <p className="text-xs text-[#75565C] line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <div className="pt-4 border-t border-[#EFE2E4] flex items-center justify-between gap-2">
                <div>
                  {prod.isStartingPrice && (
                    <span className="text-[10px] text-[#75565C] block">Desde:</span>
                  )}
                  <span className="font-serif-display text-xl font-bold text-[#3A2529] tabular-nums">
                    ${prod.price.toLocaleString('es-CO')} COP
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {prod.category === 'ceramicas' && (
                    <button
                      onClick={() => handleOpenCeramicModal(CERAMIC_PRODUCTS[0])}
                      className="px-3 py-2 text-xs font-medium rounded-xl bg-[#FCE9EC] hover:bg-[#F6CFD6] text-[#3A2529] transition-colors"
                    >
                      Grabar
                    </button>
                  )}
                  <button
                    onClick={() => handleAdd(prod)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      addedId === prod.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#C84673] hover:bg-[#B03862] text-white shadow-xs'
                    }`}
                  >
                    {addedId === prod.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Agregado
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {prod.isStartingPrice ? 'Reservar' : 'Agregar'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: PERSONALIZAR CERÁMICA */}
      {selectedCeramic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFB] rounded-3xl max-w-xl w-full border border-[#F6CFD6] shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCeramic(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FCE9EC] text-[#3A2529] flex items-center justify-center hover:bg-[#F6CFD6] text-xs font-semibold"
              aria-label="Cerrar personalizador de cerámica"
            >
              ✕
            </button>

            <span className="text-[11px] uppercase tracking-wider text-[#C84673] font-semibold">
              Taller de Torno & Horno Propio
            </span>
            <h3 className="font-serif-display text-3xl text-[#3A2529] mt-1 mb-4">
              Personaliza tu Cerámica
            </h3>

            {/* Piece Selector */}
            <div className="mb-4">
              <label className="text-xs font-medium text-[#3A2529] block mb-1.5">
                Elige la pieza artesanal:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CERAMIC_PRODUCTS.map((cp) => (
                  <button
                    key={cp.id}
                    onClick={() => handleOpenCeramicModal(cp)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedCeramic.id === cp.id
                        ? 'border-[#C84673] bg-[#FCE9EC]/60'
                        : 'border-[#EFE2E4] hover:bg-[#FDF5F7]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#3A2529] line-clamp-1">{cp.name}</div>
                    <div className="text-[11px] font-bold text-[#C84673]">
                      ${cp.price.toLocaleString('es-CO')} COP
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#FFFDFB] to-[#FCE9EC] border border-[#EFE2E4] flex flex-col items-center justify-center text-center mb-5">
              <div
                className="w-24 h-24 rounded-full border-4 shadow-lg flex items-center justify-center transition-all"
                style={{
                  backgroundColor: selectedColor,
                  borderColor: selectedFinish === 'oro-rosa' ? '#E6CA85' : '#C84673',
                }}
              >
                <div className="text-[11px] font-serif-display font-bold text-[#3A2529] max-w-[80px] break-words leading-tight px-1">
                  {customText || 'Tu Texto'}
                </div>
              </div>
              <span className="text-[11px] text-[#75565C] mt-3">
                Previsualización aproximada del grabado en acabado {selectedFinish.replace('-', ' ')}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#3A2529] block mb-1">
                  Texto o Dedicatoria para Grabado Caligráfico:
                </label>
                <input
                  type="text"
                  maxLength={35}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ej: Feliz Día Mamá / Aniversario 25"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#3A2529] block mb-1.5">Tipo de Acabado:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCeramic.availableFinishes.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-3 py-1.5 text-xs rounded-xl capitalize transition-all ${
                        selectedFinish === f
                          ? 'bg-[#C84673] text-white shadow-xs'
                          : 'bg-[#FCE9EC] text-[#3A2529] hover:bg-[#F6CFD6]'
                      }`}
                    >
                      {f.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#3A2529] block mb-1.5">Color Base del Esmalte:</label>
                <div className="flex items-center gap-2">
                  {selectedCeramic.availableColors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setSelectedColor(hex)}
                      aria-label={`Color ${hex}`}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        selectedColor === hex ? 'scale-110 border-[#C84673]' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#EFE2E4] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#75565C] block">Total:</span>
                <span className="font-serif-display text-2xl font-bold text-[#C84673] tabular-nums">
                  ${selectedCeramic.price.toLocaleString('es-CO')} COP
                </span>
              </div>

              <button
                onClick={handleAddCustomCeramic}
                disabled={ceramicAddedSuccess}
                className="px-6 py-2.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {ceramicAddedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Agregar al Carrito
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ARMAR ANCHETA DESDE CERO */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFDFB] rounded-3xl max-w-3xl w-full border border-[#F6CFD6] shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsBuilderOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FCE9EC] text-[#3A2529] flex items-center justify-center hover:bg-[#F6CFD6] text-xs font-semibold"
              aria-label="Cerrar configurador de ancheta"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C84673] mb-1">
              <Sparkles className="w-4 h-4" />
              Configurador Interactivo
            </div>
            <h3 className="font-serif-display text-3xl text-[#3A2529] mb-4">
              Crea tu Ancheta Personalizada
            </h3>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#3A2529] uppercase tracking-wider mb-2.5">
                Paso 1: Elige el Empaque
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ANCHETA_CUSTOM_OPTIONS.filter((o) => o.category === 'empaque').map((box) => (
                  <button
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedBox.id === box.id
                        ? 'border-[#C84673] bg-[#FCE9EC]/50 ring-2 ring-[#C84673]/20'
                        : 'border-[#EFE2E4] hover:bg-[#FDF5F7]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#3A2529] leading-tight line-clamp-2 mb-1">
                      {box.name}
                    </div>
                    <div className="text-[11px] font-bold text-[#C84673] font-serif-display">
                      +${box.price.toLocaleString('es-CO')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#3A2529] uppercase tracking-wider mb-2.5">
                Paso 2: Agrega Productos & Detalles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {ANCHETA_CUSTOM_OPTIONS.filter((o) => o.category !== 'empaque').map((item) => {
                  const isChecked = selectedItems.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleAnchetaItem(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#C84673] bg-[#FCE9EC]/40'
                          : 'border-[#EFE2E4] hover:bg-[#FDF5F7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-[#C84673] border-[#C84673] text-white' : 'border-gray-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-xs text-[#3A2529] truncate">{item.name}</span>
                      </div>
                      <span className="text-xs font-serif-display font-semibold text-[#C84673] shrink-0">
                        +${item.price.toLocaleString('es-CO')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-[#FDF5F7] border border-[#EFE2E4] space-y-3">
              <h4 className="text-xs font-bold text-[#C84673] uppercase tracking-wider">
                Paso 3: Tarjeta Caligráfica & Dedicatoria
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#3A2529] block mb-1">
                    Nombre del Destinatario:
                  </label>
                  <input
                    type="text"
                    value={cardRecipient}
                    onChange={(e) => setCardRecipient(e.target.value)}
                    placeholder="Ej: Mamá / Amiga / Gloria"
                    className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#3A2529] block mb-1">
                    Mensaje de la Tarjeta:
                  </label>
                  <input
                    type="text"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="Escribe tu dedicatoria..."
                    className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EFE2E4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#75565C] block">Inversión Total de la Ancheta:</span>
                <span className="font-serif-display text-3xl font-bold text-[#C84673] tabular-nums">
                  ${customAnchetaTotal.toLocaleString('es-CO')} COP
                </span>
              </div>

              <a
                href={customAnchetaWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
