import React, { useRef, useState } from 'react';
import { SimulatorElement } from '../../types';
import { Move } from 'lucide-react';

interface PhotoCanvasEditorProps {
  backgroundImage: string | null;
  elements: SimulatorElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<SimulatorElement>) => void;
  onRemoveElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
}

export const PhotoCanvasEditor: React.FC<PhotoCanvasEditorProps> = ({
  backgroundImage,
  elements,
  selectedId,
  onSelectElement,
  onUpdateElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; elemX: number; elemY: number }>({
    x: 0,
    y: 0,
    elemX: 0,
    elemY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent, elem: SimulatorElement) => {
    e.stopPropagation();
    onSelectElement(elem.id);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, dragStartRef.current.elemX + deltaXPercent));
    const newY = Math.max(5, Math.min(95, dragStartRef.current.elemY + deltaYPercent));

    onUpdateElement(selectedId, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore release errors
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectElement(null)}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl bg-[#FDF5F7] border border-[#EFE2E4] shadow-inner select-none flex items-center justify-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!backgroundImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-[#FFFDFB] to-[#FCE9EC]">
          <div className="w-14 h-14 rounded-full bg-[#F6CFD6]/50 flex items-center justify-center text-[#C84673] mb-3">
            <Move className="w-6 h-6" />
          </div>
          <h4 className="font-serif-display text-xl text-[#3A2529] font-medium">Lienzo de Decoración</h4>
          <p className="text-xs text-[#75565C] max-w-sm mt-1">
            Sube una foto de tu espacio o activa tu cámara en el Paso 1 para ubicar tus piezas decorativas.
          </p>
        </div>
      )}

      {elements.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <div
            key={item.id}
            onPointerDown={(e) => handlePointerDown(e, item)}
            onClick={(e) => e.stopPropagation()}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
              zIndex: isSelected ? 40 : 10,
            }}
            className={`absolute touch-none cursor-move transition-shadow rounded-xl ${
              isSelected
                ? 'ring-2 ring-[#C84673] ring-offset-2 ring-offset-[#F9E396]/50 shadow-2xl'
                : 'hover:opacity-95'
            }`}
          >
            <RenderCanvasItem item={item} />
          </div>
        );
      })}

      <div className="absolute top-3 left-3 bg-[#FFFDFB]/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-[11px] text-[#75565C] border border-[#F6CFD6] pointer-events-none">
        Arrastra cualquier elemento sobre la foto · Edítalo en la barra inferior
      </div>
    </div>
  );
};

// Exported reusable SVG renderer for both 2D Canvas and Catalog Visual Thumbnails
export const RenderCanvasItem: React.FC<{
  item: Pick<SimulatorElement, 'type' | 'name' | 'color' | 'accentColor'>;
  compact?: boolean;
}> = ({ item, compact = false }) => {
  const color = item.color || '#F6CFD6';
  const accent = item.accentColor || '#F9E396';
  const sizeClass = compact ? 'w-full h-full max-w-[68px] max-h-[68px]' : '';

  switch (item.type) {
    case 'panel-arch':
      return (
        <svg width="150" height="260" viewBox="0 0 150 260" fill="none" className={sizeClass}>
          <path
            d="M5 255 L5 75 A70 70 0 0 1 145 75 L145 255 Z"
            fill={color}
            stroke="#3A2529"
            strokeWidth="2"
            strokeOpacity="0.12"
          />
          {[22, 37, 52, 67, 82, 97, 112, 127].map((x, i) => (
            <line key={i} x1={x} y1="75" x2={x} y2="250" stroke="#3A2529" strokeOpacity="0.08" strokeWidth="3" />
          ))}
          <rect x="35" y="60" width="80" height="24" rx="5" fill="#FFFDFB" stroke={accent} strokeWidth="2.5" />
          <text x="75" y="76" textAnchor="middle" fill="#C84673" fontSize="9" fontWeight="bold">
            FELIZ DÍA
          </text>
        </svg>
      );

    case 'arch-metal-circle':
      return (
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" className={sizeClass}>
          <circle cx="110" cy="110" r="95" stroke={color} strokeWidth="7" />
          <circle cx="110" cy="110" r="87" stroke={accent} strokeWidth="2.5" strokeDasharray="6 4" />
          <rect x="70" y="200" width="30" height="8" rx="2" fill={color} />
          <rect x="120" y="200" width="30" height="8" rx="2" fill={color} />
        </svg>
      );

    case 'arch-metal-rect':
      return (
        <svg width="220" height="230" viewBox="0 0 220 230" fill="none" className={sizeClass}>
          <rect x="20" y="16" width="180" height="196" rx="4" stroke={color} strokeWidth="8" fill="none" />
          <path d="M24 20 L80 20 Q72 115 92 208 L24 208 Z" fill={accent} fillOpacity="0.55" />
          <rect x="8" y="210" width="34" height="8" rx="2" fill={color} />
          <rect x="178" y="210" width="34" height="8" rx="2" fill={color} />
        </svg>
      );

    case 'curtain-lights':
      return (
        <svg width="220" height="230" viewBox="0 0 220 230" fill="none" className={sizeClass}>
          <rect x="12" y="12" width="196" height="206" rx="8" fill={color} fillOpacity="0.88" stroke="#EFE2E4" strokeWidth="2" />
          {[32, 62, 92, 122, 152, 182].map((x, idx) => (
            <g key={idx}>
              <line x1={x} y1="16" x2={x} y2="210" stroke={accent} strokeOpacity="0.45" strokeWidth="1.5" />
              {[36, 76, 116, 156, 196].map((y, j) => (
                <circle key={j} cx={x} cy={y} r="4.5" fill={accent} />
              ))}
            </g>
          ))}
        </svg>
      );

    case 'cylinder-tall':
    case 'cylinder-medium':
    case 'cylinder-low': {
      const height = item.type === 'cylinder-tall' ? 140 : item.type === 'cylinder-medium' ? 110 : 85;
      return (
        <svg width="80" height={height} viewBox={`0 0 80 ${height}`} fill="none" className={sizeClass}>
          <rect x="6" y="10" width="68" height={height - 15} rx="6" fill={color} stroke="#3A2529" strokeOpacity="0.1" />
          {[18, 29, 40, 51, 62].map((x, i) => (
            <line key={i} x1={x} y1="12" x2={x} y2={height - 8} stroke="#3A2529" strokeOpacity="0.08" strokeWidth="3" />
          ))}
          <ellipse cx="40" cy="10" rx="34" ry="8" fill="#FFFDFB" stroke={accent} strokeWidth="2.5" />
        </svg>
      );
    }

    case 'table-main':
      return (
        <svg width="200" height="120" viewBox="0 0 200 120" fill="none" className={sizeClass}>
          <rect x="10" y="30" width="180" height="16" rx="4" fill={color} stroke="#3A2529" strokeOpacity="0.12" />
          <line x1="25" y1="46" x2="25" y2="115" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <line x1="175" y1="46" x2="175" y2="115" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <line x1="45" y1="46" x2="45" y2="110" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <line x1="155" y1="46" x2="155" y2="110" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <rect x="64" y="30" width="72" height="46" rx="2" fill="#FCE9EC" stroke={accent} strokeWidth="1.5" />
        </svg>
      );

    case 'table-round':
      return (
        <svg width="130" height="120" viewBox="0 0 130 120" fill="none" className={sizeClass}>
          <ellipse cx="65" cy="30" rx="52" ry="12" fill={color} stroke={accent} strokeWidth="2.5" />
          <line x1="65" y1="42" x2="65" y2="108" stroke={accent} strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="65" cy="110" rx="28" ry="6" fill={accent} />
        </svg>
      );

    case 'chair-throne':
      return (
        <svg width="120" height="150" viewBox="0 0 120 150" fill="none" className={sizeClass}>
          <path d="M24 85 L24 42 A36 32 0 0 1 96 42 L96 85 Z" fill={color} stroke={accent} strokeWidth="3" />
          <rect x="20" y="78" width="80" height="20" rx="8" fill={color} stroke={accent} strokeWidth="2.5" />
          <line x1="30" y1="98" x2="26" y2="142" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <line x1="90" y1="98" x2="94" y2="142" stroke={accent} strokeWidth="5" strokeLinecap="round" />
        </svg>
      );

    case 'balloon-garland-curved':
    case 'balloon-asymmetric':
      return (
        <svg width="240" height="250" viewBox="0 0 240 250" fill="none" className={sizeClass}>
          <circle cx="40" cy="195" r="30" fill={color} />
          <circle cx="52" cy="136" r="36" fill={accent} />
          <circle cx="82" cy="86" r="33" fill={color} />
          <circle cx="132" cy="48" r="40" fill="#FFFDFB" stroke={color} strokeWidth="2" />
          <circle cx="185" cy="55" r="31" fill={accent} />
          <circle cx="210" cy="98" r="24" fill={color} />
          <circle cx="65" cy="165" r="16" fill="#F9E396" />
          <circle cx="110" cy="68" r="18" fill={accent} />
          <circle cx="160" cy="54" r="15" fill="#E6CA85" />
          <circle cx="46" cy="102" r="10" fill="#FFFDFB" />
          <circle cx="95" cy="112" r="11" fill={color} />
        </svg>
      );

    case 'balloon-double-cascade':
      return (
        <svg width="260" height="250" viewBox="0 0 260 250" fill="none" className={sizeClass}>
          <circle cx="32" cy="200" r="26" fill={color} />
          <circle cx="38" cy="145" r="32" fill={accent} />
          <circle cx="62" cy="92" r="34" fill={color} />
          <circle cx="105" cy="50" r="38" fill={accent} />
          <circle cx="155" cy="48" r="36" fill={color} />
          <circle cx="200" cy="85" r="34" fill={accent} />
          <circle cx="222" cy="140" r="30" fill={color} />
          <circle cx="226" cy="195" r="25" fill={accent} />
          <circle cx="130" cy="56" r="18" fill="#FFFDFB" />
          <circle cx="78" cy="70" r="16" fill="#F9E396" />
          <circle cx="182" cy="66" r="16" fill="#F9E396" />
        </svg>
      );

    case 'balloon-column':
      return (
        <svg width="90" height="240" viewBox="0 0 90 240" fill="none" className={sizeClass}>
          {[200, 160, 120, 80, 40].map((y, i) => (
            <g key={i}>
              <circle cx="30" cy={y} r="22" fill={i % 2 === 0 ? color : accent} />
              <circle cx="60" cy={y - 5} r="22" fill={i % 2 === 0 ? accent : color} />
              <circle cx="45" cy={y + 10} r="14" fill="#FFFDFB" />
            </g>
          ))}
        </svg>
      );

    case 'balloon-giant':
      return (
        <svg width="120" height="240" viewBox="0 0 120 240" fill="none" className={sizeClass}>
          <circle cx="60" cy="65" r="54" fill={color} stroke={accent} strokeWidth="2" />
          <polygon points="56,119 64,119 60,126" fill={color} />
          <text x="60" y="68" textAnchor="middle" fill="#3A2529" fontSize="11" fontWeight="bold" fontFamily="serif">
            Feliz Día
          </text>
          <path d="M60 126 Q55 160 65 190 T60 230" stroke={accent} strokeWidth="2.5" fill="none" />
          <circle cx="58" cy="152" r="5.5" fill={accent} />
          <circle cx="62" cy="182" r="5.5" fill={color} />
        </svg>
      );

    case 'neon-sign':
      if (compact) {
        return (
          <svg width="70" height="44" viewBox="0 0 70 44" fill="none">
            <rect x="4" y="6" width="62" height="32" rx="8" fill="#FFFDFB" stroke={color} strokeWidth="2.5" />
            <text x="35" y="25" textAnchor="middle" fill={accent} fontSize="10" fontWeight="bold">
              Neón
            </text>
          </svg>
        );
      }
      return (
        <div
          className="px-5 py-2.5 rounded-xl border-2 bg-[#FFFDFB]/95 shadow-lg text-center"
          style={{ borderColor: color }}
        >
          <span className="font-serif-display text-lg tracking-wider font-semibold" style={{ color: accent }}>
            Celebremos Juntos
          </span>
        </div>
      );

    case 'led-numbers':
      if (compact) {
        return (
          <svg width="70" height="54" viewBox="0 0 70 54" fill="none">
            <rect x="8" y="6" width="22" height="42" rx="4" fill={color} stroke={accent} strokeWidth="2" />
            <rect x="38" y="6" width="22" height="42" rx="4" fill={color} stroke={accent} strokeWidth="2" />
            <text x="19" y="34" textAnchor="middle" fill="#C84673" fontSize="16" fontWeight="bold">5</text>
            <text x="49" y="34" textAnchor="middle" fill="#C84673" fontSize="16" fontWeight="bold">0</text>
          </svg>
        );
      }
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-14 h-24 rounded-lg border-2 shadow-md flex items-center justify-center font-bold text-2xl text-[#C84673]"
            style={{ backgroundColor: color, borderColor: accent }}
          >
            5
          </div>
          <div
            className="w-14 h-24 rounded-lg border-2 shadow-md flex items-center justify-center font-bold text-2xl text-[#C84673]"
            style={{ backgroundColor: color, borderColor: accent }}
          >
            0
          </div>
        </div>
      );

    case 'floral-arrangement':
      return (
        <svg width="100" height="130" viewBox="0 0 100 130" fill="none" className={sizeClass}>
          <path d="M30 75 L70 75 L62 120 L38 120 Z" fill={accent} />
          <path d="M50 70 Q30 30 15 15 Q40 40 50 70 Z" fill="#8FA08B" />
          <path d="M50 70 Q70 30 85 15 Q60 40 50 70 Z" fill="#8FA08B" />
          <circle cx="40" cy="68" r="12" fill={color} />
          <circle cx="60" cy="65" r="11" fill="#F9E396" />
          <circle cx="50" cy="76" r="10" fill={accent} />
          <circle cx="50" cy="54" r="10" fill={color} />
        </svg>
      );

    case 'cake-stand':
      return (
        <svg width="90" height="110" viewBox="0 0 90 110" fill="none" className={sizeClass}>
          <path d="M38 75 L52 75 L55 105 L35 105 Z" fill={accent} />
          <ellipse cx="45" cy="75" rx="36" ry="6" fill={accent} />
          <rect x="20" y="45" width="50" height="26" rx="3" fill="#FFFDFB" stroke="#EFE2E4" />
          <rect x="28" y="22" width="34" height="23" rx="3" fill={color} stroke="#EFE2E4" />
          <circle cx="45" cy="18" r="6" fill="#C84673" />
        </svg>
      );

    default:
      return (
        <div className="w-16 h-20 rounded bg-[#FCE9EC] border border-[#C84673] flex items-center justify-center text-[10px] text-[#3A2529]">
          {item.name}
        </div>
      );
  }
};
