import React from 'react';
import { ShieldCheck, Truck, Lock } from 'lucide-react';

interface Guarantee {
  icon: React.ElementType;
  label: string;
}

const GUARANTEES: Guarantee[] = [
  { icon: Truck, label: 'Ships 24H' },
  { icon: ShieldCheck, label: '100-Day Trial' },
  { icon: Lock, label: 'Secure SSL' },
];

/**
 * Trust block, catalog register.
 *
 * A single horizontal row of three icon+label cells above a divider, instead
 * of stacked paragraphs with descriptions. Institutional, scannable, and it
 * answers the three checkout objections (speed, risk, security) in one glance.
 */
export const TrustBlock: React.FC = () => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {GUARANTEES.map((guarantee, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <guarantee.icon className="mb-1 h-6 w-6 text-gray-700" aria-hidden="true" />
            <span className="text-[10px] font-medium uppercase text-gray-600">
              {guarantee.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-500">
        Try it for 100 days. If your dog still will not use it, full refund.
        Frame, hinge and surface covered for as long as you own it.
      </p>
    </div>
  );
};
