import React, { useState } from 'react';
import { Star, ThumbsUp, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { AuthorByline } from './AuthorByline';
import { readDkiParams } from '../lib/dki';

/** Gallery frames. Replace these with real product photography when shot. */
const GALLERY = [
  {
    src: '/assets/hero-ramp.svg',
    alt: 'Dog walking up the PawGrip Pro telescoping ramp into an SUV',
    label: 'In use',
  },
  {
    src: '/assets/hero-ramp.svg',
    alt: 'Close-up of the high-traction ramp surface',
    label: 'Surface detail',
  },
  {
    src: '/assets/hero-ramp.svg',
    alt: 'Ramp folded flat for trunk storage',
    label: 'Folded 31"',
  },
  {
    src: '/assets/hero-ramp.svg',
    alt: 'Non-slip locking mat accessory',
    label: 'Bundled mat',
  },
];

const RATING = 4.9;
const REVIEW_COUNT = 2847;

/**
 * Hero editorial block: advertorial byline, DKI headline, and a
 * strict-aspect-ratio image gallery. The purchase UI lives in the
 * sticky right-hand column (see BuyBox).
 */
export const HeroSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  // Read once on mount. This is a client-only SPA, so there is no hydration
  // mismatch to guard against.
  const [dki] = useState(() => readDkiParams());

  const active = GALLERY[activeIndex];

  return (
    <section id="hero" className="scroll-mt-24">
      {/* Editorial byline */}
      <AuthorByline />

      {/* DKI headline */}
      <h1 className="mt-5 text-[2rem] leading-[1.08] font-extrabold text-stone-900 sm:text-[2.6rem] lg:text-[3rem]">
        The <span className="text-blue-700">{dki.vehiclePhrase}</span>
        <br />
        {dki.locationPhrase}
      </h1>

      <p className="mt-4 max-w-xl text-[1.0625rem] text-stone-600">
        Stop lifting a 90 lb dog into your {dki.vehicleInline}. The PawGrip Pro gives
        dogs up to 250 lbs a 24&ndash;28&deg; joint-safe slope they walk up on their own{' '}
        {dki.locationInline} &mdash; in seconds, with no jumping and no strain on your
        back. {dki.breedPhrase.charAt(0).toUpperCase() + dki.breedPhrase.slice(1)}.
      </p>

      {/* Rating row */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-[18px] w-[18px] ${
                  i <= Math.round(RATING) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-stone-900">{RATING}</span>
          <span className="text-sm text-stone-500">({REVIEW_COUNT.toLocaleString()} reviews)</span>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-600">
          <ThumbsUp className="h-4 w-4 text-blue-600" aria-hidden="true" />
          96% would buy again
        </span>
      </div>

      {/* Gallery */}
      <div className="mt-7">
        {/* Main frame — strict mathematical aspect ratio */}
        <div className="relative overflow-hidden rounded-3xl bg-stone-100 ring-1 ring-stone-900/5">
          <div className="aspect-[4/5] md:aspect-square">
            <img
              key={active.src}
              src={active.src}
              alt={active.alt}
              width={1200}
              height={900}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Frame label */}
          <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-700 backdrop-blur-md ring-1 ring-stone-900/5">
            {active.label}
          </span>

          {/* In-image assurance strip */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5 bg-gradient-to-t from-stone-900/70 to-transparent px-4 py-3.5 text-[11px] font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Ships in 24h
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> 30-day returns
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> 1-yr warranty
            </span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {GALLERY.map((frame, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={frame.alt}
              onClick={() => setActiveIndex(idx)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 transition-all duration-200 hover:-translate-y-0.5 ${
                idx === activeIndex
                  ? 'ring-2 ring-blue-600'
                  : 'ring-stone-900/10 hover:ring-stone-900/20'
              }`}
            >
              <img
                src={frame.src}
                alt=""
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};