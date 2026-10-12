import React from 'react';
import { Lock } from 'lucide-react';
import { POLICY } from '../lib/policy';

/**
 * Trust badges — guarantees the store actually makes.
 *
 * The "Vet Approved" badge (and its SVG) was deleted in V3: the store has no
 * veterinary endorsement, and implying one is both an ad-policy and an FTC
 * problem. The remaining badges are in-house artwork matching the real policy
 * values in src/lib/policy.ts.
 */
const badges = [
  {
    src: '/assets/badges/30-day-guarantee.svg',
    alt: `${POLICY.returnDays}-day money-back guarantee`,
    title: `${POLICY.returnDays}-Day Guarantee`,
    desc: `Full refund within ${POLICY.returnDays} days of delivery`,
  },
  {
    src: '/assets/badges/free-shipping.svg',
    alt: 'Free insured shipping',
    title: 'Free Shipping',
    desc: 'Insured, on every order',
  },
  {
    src: '/assets/badges/secure-checkout.svg',
    alt: 'Secure Shopify checkout',
    title: 'Secure Checkout',
    desc: '256-bit SSL encryption',
  },
];

export const TrustBadges: React.FC = () => {
  return (
    <section className="py-14 px-4 sm:px-6 bg-stone-900 text-stone-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-9">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Shop With Total Confidence</h2>
          <p className="mt-2 text-stone-400 text-sm">Every order is backed by promises we actually keep</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-stone-800/50 border border-stone-800"
            >
              <img
                src={badge.src}
                alt={badge.alt}
                width={80}
                height={80}
                loading="lazy"
                className="w-20 h-20 mb-4 drop-shadow-lg"
              />
              <h3 className="font-bold text-sm">{badge.title}</h3>
              <p className="mt-1 text-xs text-stone-400 leading-relaxed">{badge.desc}</p>
            </div>
          ))}
        </div>

        {/* Payment methods strip */}
        <div className="mt-10 pt-8 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <span className="flex items-center gap-2 text-xs text-stone-400">
              <Lock className="w-4 h-4" /> Secure payment with
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['VISA', 'Mastercard', 'Amex', 'PayPal', 'Shop Pay', 'Apple Pay', 'G Pay'].map((method) => (
                <span
                  key={method}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs font-bold text-stone-300 tracking-wide"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
