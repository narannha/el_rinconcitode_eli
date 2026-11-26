export type EventCategory = 
  | 'cumpleanos-infantil'
  | 'cumpleanos-adulto'
  | 'baby-shower'
  | 'bautizo'
  | 'primera-comunion'
  | 'revelacion-genero'
  | 'grados'
  | 'bodas-aniversarios'
  | 'eventos-empresariales'
  | 'celebraciones-especiales';

export interface ProjectItem {
  id: string;
  title: string;
  category: EventCategory;
  categoryLabel: string;
  description: string;
  image: string;
  palette: string[];
  elements: string[];
  guestCount?: number;
  location?: string;
}

export interface BalloonTechnique {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  density: 'Ligera' | 'Media' | 'Ultra Densa Orgánica';
  idealFor: string;
  startingPrice: number;
  features: string[];
  palette?: string[];
  simulatorPreset: {
    archType: 'organic' | 'asymmetric' | 'classic' | 'cascade' | 'column';
    defaultColors: string[];
  };
}

export interface CeramicProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: 'vases' | 'stands' | 'mugs' | 'souvenirs' | 'decor';
  customizable: boolean;
  availableFinishes: ('mate' | 'esmaltado' | 'terracota' | 'oro-rosa')[];
  availableColors: string[];
}

export interface AnchetaProduct {
  id: string;
  name: string;
  category: 'cumpleanos' | 'romanticas' | 'amor-amistad' | 'empresariales' | 'navidenas' | 'agradecimiento' | 'especiales';
  description: string;
  image: string;
  price: number;
  includes: string[];
  packaging: string;
}

export interface AnchetaCustomOption {
  id: string;
  name: string;
  category: 'empaque' | 'licor' | 'ceramica' | 'chocolates' | 'velas' | 'flores' | 'adicional';
  price: number;
  image?: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  category: 'decoracion' | 'globos' | 'ceramicas' | 'anchetas';
  price: number;
  isStartingPrice?: boolean;
  description: string;
  image: string;
  rating: number;
  inStock: boolean;
  leadTime: string;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
  selectedColor?: string;
  customEngraving?: string;
  eventDate?: string;
}

export interface SimulatorElement {
  id: string;
  name: string;
  category: 'arcos' | 'mobiliario' | 'estructuras';
  type: string;
  x: number; // percentage in 2D or mapped X in 3D
  y: number;
  z?: number;
  scale: number;
  rotation: number;
  color: string;
  accentColor?: string;
  price: number;
  iconName?: string;
  text?: string;
}

export interface DecorPackagePreset {
  id: string;
  name: string;
  tagline: string;
  price: number;
  badgeColor: string;
  highlights: string[];
  elements: Omit<SimulatorElement, 'id'>[];
}

export interface EventQuoteRequest {
  id: string;
  createdAt: string;
  clientName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  city: string;
  palette: string[];
  selectedElements: { name: string; category: string; price: number }[];
  estimatedTotal: number;
  notes?: string;
  designPreviewUrl?: string;
  discountVoucher?: string;
  status: 'nueva' | 'en_revision' | 'cotizada' | 'aprobada';
}

export interface WhatsappAccessCode {
  id: string;
  code: string;
  clientName: string;
  active: boolean;
  usedCount: number;
  createdAt: string;
}

