import React from 'react';
import { Star } from 'lucide-react';
import { usePurchase } from '../lib/purchase-context';
import { money, formatMoney } from '../lib/offers';
import { TieredOfferSelector } from './TieredOfferSelector';
import { OrderBump } from './OrderBump';
import { TetherUpsell } from './TetherUpsell';
import { FlatBuyButton } from './FlatBuyButton';
import { TrustBlock } from './TrustBlock';

/**
 * Sticky right-hand purchase column (presentational).
 *
 * All state and side-effects live in PurchaseProvider, so this component and
 * the mobile buy bar stay perfectly in sync.
 *
 * DESIGN: "big-box retailer" register. Sharp 1px borders, rounded-md at most,
 * flat high-contrast action colour, dense tabular layout. The emotional DTC
 * styling stops at this component's edge — the editorial column keeps it.
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

  const savingsPercent = Math.round((1 - tier.price / tier.compareAt) * 100);

  return (
    <div>
      {/* Product identity — compact, catalog-style */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold leading-tight text-gray-900">
          PawGrip Pro Telescoping Dog Ramp
        </h2>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="text-xs font-bold text-gray-900">4.9</span>
          <span className="text-xs text-gray-500">(2,847 reviews)</span>
        </div>
      </div>

      {/* Sharp header — stock status in Chewy-order green */}
      <div className="flex items-end justify-between border-b border-gray-200 py-4">
        <h3 className="text-lg font-bold tracking-tight text-gray-900">Select Package</h3>
        {stock !== null && stock > 0 ? (
          <span className="text-sm font-bold text-[#008C3A]">
            {stock < 20 ? `Only ${stock} left` : 'In Stock'}
          </span>
        ) : (
          <span className="text-sm font-bold text-[#008C3A]">In Stock</span>
        )}
      </div>

      {!ready ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
            aria-hidden="true"
          />
          Loading pricing&hellip;
        </div>
      ) : (
        <div className="pt-4">
          <TieredOfferSelector
            selectedId={selectedId}
            onSelect={selectTier}
            disabled={rampVariants.length === 0}
          />

          {/* Add-ons — both render as integrated rows, not floating boxes */}
          {(showBump || showTetherUpsell) && (
            <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">
              Frequently bought together
            </p>
          )}

          {showBump && (
            <OrderBump
              matVariantId={matVariant?.id ?? null}
              enabled={bumpEnabled}
              onToggle={setBumpEnabled}
              price={bumpPrice}
            />
          )}

          {showTetherUpsell && (
            <TetherUpsell
              available={Boolean(tetherVariant)}
              enabled={tetherUpsell}
              onToggle={setTetherUpsell}
              price={tetherPrice}
            />
          )}

          {/* Total — dense, receipt-like */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-700">
              Total
              {bumpEnabled && matVariant && <span className="ml-1 text-xs text-gray-400">incl. mat</span>}
            </span>
            <span className="text-xl font-bold text-gray-900">${formatMoney(total)}</span>
          </div>

          <FlatBuyButton
            price={money(total)}
            loading={buying || loading}
            disabled={rampVariants.length === 0}
            onClick={buy}
          />

          {error && (
            <p role="alert" className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <p className="mt-3 text-center text-xs text-gray-500">
            Save {savingsPercent}% today &middot; Free insured shipping &middot; 30-day returns
          </p>

          <TrustBlock />
        </div>
      )}
    </div>
  );
};
