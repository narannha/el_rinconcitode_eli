import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Palette,
  Mail,
  MessageCircle,
  Plus,
  Check,
  Trash2,
  RotateCcw,
  RotateCw,
  Sparkles,
  Box,
  Image as ImageIcon,
  Video,
  VideoOff,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Package,
  Lock,
  KeyRound,
  ShieldCheck,
  Move,
  Gift,
} from 'lucide-react';
import {
  SIMULATOR_CATALOG,
  PRESET_PALETTES,
  DECOR_PACKAGES,
  BRAND_COLORS,
  NATURAL_BIRTHDAY_IMAGE,
  NATURAL_BAPTISM_IMAGE,
  NATURAL_ANNIVERSARY_IMAGE,
  HERO_IMAGE,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_WHATSAPP_CLEAN,
} from '../../data/mockData';
import { SimulatorElement, EventQuoteRequest, DecorPackagePreset } from '../../types';
import { ThreeScene } from './ThreeScene';
import { PhotoCanvasEditor, RenderCanvasItem } from './PhotoCanvasEditor';

interface SimulatorMainProps {
  onQuoteCreated?: (quote: EventQuoteRequest) => void;
  isAdminUnlocked?: boolean;
  initialPreset?: {
    archType: string;
    colors: string[];
    timestamp?: number;
  } | null;
  selectedPackageRequest?: {
    pkg: DecorPackagePreset;
    timestamp: number;
  } | null;
}

const PRESET_SPACES = [
  { id: 'casa-damas', name: 'Sala Familiar (Cumpleaños)', url: NATURAL_BIRTHDAY_IMAGE },
  { id: 'salon-luz', name: 'Salón con Luz Natural', url: NATURAL_BAPTISM_IMAGE },
  { id: 'restaurante', name: 'Restaurante / Recepción', url: NATURAL_ANNIVERSARY_IMAGE },
  { id: 'elegante', name: 'Salón Clásico de Eventos', url: HERO_IMAGE },
];

export const SimulatorMain: React.FC<SimulatorMainProps> = ({
  onQuoteCreated,
  isAdminUnlocked = false,
  initialPreset,
  selectedPackageRequest,
}) => {
  // Pre-simulator Access Code Gate (prevents casual screenshot grabbing without contacting Eli)
  const [unlockedClient, setUnlockedClient] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [gateName, setGateName] = useState('');
  const [gateCode, setGateCode] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);

  const hasSimulatorAccess = isAdminUnlocked || Boolean(unlockedClient);

  const [currentStep, setCurrentStep] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');

  // Space Capture & Live AR
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(PRESET_SPACES[0].url);
  const [isCapturing, setIsCapturing] = useState(false);

  // Initial default scene loaded from Rinconcito Esencial
  const [elements, setElements] = useState<SimulatorElement[]>(() =>
    DECOR_PACKAGES[0].elements.map((el, idx) => ({
      ...el,
      id: `init-${idx + 1}`,
    }))
  );
  const [activePackageId, setActivePackageId] = useState<string | null>(DECOR_PACKAGES[0].id);
  const [selectedId, setSelectedId] = useState<string | null>('init-2');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'catalogo' | 'agregados'>('catalogo');
  const [activeSubTab, setActiveSubTab] = useState<'arcos' | 'mobiliario' | 'estructuras'>('arcos');

  // Step 3 Customizations
  const [selectedPalette, setSelectedPalette] = useState(PRESET_PALETTES[0]);
  const [celebrationType, setCelebrationType] = useState('Cumpleaños de Damas');
  const [spaceDimension, setSpaceDimension] = useState('Mediano (4-6 metros)');
  const [decorStyle] = useState('Rosas Pasteles, Fuerte & Amarillo Suave');

  // 3D & AR Viewport settings
  const [cameraPreset, setCameraPreset] = useState<'frontal' | 'isometric' | 'lateral' | 'top'>('frontal');
  const [isArActive, setIsArActive] = useState(false);
  const [webXrSupported, setWebXrSupported] = useState(false);

  // Step 5 Email & WhatsApp
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCity] = useState('Pasto, Nariño');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [issuedVoucher, setIssuedVoucher] = useState<string | null>(null);
  const [sentPreviewImage, setSentPreviewImage] = useState<string | null>(null);
  const sceneSnapshotRef = useRef<(() => string | null) | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).xr) {
      (navigator as any).xr
        .isSessionSupported?.('immersive-ar')
        .then((supported: boolean) => setWebXrSupported(supported))
        .catch(() => setWebXrSupported(false));
    }
  }, []);

  useEffect(() => {
    if (unlockedClient?.name && !clientName) {
      setClientName(unlockedClient.name);
    }
  }, [unlockedClient, clientName]);

  useEffect(() => {
    if (initialPreset) {
      applyPalette({
        name: 'Paleta Inspirada',
        description: 'Colores seleccionados desde nuestro portafolio',
        colors: initialPreset.colors,
      });
      setCurrentStep(2);
    }
  }, [initialPreset]);

  useEffect(() => {
    if (selectedPackageRequest?.pkg) {
      loadPackagePreset(selectedPackageRequest.pkg);
    }
  }, [selectedPackageRequest]);

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError('');
    setGateLoading(true);
    try {
      const res = await fetch('/api/access-codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: gateName.trim(),
          code: gateCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setGateError(data.error || 'Código incorrecto o vencido. Solicítalo por WhatsApp.');
        return;
      }
      setUnlockedClient({ name: data.clientName, code: data.code });
    } catch {
      setGateError('No se pudo verificar el código en este momento. Intenta de nuevo.');
    } finally {
      setGateLoading(false);
    }
  };

  const loadPackagePreset = (pkg: DecorPackagePreset) => {
    const newElems: SimulatorElement[] = pkg.elements.map((el, idx) => ({
      ...el,
      id: `pkg-${pkg.id}-${Date.now()}-${idx}`,
    }));
    setElements(newElems);
    setActivePackageId(pkg.id);
    if (newElems.length > 0) {
      setSelectedId(newElems[Math.min(1, newElems.length - 1)].id);
    }
    setCurrentStep(2);
  };

  const startCamera = async (enableArMode = false) => {
    setCameraError('');
    try {
      if (enableArMode) {
        setViewMode('3d');
        setIsArActive(true);
      } else {
        setCameraActive(true);
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraActive(false);
      setIsArActive(false);
      setCameraError(
        'No se detectó cámara o el permiso fue bloqueado. Puedes subir una fotografía de tu espacio o usar el Estudio 3D.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsArActive(false);
  };

  const toggleLiveAr = () => {
    if (isArActive) {
      stopCamera();
    } else {
      startCamera(true);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setBackgroundImage(dataUrl);
      stopCamera();
      setViewMode('photo');
      setCurrentStep(2);
    }
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBackgroundImage(event.target.result as string);
          stopCamera();
          setViewMode('photo');
          setCurrentStep(2);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (itemConfig: (typeof SIMULATOR_CATALOG)[0]) => {
    const newItem: SimulatorElement = {
      id: `elem-${Date.now()}`,
      name: itemConfig.name,
      category: itemConfig.category,
      type: itemConfig.type,
      x: 50 + (Math.random() - 0.5) * 18,
      y: 50 + (Math.random() - 0.5) * 14,
      scale: itemConfig.defaultScale,
      rotation: 0,
      color: itemConfig.defaultColor,
      accentColor: itemConfig.accentColor,
      price: itemConfig.price,
    };
    setElements((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setActivePackageId(null);
  };

  const handleUpdateElement = (id: string, updates: Partial<SimulatorElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const handleNudgeElement = (id: string, dx: number, dy: number) => {
    const el = elements.find((item) => item.id === id);
    if (!el) return;
    const nextX = Math.max(5, Math.min(95, el.x + dx));
    const nextY = Math.max(10, Math.min(90, el.y + dy));
    const nextZ = Number((((nextY - 50) / 100) * 1.4).toFixed(3));
    handleUpdateElement(id, { x: nextX, y: nextY, z: nextZ });
  };

  const handleRemoveElement = (id: string) => {
    setElements((prev) => {
      const filtered = prev.filter((el) => el.id !== id);
      if (selectedId === id) {
        setSelectedId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
    setActivePackageId(null);
  };

  const handleReorderElement = (id: string, direction: 'up' | 'down') => {
    const index = elements.findIndex((e) => e.id === id);
    if (index === -1) return;
    const newElements = [...elements];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex >= 0 && targetIndex < newElements.length) {
      const temp = newElements[index];
      newElements[index] = newElements[targetIndex];
      newElements[targetIndex] = temp;
      setElements(newElements);
    }
  };

  const applyPalette = (palette: { name: string; description: string; colors: string[] }) => {
    setSelectedPalette(palette);
    setElements((prev) =>
      prev.map((el, i) => ({
        ...el,
        color: palette.colors[i % palette.colors.length],
        accentColor: palette.colors[(i + 1) % palette.colors.length],
      }))
    );
  };

  const estimatedTotal = elements.reduce((acc, curr) => acc + curr.price, 0);
  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  const handleSendProposalToEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientPhone || !clientName) return;

    setIsSendingEmail(true);
    setQuoteError('');
    const capturedSnapshot = sceneSnapshotRef.current?.() || backgroundImage || null;
    const payload = {
      clientName,
      phone: clientPhone,
      email: clientEmail,
      eventType: celebrationType,
      eventDate: eventDate || 'A coordinar',
      guestCount: 40,
      city: eventCity,
      palette: selectedPalette.colors,
      selectedElements: elements.map((el) => ({
        name: el.name,
        category: el.category,
        price: el.price,
      })),
      estimatedTotal,
      notes: `Estilo: ${decorStyle}. Espacio: ${spaceDimension}${
        unlockedClient ? `. Código acceso: ${unlockedClient.code}` : ''
      }`,
    };

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setQuoteError(data?.error || 'No se pudo enviar la solicitud. Intenta nuevamente.');
        return;
      }
      const voucher = data?.discountVoucher || 'ELI10-VIP';
      setIssuedVoucher(voucher);
      setSentPreviewImage(capturedSnapshot);
      const newQuote: EventQuoteRequest = {
        id: data?.id || `COT-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        ...payload,
        discountVoucher: voucher,
        status: 'nueva',
      };
      if (onQuoteCreated) onQuoteCreated(newQuote);
      setEmailSentSuccess(true);
    } catch {
      setQuoteError('Error de conexión al enviar tu solicitud.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getWhatsappQuoteUrl = () => {
    const itemsList = elements.map((e) => `• ${e.name} ($${e.price.toLocaleString('es-CO')})`).join('%0A');
    const colorsText = selectedPalette.colors.join(', ');
    const voucherLine = issuedVoucher ? `%0A*Bono de Descuento (10% OFF):* ${issuedVoucher}` : '';
    const msg = `Hola ${BUSINESS_NAME}! ✨ Acabo de diseñar mi evento en Pasto, Nariño desde su simulador:%0A%0A*Tipo de Celebración:* ${celebrationType}%0A*Estilo:* ${decorStyle}%0A*Ciudad:* ${eventCity}%0A*Paleta:* ${selectedPalette.name} (${colorsText})${voucherLine}%0A%0A*Mi Correo:* ${clientEmail || 'Por proporcionar'}%0A*Mi Teléfono:* ${clientPhone || 'Por proporcionar'}%0A%0A*Elementos seleccionados:*%0A${itemsList}%0A%0A*Presupuesto Estimado:* $${estimatedTotal.toLocaleString('es-CO')} COP%0A%0A¿Podrían confirmar disponibilidad de fecha y aplicar mi bono? ¡Muchas gracias!`;
    return `https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=${msg}`;
  };

  const watermarkLabel = isAdminUnlocked
    ? `${BUSINESS_NAME} · MODO ADMINISTRADORA`
    : `${BUSINESS_NAME} · ${unlockedClient?.name || 'CLIENTA'} · ${unlockedClient?.code || ''}`;

  return (
    <section id="disena-tu-evento" className="py-20 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs tracking-widest text-[#C84673] uppercase font-semibold">
          Realidad Aumentada & Simulador 3D Interactivo
        </span>
        <h2 className="font-serif-display text-4xl md:text-5xl text-[#3A2529] mt-2 mb-3">
          Diseña Tu Propio Evento
        </h2>
        <p className="text-sm md:text-base text-[#75565C] leading-relaxed">
          Proyecta arcos orgánicos, mobiliario y estructuras en tu espacio real con Realidad Aumentada. Haz clic sobre
          cualquier elemento para moverlo, rotarlo o cambiarle el color.
        </p>

        {/* Steps Navigation Bar */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mt-7 overflow-x-auto pb-2">
          {[
            { num: 1, label: '1. Cámara / Foto' },
            { num: 2, label: '2. Catálogo & Paquetes' },
            { num: 3, label: '3. Paleta General' },
            { num: 4, label: '4. Realidad Aumentada' },
            { num: 5, label: '5. Cotizar por Correo' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => hasSimulatorAccess && setCurrentStep(s.num)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                currentStep === s.num
                  ? 'bg-[#C84673] text-white shadow-sm'
                  : 'bg-[#FCE9EC] text-[#75565C] hover:bg-[#F6CFD6] hover:text-[#3A2529]'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Protected Interactive Stage Wrapper */}
      <div className="relative rounded-[32px]">
        {/* Pre-Simulator Access Code Gate Overlay */}
        {!hasSimulatorAccess && (
          <div className="absolute inset-0 z-30 rounded-[32px] bg-[#3A2529]/55 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#FFFDFB] rounded-3xl max-w-md w-full border-2 border-[#F6CFD6] shadow-2xl p-6 md:p-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FCE9EC] text-[#C84673] flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-widest text-[#C84673] font-bold block">
                  Previsualización Exclusiva para Clientas
                </span>
                <h3 className="font-serif-display text-3xl text-[#3A2529] font-semibold">
                  Desbloquea tu Diseñador en Realidad Aumentada
                </h3>
                <p className="text-xs text-[#75565C] leading-relaxed">
                  Para proteger nuestros diseños personalizados y que recibas asesoría real, ingresa tu nombre y el
                  código de acceso que te enviamos por WhatsApp.
                </p>
              </div>

              <form onSubmit={handleVerifyAccessCode} className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#3A2529] block mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={gateName}
                    onChange={(e) => setGateName(e.target.value)}
                    placeholder="Ej: Luz Marina Córdoba"
                    className="w-full text-xs p-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529] focus:outline-none focus:border-[#C84673]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#3A2529] block mb-1">
                    Código recibido por WhatsApp *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#C84673] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={gateCode}
                      onChange={(e) => setGateCode(e.target.value.toUpperCase())}
                      placeholder="Ingresa tu código"
                      className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529] font-mono uppercase focus:outline-none focus:border-[#C84673]"
                    />
                  </div>
                </div>

                {gateError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {gateError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={gateLoading}
                  className="w-full py-3 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#F9E396]" />
                  <span>{gateLoading ? 'Verificando código...' : 'Desbloquear Previsualización'}</span>
                </button>
              </form>

              <div className="pt-3 border-t border-[#EFE2E4] space-y-2">
                <p className="text-[11px] text-[#75565C]">¿Aún no tienes tu código personalizado?</p>
                <a
                  href={`https://wa.me/${BUSINESS_WHATSAPP_CLEAN}?text=${encodeURIComponent(
                    `Hola ${BUSINESS_NAME}! ✨ Sí, quiero solicitar mi código para la previsualización de mi evento.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Solicitar código por WhatsApp ({BUSINESS_PHONE})</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Main Interactive Stage Grid (blurred while locked) */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-7 items-start transition-all duration-300 ${
            !hasSimulatorAccess ? 'blur-md pointer-events-none select-none opacity-65' : ''
          }`}
        >
          {/* Left / Center Viewport & Editing Bar (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Top Viewport Mode Switcher: AR Camera + 3D + Photo */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FFFDFB] p-3 rounded-2xl border border-[#EFE2E4] shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={toggleLiveAr}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isArActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#FFF5D1] text-[#3A2529] hover:bg-[#F9E396]'
                  }`}
                >
                  {isArActive ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-[#C84673]" />}
                  {isArActive ? 'RA Activa (Apagar)' : 'Realidad Aumentada'}
                </button>

                <button
                  onClick={() => {
                    if (isArActive) stopCamera();
                    setViewMode('3d');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === '3d' && !isArActive
                      ? 'bg-[#C84673] text-white shadow-xs'
                      : 'bg-[#FCE9EC] text-[#75565C] hover:text-[#3A2529]'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  Estudio 3D
                </button>

                <button
                  onClick={() => {
                    if (isArActive) stopCamera();
                    setViewMode('photo');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewMode === 'photo'
                      ? 'bg-[#C84673] text-white shadow-xs'
                      : 'bg-[#FCE9EC] text-[#75565C] hover:text-[#3A2529]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Sobre Foto
                </button>
              </div>

              {viewMode === '3d' && (
                <div className="flex items-center gap-1 text-xs text-[#75565C]">
                  {(['frontal', 'isometric', 'lateral', 'top'] as const).map((angle) => (
                    <button
                      key={angle}
                      onClick={() => setCameraPreset(angle)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        cameraPreset === angle
                          ? 'bg-[#F9E396] text-[#3A2529] font-semibold'
                          : 'hover:bg-[#FCE9EC]'
                      }`}
                    >
                      {angle === 'frontal'
                        ? 'Frontal'
                        : angle === 'isometric'
                        ? '3D'
                        : angle === 'lateral'
                        ? 'Lateral'
                        : 'Arriba'}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setElements([]);
                  setSelectedId(null);
                  setActivePackageId(null);
                }}
                className="text-xs text-[#75565C] hover:text-[#C84673] flex items-center gap-1 ml-auto font-medium"
                title="Limpiar escenario"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            </div>

            {cameraError && (
              <div className="p-3 rounded-2xl bg-[#FFF5D1] border border-[#E6CA85] text-xs text-[#3A2529] flex items-center justify-between gap-3">
                <span>{cameraError}</span>
                <button
                  onClick={() => {
                    setCameraError('');
                    setViewMode('photo');
                    setCurrentStep(1);
                  }}
                  className="px-3 py-1 rounded-lg bg-[#C84673] text-white font-semibold shrink-0"
                >
                  Subir foto
                </button>
              </div>
            )}

            {/* Viewport Render Frame with Anti-Screenshot Watermark Protection */}
            <div
              onContextMenu={(e) => e.preventDefault()}
              className="relative w-full h-[480px] rounded-3xl overflow-hidden border border-[#F6CFD6] shadow-md bg-[#FDF7F8] select-none print:hidden"
            >
              {viewMode === '3d' && (
                <div className="w-full h-full relative">
                  {isArActive && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  <div className="relative z-10 w-full h-full">
                    <ThreeScene
                      elements={elements}
                      selectedId={selectedId}
                      onSelectElement={setSelectedId}
                      onUpdateElementTransform={handleUpdateElement}
                      onRegisterSnapshot={(fn) => {
                        sceneSnapshotRef.current = fn;
                      }}
                      cameraPreset={cameraPreset}
                      isArPassthrough={isArActive}
                    />
                  </div>

                  <div className="absolute top-3 left-3 z-20 bg-[#FFFDFB]/90 px-3 py-1.5 rounded-full text-[11px] text-[#75565C] border border-[#F6CFD6] pointer-events-none flex items-center gap-1.5">
                    <Move className="w-3 h-3 text-[#C84673]" />
                    <span>Haz clic y arrastra cualquier pieza para moverla · Arrastra el fondo para girar</span>
                  </div>
                </div>
              )}

              {viewMode === 'photo' && (
                <div className="w-full h-full relative">
                  <PhotoCanvasEditor
                    backgroundImage={backgroundImage}
                    elements={elements}
                    selectedId={selectedId}
                    onSelectElement={setSelectedId}
                    onUpdateElement={handleUpdateElement}
                    onRemoveElement={handleRemoveElement}
                    onReorderElement={handleReorderElement}
                  />
                </div>
              )}

              {/* Anti-Screenshot / Protected Preview Watermark Overlay */}
              {hasSimulatorAccess && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute inset-0 z-[25] overflow-hidden flex flex-col justify-between p-4"
                >
                  <div className="grid grid-cols-2 gap-12 -rotate-12 opacity-20 my-auto">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className="text-center font-serif-display text-xs md:text-sm font-bold tracking-widest text-[#3A2529] whitespace-nowrap"
                      >
                        {watermarkLabel}
                      </div>
                    ))}
                  </div>
                  <div className="self-end bg-[#3A2529]/75 text-white px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#F9E396]" />
                    <span>Previsualización protegida · {unlockedClient?.code || 'ADMIN'}</span>
                  </div>
                </div>
              )}

              {cameraActive && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-lg rounded-2xl border-2 border-white/40 shadow-2xl"
                  />
                  <div className="flex items-center gap-4 mt-6">
                    <button
                      onClick={capturePhoto}
                      disabled={isCapturing}
                      className="px-6 py-2.5 bg-[#C84673] text-white font-semibold rounded-xl shadow-lg hover:bg-[#B03862] flex items-center gap-2 text-xs"
                    >
                      <Camera className="w-4 h-4" />
                      Capturar Foto de mi Espacio
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PROMINENT EDITING BAR (Move, Size, Rotation, Primary & Accent Color, Quitar) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FFFDFB] to-[#FCE9EC]/60 border-2 border-[#EB7B82]/50 p-4 md:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#EFE2E4] pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C84673]">
                    Piezas en escena:
                  </span>
                  {elements.length === 0 ? (
                    <span className="text-xs text-[#75565C] italic">Agrega una pieza del catálogo</span>
                  ) : (
                    elements.map((el) => (
                      <button
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                          selectedId === el.id
                            ? 'bg-[#C84673] text-white shadow-xs'
                            : 'bg-[#FFFDFB] text-[#3A2529] border border-[#EFE2E4] hover:border-[#C84673]'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: el.color }}
                        />
                        <span className="truncate max-w-[115px]">{el.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {selectedElement ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-bold text-[#3A2529]">
                      Personalizando: <span className="text-[#C84673]">{selectedElement.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Precision Move Buttons */}
                      <div className="flex items-center gap-1 bg-[#FFFDFB] border border-[#EFE2E4] rounded-xl p-1">
                        <span className="text-[10px] font-semibold text-[#75565C] px-1">Mover:</span>
                        <button
                          onClick={() => handleNudgeElement(selectedElement.id, -5, 0)}
                          className="p-1 rounded-lg hover:bg-[#FCE9EC] text-[#3A2529]"
                          title="Mover a la izquierda"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleNudgeElement(selectedElement.id, 0, -5)}
                          className="p-1 rounded-lg hover:bg-[#FCE9EC] text-[#3A2529]"
                          title="Mover atrás / arriba"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleNudgeElement(selectedElement.id, 0, 5)}
                          className="p-1 rounded-lg hover:bg-[#FCE9EC] text-[#3A2529]"
                          title="Mover adelante / abajo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleNudgeElement(selectedElement.id, 5, 0)}
                          className="p-1 rounded-lg hover:bg-[#FCE9EC] text-[#3A2529]"
                          title="Mover a la derecha"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {viewMode === 'photo' && (
                        <>
                          <button
                            onClick={() => handleReorderElement(selectedElement.id, 'up')}
                            className="px-2 py-1 rounded-lg bg-[#FFFDFB] border border-[#EFE2E4] text-[#3A2529] hover:bg-[#FCE9EC] text-[11px] font-medium"
                          >
                            Frente
                          </button>
                          <button
                            onClick={() => handleReorderElement(selectedElement.id, 'down')}
                            className="px-2 py-1 rounded-lg bg-[#FFFDFB] border border-[#EFE2E4] text-[#3A2529] hover:bg-[#FCE9EC] text-[11px] font-medium"
                          >
                            Atrás
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleRemoveElement(selectedElement.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Quitar pieza
                      </button>
                    </div>
                  </div>

                  {/* Size & Rotation Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#3A2529] flex items-center gap-1.5">
                          <ZoomIn className="w-3.5 h-3.5 text-[#C84673]" />
                          Tamaño
                        </span>
                        <span className="font-bold text-[#C84673]">
                          {Math.round(selectedElement.scale * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateElement(selectedElement.id, {
                              scale: Math.max(0.4, Number((selectedElement.scale - 0.1).toFixed(2))),
                            })
                          }
                          className="w-7 h-7 rounded-lg bg-[#FCE9EC] text-[#3A2529] hover:bg-[#F6CFD6] flex items-center justify-center font-bold"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="range"
                          min="0.4"
                          max="2.0"
                          step="0.05"
                          value={selectedElement.scale}
                          onChange={(e) =>
                            handleUpdateElement(selectedElement.id, { scale: parseFloat(e.target.value) })
                          }
                          className="flex-1 accent-[#C84673] cursor-pointer"
                        />
                        <button
                          onClick={() =>
                            handleUpdateElement(selectedElement.id, {
                              scale: Math.min(2.0, Number((selectedElement.scale + 0.1).toFixed(2))),
                            })
                          }
                          className="w-7 h-7 rounded-lg bg-[#FCE9EC] text-[#3A2529] hover:bg-[#F6CFD6] flex items-center justify-center font-bold"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#3A2529] flex items-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5 text-[#C84673]" />
                          Rotación
                        </span>
                        <span className="font-bold text-[#C84673]">{selectedElement.rotation}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleUpdateElement(selectedElement.id, {
                              rotation: Math.max(-180, selectedElement.rotation - 15),
                            })
                          }
                          className="px-2 h-7 rounded-lg bg-[#FCE9EC] text-[#3A2529] hover:bg-[#F6CFD6] text-[11px] font-semibold"
                        >
                          -15°
                        </button>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          step="5"
                          value={selectedElement.rotation}
                          onChange={(e) =>
                            handleUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) })
                          }
                          className="flex-1 accent-[#C84673] cursor-pointer"
                        />
                        <button
                          onClick={() =>
                            handleUpdateElement(selectedElement.id, {
                              rotation: Math.min(180, selectedElement.rotation + 15),
                            })
                          }
                          className="px-2 h-7 rounded-lg bg-[#FCE9EC] text-[#3A2529] hover:bg-[#F6CFD6] text-[11px] font-semibold"
                        >
                          +15°
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary & Secondary Color Swatches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#3A2529]">Color Principal</span>
                        <span className="text-[11px] font-mono text-[#75565C]">{selectedElement.color}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {BRAND_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => handleUpdateElement(selectedElement.id, { color: c.hex })}
                            title={c.name}
                            className={`w-6 h-6 rounded-full border transition-transform ${
                              selectedElement.color.toLowerCase() === c.hex.toLowerCase()
                                ? 'scale-115 ring-2 ring-[#C84673] ring-offset-1 border-white'
                                : 'border-black/15 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        <label
                          className="w-6 h-6 rounded-full border border-dashed border-[#C84673] flex items-center justify-center cursor-pointer overflow-hidden bg-[#FCE9EC] relative"
                          title="Elegir otro color"
                        >
                          <input
                            type="color"
                            value={selectedElement.color}
                            onChange={(e) => handleUpdateElement(selectedElement.id, { color: e.target.value })}
                            className="w-8 h-8 opacity-0 cursor-pointer absolute"
                          />
                          <Palette className="w-3 h-3 text-[#C84673]" />
                        </label>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#3A2529]">Color Secundario / Detalles</span>
                        <span className="text-[11px] font-mono text-[#75565C]">
                          {selectedElement.accentColor || '#F9E396'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {BRAND_COLORS.slice(0, 7).map((c) => (
                          <button
                            key={`acc-${c.hex}`}
                            onClick={() => handleUpdateElement(selectedElement.id, { accentColor: c.hex })}
                            title={c.name}
                            className={`w-6 h-6 rounded-full border transition-transform ${
                              (selectedElement.accentColor || '#F9E396').toLowerCase() === c.hex.toLowerCase()
                                ? 'scale-115 ring-2 ring-[#C84673] ring-offset-1 border-white'
                                : 'border-black/15 hover:scale-105'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        <label
                          className="w-6 h-6 rounded-full border border-dashed border-[#C84673] flex items-center justify-center cursor-pointer overflow-hidden bg-[#FFF6D8] relative"
                          title="Elegir color secundario"
                        >
                          <input
                            type="color"
                            value={selectedElement.accentColor || '#F9E396'}
                            onChange={(e) =>
                              handleUpdateElement(selectedElement.id, { accentColor: e.target.value })
                            }
                            className="w-8 h-8 opacity-0 cursor-pointer absolute"
                          />
                          <Palette className="w-3 h-3 text-[#C84673]" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 text-xs text-[#75565C]">
                  Haz clic sobre cualquier elemento en el escenario o en la lista de arriba para moverlo, ajustar su{' '}
                  <strong>tamaño, rotación y colores</strong>.
                </div>
              )}
            </div>

            {/* Summary Bar */}
            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#EFE2E4] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FCE9EC] flex items-center justify-center text-[#C84673]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#75565C]">Escenario actual:</div>
                  <div className="text-sm font-semibold text-[#3A2529]">
                    {elements.length} {elements.length === 1 ? 'pieza instalada' : 'piezas instaladas'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-[#75565C]">Presupuesto Estimado:</div>
                  <div className="text-xl font-bold text-[#C84673] font-serif-display">
                    ${estimatedTotal.toLocaleString('es-CO')} COP
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Cotizar Diseño
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar Control Deck (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {currentStep === 1 && (
              <div className="bg-[#FFFDFB] p-6 rounded-3xl border border-[#EFE2E4] shadow-sm">
                <h3 className="font-serif-display text-2xl text-[#3A2529] mb-2">1. Tu Espacio</h3>
                <p className="text-xs text-[#75565C] mb-5">
                  Activa la Realidad Aumentada con tu cámara o sube una foto de tu sala o salón en Pasto.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => startCamera(true)}
                    className="w-full py-3 px-4 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Video className="w-4 h-4 text-[#F9E396]" />
                    Abrir Realidad Aumentada en Vivo
                  </button>

                  <button
                    onClick={() => startCamera(false)}
                    className="w-full py-3 px-4 bg-[#FCE9EC] hover:bg-[#F6CFD6] text-[#3A2529] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-[#F6CFD6] transition-colors"
                  >
                    <Camera className="w-4 h-4 text-[#C84673]" />
                    Tomar Foto con la Cámara
                  </button>

                  <label className="w-full py-3 px-4 bg-[#FFFDFB] hover:bg-[#FCE9EC]/50 text-[#3A2529] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-dashed border-[#C84673]/50 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#C84673]" />
                    Subir Fotografía desde Galería
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="mt-6 pt-5 border-t border-[#EFE2E4]">
                  <span className="text-xs font-medium text-[#75565C] block mb-3">
                    O elige uno de nuestros espacios de muestra:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PRESET_SPACES.map((space) => (
                      <button
                        key={space.id}
                        onClick={() => {
                          setBackgroundImage(space.url);
                          setViewMode('photo');
                          setCurrentStep(2);
                        }}
                        className="group relative h-20 rounded-xl overflow-hidden border border-[#EFE2E4] text-left"
                      >
                        <img
                          src={space.url}
                          alt={space.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-2 flex items-end">
                          <span className="text-[10px] text-white font-medium line-clamp-1 leading-tight">
                            {space.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-[#FFFDFB] p-5 md:p-6 rounded-3xl border border-[#EFE2E4] shadow-sm flex flex-col h-[700px]">
                <div className="mb-4 pb-3 border-b border-[#EFE2E4]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C84673] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Paquetes Predeterminados (1 clic)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DECOR_PACKAGES.map((pkg) => {
                      const isActive = activePackageId === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          onClick={() => loadPackagePreset(pkg)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isActive
                              ? 'bg-[#C84673] text-white border-[#C84673] shadow-xs'
                              : 'bg-[#FDF5F7] text-[#3A2529] border-[#F6CFD6] hover:bg-[#FCE9EC]'
                          }`}
                        >
                          <div className="text-[11px] font-bold leading-tight truncate">
                            {pkg.name.replace('Rinconcito ', '')}
                          </div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              isActive ? 'text-[#F9E396]' : 'text-[#C84673] font-semibold'
                            }`}
                          >
                            ${(pkg.price / 1000).toFixed(0)}k
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-[#FCE9EC]/80 rounded-2xl mb-3">
                  <button
                    onClick={() => setActiveCatalogTab('catalogo')}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                      activeCatalogTab === 'catalogo'
                        ? 'bg-white text-[#3A2529] shadow-xs'
                        : 'text-[#75565C] hover:text-[#3A2529]'
                    }`}
                  >
                    Catálogo Visual
                  </button>
                  <button
                    onClick={() => setActiveCatalogTab('agregados')}
                    className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeCatalogTab === 'agregados'
                        ? 'bg-white text-[#3A2529] shadow-xs'
                        : 'text-[#75565C] hover:text-[#3A2529]'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#C84673]" />
                    <span>Quitar ({elements.length})</span>
                  </button>
                </div>

                {activeCatalogTab === 'catalogo' && (
                  <>
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#FDF5F7] p-1 mb-3 border border-[#EFE2E4]">
                      {[
                        { key: 'arcos', label: 'Arcos Orgánicos' },
                        { key: 'mobiliario', label: 'Mobiliario' },
                        { key: 'estructuras', label: 'Estructuras' },
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setActiveSubTab(cat.key as any)}
                          className={`py-1.5 px-1 text-[11px] font-semibold rounded-lg transition-all truncate ${
                            activeSubTab === cat.key
                              ? 'bg-[#C84673] text-white shadow-xs'
                              : 'text-[#75565C] hover:text-[#3A2529]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2.5 content-start">
                      {SIMULATOR_CATALOG.filter((i) => i.category === activeSubTab).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          className="p-2.5 rounded-2xl border border-[#EFE2E4] hover:border-[#C84673] bg-[#FFFDFB] hover:bg-[#FCE9EC]/30 transition-all cursor-pointer flex flex-col justify-between group shadow-xs"
                        >
                          <div className="h-20 rounded-xl bg-gradient-to-b from-[#FDF5F7] to-[#FFFDFB] border border-[#EFE2E4]/70 flex items-center justify-center p-1.5 mb-2 overflow-hidden">
                            <RenderCanvasItem
                              item={{
                                type: item.type,
                                name: item.name,
                                color: item.defaultColor,
                                accentColor: item.accentColor,
                              }}
                              compact
                            />
                          </div>

                          <div>
                            <div className="text-[11px] font-semibold text-[#3A2529] leading-tight line-clamp-2 group-hover:text-[#C84673]">
                              {item.name}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#EFE2E4]/60">
                              <span className="text-[11px] font-bold text-[#C84673] font-serif-display">
                                ${item.price.toLocaleString('es-CO')}
                              </span>
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-[#FCE9EC] group-hover:bg-[#C84673] text-[#C84673] group-hover:text-white text-[10px] font-bold transition-colors">
                                <Plus className="w-3 h-3" /> Añadir
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeCatalogTab === 'agregados' && (
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-[#EFE2E4]">
                      <span className="text-xs font-semibold text-[#3A2529]">
                        Piezas agregadas a tu diseño:
                      </span>
                      {elements.length > 0 && (
                        <button
                          onClick={() => {
                            setElements([]);
                            setSelectedId(null);
                          }}
                          className="text-[11px] text-[#C84673] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3 h-3" />
                          Quitar todos
                        </button>
                      )}
                    </div>

                    {elements.length === 0 ? (
                      <div className="text-center py-12 text-[#75565C]">
                        <p className="text-xs">No tienes piezas instaladas aún.</p>
                        <button
                          onClick={() => setActiveCatalogTab('catalogo')}
                          className="mt-3 text-xs text-[#C84673] font-semibold underline"
                        >
                          Ir al catálogo visual
                        </button>
                      </div>
                    ) : (
                      elements.map((el) => (
                        <div
                          key={el.id}
                          onClick={() => setSelectedId(el.id)}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            selectedId === el.id
                              ? 'border-[#C84673] bg-[#FCE9EC]/40'
                              : 'border-[#EFE2E4] bg-[#FFFDFB] hover:bg-[#FDF5F7]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: el.color }}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#3A2529] truncate">{el.name}</div>
                              <div className="text-[11px] text-[#75565C] font-serif-display font-medium">
                                ${el.price.toLocaleString('es-CO')} COP
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveElement(el.id);
                            }}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Quitar</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <button
                  onClick={() => setCurrentStep(3)}
                  className="mt-3 w-full py-3 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Paso 3: Aplicar Paleta Completa</span>
                  <Palette className="w-3.5 h-3.5 text-[#F9E396]" />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-[#FFFDFB] p-6 rounded-3xl border border-[#EFE2E4] shadow-sm">
                <h3 className="font-serif-display text-2xl text-[#3A2529] mb-1">3. Paleta General</h3>
                <p className="text-xs text-[#75565C] mb-5">
                  Aplica una armonía completa de rosas pasteles, rosas fuertes y amarillo pastel a todo tu diseño, o edita pieza por pieza abajo del visor.
                </p>

                <div className="space-y-2.5 mb-6">
                  {PRESET_PALETTES.map((pal) => (
                    <div
                      key={pal.name}
                      onClick={() => applyPalette(pal)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedPalette.name === pal.name
                          ? 'border-[#C84673] bg-[#FCE9EC]/50 shadow-xs'
                          : 'border-[#EFE2E4] hover:bg-[#FDF5F7]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#3A2529]">{pal.name}</span>
                        {selectedPalette.name === pal.name && <Check className="w-4 h-4 text-[#C84673]" />}
                      </div>
                      <p className="text-[11px] text-[#75565C] mb-2">{pal.description}</p>
                      <div className="flex items-center gap-2">
                        {pal.colors.map((c, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-[#EFE2E4]">
                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Tipo de Celebración:</label>
                    <select
                      value={celebrationType}
                      onChange={(e) => setCelebrationType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529]"
                    >
                      <option>Cumpleaños de Damas</option>
                      <option>Boda o Aniversario</option>
                      <option>Bautizo o Primera Comunión</option>
                      <option>Baby Shower</option>
                      <option>Grado o Recepción</option>
                      <option>Evento Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#3A2529] block mb-1">Tamaño del Espacio:</label>
                    <select
                      value={spaceDimension}
                      onChange={(e) => setSpaceDimension(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#EFE2E4] bg-[#FDF5F7] text-[#3A2529]"
                    >
                      <option>Íntimo / Sala de Casa (hasta 3 metros)</option>
                      <option>Mediano (4-6 metros)</option>
                      <option>Salón Amplio (7+ metros)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="mt-5 w-full py-3 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Continuar a Enviar Cotización
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-[#FFFDFB] p-6 rounded-3xl border border-[#EFE2E4] shadow-sm">
                <h3 className="font-serif-display text-2xl text-[#3A2529] mb-2">4. Realidad Aumentada</h3>
                <p className="text-xs text-[#75565C] mb-5">
                  Activa tu cámara para ver las piezas sobre tu espacio real y haz clic en cada elemento para moverlo por la habitación.
                </p>

                <div className="p-4 rounded-2xl bg-[#FCE9EC]/60 border border-[#F6CFD6] mb-5">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[#C84673]">
                    <Sparkles className="w-4 h-4" />
                    Estado de Compatibilidad
                  </div>
                  <p className="text-xs text-[#3A2529]">
                    {webXrSupported
                      ? 'Tu dispositivo soporta WebXR para anclaje sobre el piso de tu sala.'
                      : 'Modo Realidad Aumentada con cámara en vivo y movimiento táctil/clic activo.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={toggleLiveAr}
                    className={`w-full py-3 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                      isArActive
                        ? 'bg-rose-700 text-white shadow-md'
                        : 'bg-[#C84673] text-white hover:bg-[#B03862] shadow-md'
                    }`}
                  >
                    {isArActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    {isArActive ? 'Desactivar Modo RA' : 'Activar Cámara RA en Vivo'}
                  </button>

                  <button
                    onClick={() => {
                      if (isArActive) stopCamera();
                      setViewMode('photo');
                      setCurrentStep(2);
                    }}
                    className="w-full py-3 px-4 bg-[#FCE9EC] hover:bg-[#F6CFD6] text-[#3A2529] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-[#C84673]" />
                    Edición sobre Fotografía
                  </button>
                </div>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="mt-6 w-full py-3 bg-[#3A2529] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  Paso 5: Enviar Previsualización al Correo
                </button>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-[#FFFDFB] p-6 rounded-3xl border border-[#EFE2E4] shadow-sm">
                <h3 className="font-serif-display text-2xl text-[#3A2529] mb-1">5. Tu Propuesta & Bono</h3>
                <p className="text-xs text-[#75565C] mb-4">
                  Deja tu correo para enviarte la imagen de tu previsualización junto con un{' '}
                  <strong className="text-[#C84673]">Bono de Descuento del 10%</strong> para tu reserva en Pasto.
                </p>

                <div className="max-h-40 overflow-y-auto pr-1 space-y-2 mb-4 border-b border-[#EFE2E4] pb-3">
                  {elements.length === 0 ? (
                    <p className="text-xs text-[#75565C] italic py-2">No has agregado elementos aún.</p>
                  ) : (
                    elements.map((el) => (
                      <div
                        key={el.id}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FDF5F7] border border-[#EFE2E4]"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                            style={{ backgroundColor: el.color }}
                          />
                          <span className="text-[#3A2529] truncate">{el.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[#C84673] font-semibold font-serif-display tabular-nums">
                            ${el.price.toLocaleString('es-CO')}
                          </span>
                          <button
                            onClick={() => handleRemoveElement(el.id)}
                            className="text-gray-400 hover:text-rose-600 p-0.5"
                            title="Quitar este elemento"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between text-sm font-semibold text-[#3A2529] mb-4">
                  <span>Total Estimado:</span>
                  <span className="text-xl font-bold font-serif-display text-[#C84673] tabular-nums">
                    ${estimatedTotal.toLocaleString('es-CO')} COP
                  </span>
                </div>

                {emailSentSuccess ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FCE9EC] to-[#FDF6D7] border-2 border-dashed border-[#C84673]/50 text-center space-y-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#C84673] text-white flex items-center justify-center mx-auto">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif-display text-lg font-bold text-[#3A2529]">
                        ¡Previsualización + Bono Enviados!
                      </h4>
                      <p className="text-[11px] text-[#75565C] leading-relaxed mt-1">
                        Enviamos la imagen de tu diseño y tu cupón de descuento a <strong>{clientEmail}</strong>.
                      </p>
                    </div>

                    {sentPreviewImage && (
                      <div className="relative rounded-xl overflow-hidden border border-[#F6CFD6] bg-white h-28">
                        <img
                          src={sentPreviewImage}
                          alt="Previsualización enviada"
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-[#C84673] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                          10% OFF INCLUIDO
                        </span>
                      </div>
                    )}

                    <div className="bg-[#FFFDFB] rounded-xl p-3 border border-[#F6CFD6] flex items-center justify-between gap-2">
                      <div className="text-left">
                        <span className="text-[10px] uppercase tracking-wider text-[#C84673] font-bold block">
                          Bono de Descuento 10%
                        </span>
                        <span className="text-sm font-mono font-bold text-[#3A2529]">
                          {issuedVoucher || 'ELI10-VIP'}
                        </span>
                      </div>
                      <Gift className="w-5 h-5 text-[#C84673] shrink-0" />
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSendProposalToEmail}
                    className="space-y-3 mb-4 p-4 rounded-2xl bg-[#FDF5F7] border border-[#EFE2E4]"
                  >
                    <div className="flex items-center justify-between gap-1.5 text-xs font-bold text-[#C84673]">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Recibir Previsualización + Bono 10%</span>
                      </span>
                      <Gift className="w-3.5 h-3.5 text-[#A87E1E]" />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-[#3A2529] block mb-0.5">
                        Tu Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-white text-[#3A2529]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-[#3A2529] block mb-0.5">Tu Nombre *</label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Ej: Luz Marina"
                          className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-white text-[#3A2529]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-[#3A2529] block mb-0.5">Tu WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+57 300 000 0000"
                          className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-white text-[#3A2529]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-[#3A2529] block mb-0.5">
                        Fecha del Evento
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-[#EFE2E4] bg-white text-[#3A2529]"
                      />
                    </div>

                    {quoteError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        {quoteError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSendingEmail || elements.length === 0}
                      className="w-full py-2.5 bg-[#C84673] hover:bg-[#B03862] text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isSendingEmail
                        ? 'Enviando Previsualización y Bono...'
                        : 'Enviar Imagen y Bono al Correo'}
                    </button>
                  </form>
                )}

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      WhatsApp Oficial ({BUSINESS_NAME})
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-800">{BUSINESS_PHONE}</span>
                  </div>
                  <a
                    href={getWhatsappQuoteUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Cotizar por WhatsApp ({BUSINESS_PHONE})
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
