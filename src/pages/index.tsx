import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { AdvertorialHeader } from '../components/AdvertorialHeader';
import { UrgencyBar } from '../components/UrgencyBar';
import { StickyHeader } from '../components/StickyHeader';
import { HeroSection } from '../components/HeroSection';
import { BuyBox } from '../components/BuyBox';
import { FeatureBento } from '../components/FeatureBento';
import { ComparisonTable } from '../components/ComparisonTable';
import { SizeGuide } from '../components/SizeGuide';
import { TrustBadges } from '../components/TrustBadges';
import { ShippingReturns } from '../components/ShippingReturns';
import { Faq } from '../components/Faq';
import { Footer } from '../components/Footer';
import { StickyMobileBuyBar } from '../components/StickyMobileBuyBar';
import { PurchaseProvider } from '../lib/purchase-provider';

/* --------------------------------------------------------------------------
   Core Web Vitals: defer below-the-fold sections.
   Video, UGC and reviews are not needed for first paint, so they are
   code-split and only fetched once they are likely to enter the viewport.
   -------------------------------------------------------------------------- */
const VideoProof = lazy(() => import('../components/VideoProof').then((m) => ({ default: m.VideoProof })));
const UGCGallery = lazy(() => import('../components/UGCGallery').then((m) => ({ default: m.UGCGallery })));
const Testimonials = lazy(() => import('../components/Testimonials').then((m) => ({ default: m.Testimonials })));

/** Placeholder shown while a deferred chunk loads. */
const SectionFallback: React.FC<{ label: string }> = ({ label }) => (
  <div
    className="flex items-center justify-center gap-2 rounded-3xl bg-stone-50 py-16 text-sm text-stone-400"
    role="status"
    aria-live="polite"
  >
    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
    Loading {label}&hellip;
  </div>
);

/**
 * Single-product landing page — 12-column split-screen direct response layout.
 *
 * Left  (7 cols): editorial content, natural scroll.
 * Right (5 cols): sticky purchase column, always in view while reading.
 */
const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-stone-900 antialiased selection:bg-blue-200 selection:text-stone-900">
      {/* Top assurance bar (compliance-safe: real stock only, no fake timers) */}
      <UrgencyBar />

      {/* Advertorial disclosure */}
      <AdvertorialHeader />

      {/* Glass header + mobile buy bar */}
      <StickyHeader />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ---------------- LEFT: editorial column (7) ---------------- */}
          <div className="space-y-16 lg:col-span-7">
            <HeroSection />

            <Suspense fallback={<SectionFallback label="the demo video" />}>
              <VideoProof />
            </Suspense>

            <Suspense fallback={<SectionFallback label="owner videos" />}>
              <UGCGallery />
            </Suspense>

            <FeatureBento />

            <ComparisonTable />

            <SizeGuide />

            <Suspense fallback={<SectionFallback label="reviews" />}>
              <Testimonials />
            </Suspense>

            <TrustBadges />

            <ShippingReturns />

            <Faq />
          </div>

          {/* ---------------- RIGHT: sticky buy column (5) ---------------- */}
          <aside className="lg:col-span-5">
            <div
              id="offer"
              className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1"
            >
              <div className="mx-auto max-w-lg rounded-md border border-gray-300 bg-white p-6 shadow-sm">
                <BuyBox />
              </div>

              <p className="mt-4 text-center text-xs text-stone-500">
                Free insured shipping &middot; 30-day money-back guarantee &middot;
                Lifetime hardware warranty
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile-only sticky buy bar (needs the shared purchase context) */}
      <StickyMobileBuyBar />

      <Footer />
    </div>
  );
};

/** Wraps the page in the shared purchase context. */
const PageWithProviders: React.FC = () => (
  <PurchaseProvider>
    <Page />
  </PurchaseProvider>
);

export default PageWithProviders;