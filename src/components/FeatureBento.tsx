import React from 'react';
import { Sparkles, ShieldCheck, HandHelping } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  body: string;
  span: string;
  accent: string;
}

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: 'Vet-Approved Slope',
    body: 'A 24–28° angle that eliminates the 3–4× body-weight impact of jumping. Recommended for dogs with hip dysplasia or arthritis.',
    span: 'md:col-span-2',
    accent: 'bg-blue-50 text-blue-700',
  },
  {
    icon: Sparkles,
    title: '250 lb Rated',
    body: 'Aircraft-grade aluminium frame, static-tested past 500 lbs. No flex, no creak, no wobble.',
    span: 'md:col-span-1',
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    icon: HandHelping,
    title: 'One-Hand Carry',
    body: 'Telescopes open in seconds and folds to 31". Light enough to carry one-handed, small enough to store behind your seat.',
    span: 'md:col-span-3',
    accent: 'bg-emerald-50 text-emerald-700',
  },
];

/**
 * Geometric "bento box" feature grid. Asymmetric 3-box layout with
 * soft rings and a lift-on-hover micro-interaction.
 */
export const FeatureBento: React.FC = () => {
  return (
    <section id="features" className="scroll-mt-24">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {features.map((feature, idx) => (
          <article
            key={idx}
            className={`${feature.span} group rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-900/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md`}
          >
            <span
              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}
              aria-hidden="true"
            >
              <feature.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-lg font-bold text-stone-900">{feature.title}</h3>
            <p className="mt-2 text-[0.9375rem] text-stone-600">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
};