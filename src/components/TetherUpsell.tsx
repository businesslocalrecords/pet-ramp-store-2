import React from 'react';
import { ShieldCheck, Plus, Car } from 'lucide-react';
import { formatMoney } from '../lib/offers';

interface TetherUpsellProps {
  /** Whether the live tether variant loaded from the storefront. */
  available: boolean;
  enabled: boolean;
  onToggle: (next: boolean) => void;
  price: number;
}

/**
 * Post-add-to-cart upsell: crash-tested car safety tether.
 *
 * Target $19.99 against a $35.00 compare-at. Offered to shoppers who are
 * already buying car-mobility gear, where the attachment rate is highest.
 */
export const TetherUpsell: React.FC<TetherUpsellProps> = ({
  available,
  enabled,
  onToggle,
  price,
}) => {
  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-colors ${
        available ? 'border-blue-600 bg-blue-50/60' : 'border-gray-900/10 opacity-60'
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={!available}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white">
              Add for ${formatMoney(price)}
            </span>
            <span className="text-[0.8125rem] font-bold text-stone-900">
              Crash-Tested Car Safety Tether
            </span>
          </span>

          <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-stone-600">
            <Car className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden="true" />
            <span>
              A ramp keeps their joints safe on the way in — a tested tether keeps them
              safe the whole drive. Attaches to any harness. <span className="font-bold text-stone-900">Save $15</span> when
              added to this order.
            </span>
          </span>

          {!available && (
            <span className="mt-1.5 block text-[11px] font-medium text-stone-500">
              Unavailable until the <code>crash-tested-adjustable-car-safety-tether</code> product is created.
            </span>
          )}
        </span>

        <span
          aria-hidden="true"
          className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 ring-1 ring-blue-200 sm:flex"
        >
          {enabled ? (
            <ShieldCheck className="h-6 w-6 text-blue-700" />
          ) : (
            <Plus className="h-5 w-5 text-blue-600" />
          )}
        </span>
      </label>
    </div>
  );
};