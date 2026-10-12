import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, Truck } from 'lucide-react';
import { fetchProductStock } from '../lib/shopify';

/**
 * Compliance-safe assurance bar.
 *
 * PMax / Google Merchant Center policy: stock and urgency claims must reflect
 * real inventory. This bar therefore contains NO fabricated countdown timers
 * and NO invented "people viewing" counters. It shows real stock from the
 * Storefront API when that number is both available and low, and otherwise
 * shows only factual service statements.
 */
export const UrgencyBar: React.FC = () => {
  const [stock, setStock] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchProductStock('dog-car-ramp').then((level) => {
      if (!cancelled) setStock(level);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only surface a scarcity claim when real stock is genuinely low
  const showScarcity = stock !== null && stock > 0 && stock < 20;

  return (
    <div className="border-b border-stone-900/10 bg-stone-900 text-stone-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-2.5 text-xs sm:text-[13px]">
        <span className="font-semibold">
          Use code <span className="font-bold text-amber-400">RAMP20</span> for 20% off
        </span>

        <span className="hidden text-stone-700 sm:inline" aria-hidden="true">|</span>

        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          Free insured shipping on every order
        </span>

        <span className="hidden text-stone-700 sm:inline" aria-hidden="true">|</span>

        <span className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          30-day money-back guarantee
        </span>

        {showScarcity && (
          <>
            <span className="hidden text-stone-700 sm:inline" aria-hidden="true">|</span>
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Hurry! Only {stock} left
            </span>
          </>
        )}
      </div>
    </div>
  );
};