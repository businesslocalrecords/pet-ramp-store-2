import React from 'react';
import { Check } from 'lucide-react';
import { TIERS, money, formatMoney } from '../lib/offers';

interface TieredOfferSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/**
 * Good / Better / Best radio-style bundle selector.
 * Active state uses the blue accent; pill badges overlap the card edge.
 */
export const TieredOfferSelector: React.FC<TieredOfferSelectorProps> = ({
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="mb-2 text-sm font-bold text-stone-900">Choose your package</legend>

      {TIERS.map((tier) => {
        const isActive = selectedId === tier.id;
        const savings = money(tier.compareAt - tier.price);

        return (
          <label
            key={tier.id}
            className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border p-4 pt-5 transition-all duration-200 ${
              isActive
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                : 'border-gray-900/10 bg-white hover:border-gray-900/20 hover:bg-stone-50/60'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {/* Radio dot */}
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                isActive ? 'border-blue-600 bg-blue-600' : 'border-stone-300 bg-white'
              }`}
            >
              {isActive && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />}
            </span>

            <input
              type="radio"
              name="offer-tier"
              value={tier.id}
              checked={isActive}
              onChange={() => onSelect(tier.id)}
              className="sr-only"
            />

            {/* Label + perks */}
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[0.9375rem] font-bold text-stone-900">{tier.label}</span>
                <span className="text-xs text-stone-500">{tier.sublabel}</span>
              </span>
              <span className="mt-1 block text-xs text-stone-600">{tier.perks[0]}</span>
              <span className="mt-0.5 block text-[11px] text-stone-400">
                +{tier.perks.length - 1} more included
              </span>
            </span>

            {/* Price */}
            <span className="shrink-0 text-right">
              <span className="block text-[11px] text-stone-400 line-through">${formatMoney(tier.compareAt)}</span>
              <span className="block text-lg font-extrabold leading-tight text-stone-900">${formatMoney(tier.price)}</span>
              <span className="block text-[11px] font-bold text-emerald-600">Save ${formatMoney(savings)}</span>
            </span>

            {/* Overlapping pill badge */}
            {tier.badge && (
              <span
                className={`absolute -top-2.5 left-6 rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-stone-900 text-white'
                }`}
              >
                {tier.badge}
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
};