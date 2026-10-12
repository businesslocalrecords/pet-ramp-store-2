import React from 'react';
import { Star, Timer, Package, Lock } from 'lucide-react';
import { usePurchase } from '../lib/purchase-context';
import { money, formatMoney } from '../lib/offers';
import { TieredOfferSelector } from './TieredOfferSelector';
import { OrderBump } from './OrderBump';
import { TetherUpsell } from './TetherUpsell';
import { TactileBuyButton } from './TactileBuyButton';
import { TrustBlock } from './TrustBlock';

/**
 * Sticky right-hand purchase column (presentational).
 *
 * All state and side-effects live in PurchaseProvider, so this component and
 * the mobile buy bar stay perfectly in sync.
 */
export const BuyBox: React.FC = () => {
  const {
    tier,
    selectedId,
    selectTier,
    bumpEnabled,
    setBumpEnabled,
    bumpPrice,
    showBump,
    tetherUpsell,
    setTetherUpsell,
    tetherPrice,
    showTetherUpsell,
    total,
    loading,
    ready,
    rampVariants,
    matVariant,
    tetherVariant,
    stock,
    buying,
    error,
    buy,
  } = usePurchase();

  return (
    <div className="space-y-6">
      {/* Compact product header */}
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700">
          <Package className="h-3.5 w-3.5" aria-hidden="true" /> Best seller
        </span>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-stone-900">
          PawGrip Pro Telescoping Dog Ramp
        </h2>

        <div className="mt-2 flex items-center gap-2">
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="text-sm font-bold text-stone-900">4.9</span>
          <span className="text-sm text-stone-500">2,847 reviews</span>
        </div>
      </div>

      {/* Live stock — real inventory only, per PMax / GMC policy */}
      {stock !== null && stock > 0 && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm">
          <Timer className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          {stock < 20 ? (
            <span className="font-bold text-amber-800">Hurry! Only {stock} left in stock.</span>
          ) : (
            <span className="font-medium text-emerald-700">In stock &mdash; ships in 24 hours</span>
          )}
        </p>
      )}

      {!ready ? (
        <div className="flex items-center gap-2 py-6 text-sm text-stone-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" aria-hidden="true" />
          Loading live pricing&hellip;
        </div>
      ) : (
        <>
          <TieredOfferSelector
            selectedId={selectedId}
            onSelect={selectTier}
            disabled={rampVariants.length === 0}
          />

          {/* Pre-checkout order bump — only when the mat is not already bundled */}
          {showBump && (
            <OrderBump
              matVariantId={matVariant?.id ?? null}
              enabled={bumpEnabled}
              onToggle={setBumpEnabled}
              price={bumpPrice}
            />
          )}

          {/* Post-add-to-cart tether upsell — only when not already bundled */}
          {showTetherUpsell && (
            <TetherUpsell
              available={Boolean(tetherVariant)}
              enabled={tetherUpsell}
              onToggle={setTetherUpsell}
              price={tetherPrice}
            />
          )}

          {/* Summary */}
          <div className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
            <span className="text-sm text-stone-600">
              Total today
              {bumpEnabled && matVariant && (
                <span className="ml-1 text-xs text-stone-400">(incl. mat)</span>
              )}
            </span>
            <span className="text-xl font-extrabold text-stone-900">${formatMoney(total)}</span>
          </div>

          <TactileBuyButton
            label="Get My Ramp"
            sublabel={`Save ${Math.round((1 - tier.price / tier.compareAt) * 100)}% today · Free insured shipping · 30-day returns`}
            price={money(total)}
            loading={buying || loading}
            disabled={rampVariants.length === 0}
            onClick={buy}
          />

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <TrustBlock />

          <p className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <Lock className="h-3 w-3" aria-hidden="true" /> Secure 256-bit SSL checkout by Shopify
          </p>
        </>
      )}
    </div>
  );
};