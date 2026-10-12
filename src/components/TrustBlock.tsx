import React from 'react';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface Guarantee {
  icon: React.ElementType;
  title: string;
  detail: string;
}

const GUARANTEES: Guarantee[] = [
  {
    icon: ShieldCheck,
    title: '100-Day Joint-Safe Guarantee',
    detail: 'Try it for 100 days. If your dog still will not use it, full refund.',
  },
  {
    icon: Truck,
    title: 'Ships Within 24 Hours',
    detail: 'Same-day dispatch on orders before 2pm, insured and tracked.',
  },
  {
    icon: RefreshCw,
    title: 'Lifetime Hardware Warranty',
    detail: 'Frame, hinge, and surface covered for as long as you own it.',
  },
];

/**
 * Ironclad trust block — stacked directly under the buy button so the risk
 * objection is answered at the moment of decision.
 */
export const TrustBlock: React.FC = () => {
  return (
    <div className="space-y-2.5">
      {GUARANTEES.map((guarantee, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"
          >
            <guarantee.icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-bold leading-snug text-stone-900">
              {guarantee.title}
            </p>
            <p className="text-xs leading-snug text-stone-500">{guarantee.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
};