import React from 'react';
import { formatMoney } from '../lib/offers';

interface OrderBumpProps {
  /** Live mat variant ID from the Storefront API. */
  matVariantId: string | null;
  /** Whether the bump is currently checked. */
  enabled: boolean;
  /** Called with the new checked state. */
  onToggle: (next: boolean) => void;
  /** Bump price in dollars. */
  price?: number;
}

/**
 * Pre-checkout order bump, rendered as a catalog "add-on item" row rather
 * than a standalone promotional box. It sits inside the same visual register
 * as the tier list so the bump reads as part of the checkout, not a detour.
 *
 * Deliberately a *controlled* toggle: it does not write to the cart on click.
 * The buy handler performs one atomic cart write (ramp + mat together), which
 * avoids a race condition where a fast double-click creates duplicate lines.
 */
export const OrderBump: React.FC<OrderBumpProps> = ({
  matVariantId,
  enabled,
  onToggle,
  price = 15,
}) => {
  const unavailable = !matVariantId;

  return (
    <div
      className={`mt-3 flex items-start gap-3 rounded-md border border-gray-300 bg-gray-50 p-4 ${
        unavailable ? 'opacity-60' : ''
      }`}
    >
      {/* Sharp square checkbox */}
      <input
        type="checkbox"
        checked={enabled}
        disabled={unavailable}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-sm border-gray-400 text-blue-700 focus:ring-blue-700"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="bg-gray-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Add for ${formatMoney(price)}
          </span>
          <span className="text-[0.8125rem] font-bold text-gray-900">
            Heavy-Duty Traction Mat (2-Pack)
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-gray-600">
          Locks the ramp to smooth garage floors and protects your bumper. One-time add-on,
          normally $30 &mdash; <span className="font-bold text-gray-900">save $15</span> on this order.
        </p>

        {unavailable && (
          <p className="mt-1 text-[11px] font-medium text-gray-500">
            Unavailable until the <code>heavy-duty-traction-mat-upgrade-2-pack</code> product exists in Shopify.
          </p>
        )}
      </div>
    </div>
  );
};
