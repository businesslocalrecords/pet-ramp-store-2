import React from 'react';

/**
 * Thin advertorial disclosure bar. Required for editorial-style landing pages
 * to stay compliant with ad network and publisher policies.
 */
export const AdvertorialHeader: React.FC = () => {
  return (
    <div className="border-b border-stone-900/10 bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
          Advertisement &mdash; Lifestyles
        </p>
      </div>
    </div>
  );
};