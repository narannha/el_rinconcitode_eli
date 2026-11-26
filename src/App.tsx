import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/layout/HeroSection';
import { SimulatorMain } from './components/simulator/SimulatorMain';
import { ShopCatalog } from './components/shop/ShopCatalog';
import { TestimonialsSection } from './components/testimonials/TestimonialsSection';
import { AboutSection } from './components/about/AboutSection';
import { ContactSection } from './components/contact/ContactSection';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { CartItem, DecorPackagePreset } from './types';
import { SHOP_PRODUCTS } from './data/mockData';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<{
    pkg: DecorPackagePreset;
    timestamp: number;
  } | null>(null);

  // Allow direct navigation via #admin / #administracion / #administración URL hash
  useEffect(() => {
    const isAdminHash = (rawHash: string) => {
      const normalized = decodeURIComponent(rawHash).toLowerCase();
      return normalized === '#admin' || normalized === '#administracion' || normalized === '#administración';
    };
    const checkHash = () => {
      if (isAdminHash(window.location.hash)) {
        setIsAdminOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === item.product.id &&
          i.customEngraving === item.customEngraving &&
          i.selectedColor === item.selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity } : item)));
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToSimulator = () => {
    const el = document.getElementById('disena-tu-evento');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPackageForSimulator = (pkg: DecorPackagePreset) => {
    setSelectedPackage({ pkg, timestamp: Date.now() });
    scrollToSimulator();
  };

  const scrollToPackages = () => {
    const el = document.getElementById('nuestros-paquetes');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB] text-[#3A2529]">
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateToSimulator={scrollToSimulator}
      />

      <main className="flex-1">
        <HeroSection
          onNavigateToSimulator={scrollToSimulator}
          onExplorePackages={scrollToPackages}
          onSelectPackage={handleSelectPackageForSimulator}
        />

        <SimulatorMain
          isAdminUnlocked={Boolean(adminToken)}
          selectedPackageRequest={selectedPackage}
        />

        <ShopCatalog onAddToCart={handleAddToCart} />

        <TestimonialsSection onNavigateToSimulator={scrollToSimulator} />

        <AboutSection />

        <ContactSection />
      </main>

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          const normalized = decodeURIComponent(window.location.hash).toLowerCase();
          if (normalized === '#admin' || normalized === '#administracion' || normalized === '#administración') {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
        adminToken={adminToken}
        onAdminLoginSuccess={(token) => setAdminToken(token)}
        onAdminLogout={() => setAdminToken(null)}
        onOpenSimulatorAsAdmin={scrollToSimulator}
        shopProducts={SHOP_PRODUCTS}
      />
    </div>
  );
}
