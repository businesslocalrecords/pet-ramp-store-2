import React from 'react';
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
 * $19.99 against a $35.00 compare-at. Rendered as an add-on row in the same
 * register as the traction-mat bump, so multiple add-ons form one visual group.
 */
export const TetherUpsell: React.FC<TetherUpsellProps> = ({
  available,
  enabled,
  onToggle,
  price,
}) => {
  return (
    <div
      className={`mt-3 flex items-start gap-3 rounded-md border border-gray-300 bg-gray-50 p-4 ${
        available ? '' : 'opacity-60'
      }`}
    >
      <input
        type="checkbox"
        checked={enabled}
        disabled={!available}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-sm border-gray-400 text-blue-700 focus:ring-blue-700"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Add for ${formatMoney(price)}
          </span>
          <span className="text-[0.8125rem] font-bold text-gray-900">
            Crash-Tested Car Safety Tether
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          A ramp protects the joints on the way in &mdash; a tested tether keeps them safe the whole
          drive. Attaches to any harness. <span className="font-bold text-gray-900">Save $15</span> on
          this order.
        </p>

        {!available && (
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            Unavailable until the <code>crash-tested-adjustable-car-safety-tether</code> product exists.
          </p>
        )}
      </div>
    </div>
  );
};
