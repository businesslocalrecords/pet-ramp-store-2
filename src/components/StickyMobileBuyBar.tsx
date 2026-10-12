import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { usePurchase } from '../lib/purchase-context';
import { formatMoney } from '../lib/offers';
import { POLICY } from '../lib/policy';

/**
 * Mobile-only sticky buy bar. Slides up once the shopper scrolls past the
 * hero so the CTA is always one tap away. Hidden on md and up, where the
 * right-hand purchase column stays sticky instead.
 *
 * Driven by PurchaseProvider, so it shows exactly the same total and performs
 * exactly the same checkout action as the desktop buy button. Styled in the
 * same institutional register: flat orange, solid background, no blur.
 *
 * The stock/speed line is derived from lib/policy.ts and live `stock` — no
 * fabricated "ships 24h" claim independent of the real policy.
 */
export const StickyMobileBuyBar: React.FC = () => {
  const { total, buying, buy, stock } = usePurchase();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Trigger after roughly one viewport so it never covers the hero CTA
      setVisible(window.scrollY > window.innerHeight * 0.9);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const stockLabel =
    stock !== null && stock > 0
      ? stock < 20
        ? `Only ${stock} left \u00b7 ships in ${POLICY.shipsWithinBusinessDays} business day`
        : `In stock \u00b7 ships in ${POLICY.shipsWithinBusinessDays} business day`
      : `Ships within ${POLICY.shipsWithinBusinessDays} business day`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-300 bg-white px-4 py-3 md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold leading-none text-gray-900">${formatMoney(total)}</span>
            <span className="text-xs text-gray-500">free shipping</span>
          </div>
          <p className="text-[11px] font-medium text-[#008C3A]">{stockLabel}</p>
        </div>

        <button
          type="button"
          onClick={buy}
          disabled={buying}
          className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-md bg-[#F37021] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#D95E1A] disabled:opacity-60"
        >
          {buying ? (
            'Processing…'
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Secure Checkout
            </>
          )}
        </button>
      </div>
    </div>
  );
};
