import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { usePurchase } from '../lib/purchase-context';
import { formatMoney } from '../lib/offers';

/**
 * Mobile-only sticky buy bar. Slides up once the shopper scrolls past the
 * hero so the CTA is always one tap away. Hidden on md and up, where the
 * right-hand purchase column stays sticky instead.
 *
 * Driven by PurchaseProvider, so it shows exactly the same total and performs
 * exactly the same checkout action as the desktop buy button.
 */
export const StickyMobileBuyBar: React.FC = () => {
  const { tier, total, buying, buy } = usePurchase();
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

  return (
    <div className="animate-slide-up fixed inset-x-0 bottom-0 z-40 border-t border-gray-900/10 bg-white/75 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold leading-none text-stone-900">${formatMoney(total)}</span>
            <span className="text-xs text-stone-400 line-through">${formatMoney(tier.compareAt)}</span>
          </div>
          <p className="text-[11px] text-emerald-600">Ships free in 24 hours</p>
        </div>

        <button
          type="button"
          onClick={buy}
          disabled={buying}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_0_#047857] transition-all active:translate-y-1 active:shadow-[0_0px_0_0_#047857] disabled:opacity-60"
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