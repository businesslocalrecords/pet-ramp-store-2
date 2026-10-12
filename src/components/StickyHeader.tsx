import React, { useState, useEffect } from 'react';
import { PawPrint, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../lib/cart-context';

/**
 * Sticky glass header. Appears on scroll; uses the frosted-glass treatment
 * shared with the mobile buy bar.
 */
export const StickyHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { totalQuantity } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b border-gray-900/10 bg-white/75 backdrop-blur-xl transition-transform duration-300 ${
        scrolled ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900">
            <PawPrint className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <span className="hidden font-extrabold tracking-tight text-stone-900 sm:inline">
            PawGrip Pro
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-stone-400 line-through md:inline">$199</span>
          <span className="hidden font-bold text-stone-900 md:inline">$149</span>

          {totalQuantity > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-stone-700">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {totalQuantity}
            </span>
          )}

          <a
            href="#offer"
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800"
          >
            Buy Now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
};