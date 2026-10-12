import React from 'react';
import { GATES, FOUNDER_NOTE } from '../lib/assets';

/**
 * Founder note — GATED, currently a placeholder.
 *
 * Renders nothing until `GATES.founderNote` is enabled in src/lib/assets.ts.
 * The placeholder text below is intentionally obvious so it can never leak
 * into a live page by accident: enabling the gate without replacing the copy
 * would publish text that literally says "PLACEHOLDER".
 *
 * When the real note lands: replace the body, drop the gate, and cross the
 * item off LAUNCH_BLOCKERS.md. Keep it first-person and free of medical
 * claims (no "vet-approved", no cure/treatment language).
 */
export const FounderNote: React.FC = () => {
  if (!GATES.founderNote) return null;

  return (
    <section id="founder-note" className="scroll-mt-24">
      <figure className="rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-8">
        <blockquote className="text-[0.9375rem] leading-relaxed text-stone-700">
          {FOUNDER_NOTE.body}
        </blockquote>
        <figcaption className="mt-4 text-sm font-bold text-stone-900">
          {FOUNDER_NOTE.author}
          <span className="ml-2 font-medium text-stone-500">{FOUNDER_NOTE.role}</span>
        </figcaption>
      </figure>
    </section>
  );
};
