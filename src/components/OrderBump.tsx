import React from 'react';
import { Plus, Gift } from 'lucide-react';
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
  /** True once the live cart write has resolved, if you sync on toggle. */
  syncing?: boolean;
}

/**
 * Pre-checkout order bump.
 *
 * Deliberately a *controlled* toggle: it does not write to the cart on click.
 * The buy handler performs one atomic cart write (ramp + mat together), which
 * avoids a race condition where a fast double-click creates duplicate lines.
 * The net effect for the shopper is identical, just deterministic.
 */
export const OrderBump: React.FC<OrderBumpProps> = ({
  matVariantId,
  enabled,
  onToggle,
  price = 15,
  syncing = false,
}) => {
  const unavailable = !matVariantId;

  return (
    <div
      className={`rounded-2xl border-2 bg-red-50 p-4 transition-colors ${
        unavailable ? 'border-red-200 opacity-60' : 'border-red-500'
      }`}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={unavailable}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-red-300 text-red-600 focus:ring-red-500"
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white">
              Add for ${formatMoney(price)}
            </span>
            <span className="text-[0.8125rem] font-bold text-stone-900">
              Yes! Add the Custom Non-Slip Mat
            </span>
          </span>

          <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-stone-600">
            <Gift className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />
            <span>
              One-time offer &mdash; locks the ramp in place on smooth garage floors and
              protects your bumper. <span className="font-bold text-stone-900">Save $34</span> when
              added to this order (normally $49).
            </span>
          </span>

          {unavailable && (
            <span className="mt-1.5 block text-[11px] font-medium text-red-700">
              Mat unavailable &mdash; configure the <code>non-slip-mat</code> product in Shopify.
            </span>
          )}
          {syncing && (
            <span className="mt-1.5 block text-[11px] font-medium text-stone-500">Updating cart…</span>
          )}
        </span>

        {/* Thumbnail slot */}
        <span
          aria-hidden="true"
          className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 ring-1 ring-red-200 sm:flex"
        >
          <Plus className="h-5 w-5 text-red-500" />
        </span>
      </label>
    </div>
  );
};