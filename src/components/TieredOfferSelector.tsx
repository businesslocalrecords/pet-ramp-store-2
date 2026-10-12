import React from 'react';
import { TIERS, money, formatMoney } from '../lib/offers';

interface TieredOfferSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/**
 * Good / Better / Best bundle selector, big-box register.
 *
 * Options stack directly with 1px dividers instead of floating as separate
 * cards, so the group reads as one connected decision table. The radio is a
 * native input so it is keyboard accessible and renders as a sharp circle.
 */
export const TieredOfferSelector: React.FC<TieredOfferSelectorProps> = ({
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      {TIERS.map((tier, index) => {
        const isActive = selectedId === tier.id;
        const savings = money(tier.compareAt - tier.price);

        return (
          <label
            key={tier.id}
            className={`flex cursor-pointer items-start p-4 transition-colors ${
              index < TIERS.length - 1 ? 'border-b border-gray-200' : ''
            } ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'} ${
              disabled ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {/* Native radio — sharp, not a custom dot */}
            <input
              type="radio"
              name="package"
              value={tier.id}
              checked={isActive}
              disabled={disabled}
              onChange={() => onSelect(tier.id)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer border-gray-400 text-blue-700 focus:ring-blue-700"
            />

            <div className="ml-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`text-[0.9375rem] font-bold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}
                >
                  {tier.label}
                </span>

                <div className="shrink-0 text-right">
                  <span className="block text-lg font-bold leading-none text-gray-900">
                    ${formatMoney(tier.price)}
                  </span>
                  <span className="block text-sm text-gray-500 line-through">
                    ${formatMoney(tier.compareAt)}
                  </span>
                </div>
              </div>

              {/* Sharp, explicit savings badge — same green as stock status */}
              <div className="mt-1.5">
                <span className="inline-block bg-[#008C3A] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  Save ${formatMoney(savings)}
                </span>
                {tier.badge && (
                  <span className="ml-2 inline-block bg-gray-900 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    {tier.badge}
                  </span>
                )}
              </div>

              {/* Sub-items / what this tier contains */}
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{tier.sublabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{tier.perks[0]}</p>
              {tier.perks.length > 1 && (
                <p className="mt-0.5 text-xs text-gray-400">
                  +{tier.perks.length - 1} more included
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};
