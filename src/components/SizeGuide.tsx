import React, { useState } from 'react';
import { Ruler, CheckCircle2, Dog, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { usePurchase } from '../lib/purchase-context';
import {
  RAMP_SIZES,
  slopeDeg,
  recommendSize,
  COMPACT_MAX_HEIGHT_IN,
  formatMoney,
  type RampSize,
} from '../lib/offers';
import { trackSizeFinderUsed } from '../lib/analytics';
import { POLICY } from '../lib/policy';

/** Drawing scale for the diagram: pixels per inch. */
const SCALE = 4.5;
const BASE_X = 60;
const BASE_Y = 240;

/** Vehicle heights shown in the reference slope table. */
const REFERENCE_HEIGHTS = [20, 24, 28, 30, 32, 36];

/**
 * Live geometry diagram for the entered vehicle height.
 *
 * The old diagram labeled the ramp with `rampLength * sin(angle)` (the "89″"
 * and "77″ markers) — pixel-artifact numbers that meant nothing to a shopper.
 * This version labels the two numbers that matter: the actual cargo height and
 * the actual slope angle, both computed from the published specs.
 */
const RampDiagram: React.FC<{ heightIn: number; size: RampSize; active: boolean }> = ({
  heightIn,
  size,
  active,
}) => {
  const angle = slopeDeg(heightIn, size.lengthIn);
  const rad = (angle * Math.PI) / 180;
  const run = size.lengthIn * Math.cos(rad) * SCALE;
  const rise = size.lengthIn * Math.sin(rad) * SCALE;
  const topX = BASE_X + run;
  const topY = BASE_Y - rise;
  const stroke = active ? '#1C1917' : '#A8A29E';

  return (
    <svg
      viewBox="0 0 420 280"
      className="h-auto w-full"
      role="img"
      aria-label={`${size.name} ramp reaching a ${heightIn}-inch cargo height at ${angle.toFixed(1)} degrees`}
    >
      {/* Ground */}
      <line x1="20" y1={BASE_Y} x2="400" y2={BASE_Y} stroke="#D6D3D1" strokeWidth="2" />
      {[40, 90, 140, 190, 240, 290, 340, 390].map((x) => (
        <line key={x} x1={x} y1={BASE_Y} x2={x - 9} y2={BASE_Y + 9} stroke="#E7E5E4" strokeWidth="2" />
      ))}

      {/* Vehicle block: cargo floor at the entered height */}
      <path
        d={`M${topX} ${topY} L400 ${topY - 14} L400 ${topY + 52} L${topX} ${topY} Z`}
        fill="#E7E5E4"
        stroke="#D6D3D1"
        strokeWidth="1.5"
      />
      <circle cx={topX + 34} cy={topY + 54} r="11" fill="#1C1917" />
      <circle cx="368" cy={topY + 54} r="11" fill="#1C1917" />

      {/* Ramp deck + side rail */}
      <line x1={BASE_X} y1={BASE_Y} x2={topX} y2={topY} stroke={stroke} strokeWidth="7" strokeLinecap="round" />
      <line
        x1={BASE_X}
        y1={BASE_Y - 14}
        x2={topX}
        y2={topY - 14}
        stroke={active ? '#44403C' : '#D6D3D1'}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Feet */}
      <rect x={BASE_X - 14} y={BASE_Y} width="28" height="12" rx="3" fill="#1C1917" />

      {/* Height marker — the real cargo height */}
      <line
        x1={BASE_X - 26}
        y1={topY}
        x2={BASE_X - 26}
        y2={BASE_Y}
        stroke="#A8A29E"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text
        x={BASE_X - 32}
        y={(topY + BASE_Y) / 2 + 4}
        fontFamily="system-ui"
        fontSize="11"
        fill="#78716C"
        textAnchor="end"
      >
        {heightIn}&Prime;
      </text>

      {/* Angle arc */}
      <path
        d={`M${BASE_X + 44} ${BASE_Y} A44 44 0 0 1 ${BASE_X + 44 * Math.cos(rad)} ${BASE_Y - 44 * Math.sin(rad)}`}
        fill="none"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text x={BASE_X + 54} y={BASE_Y - 8} fontFamily="system-ui" fontSize="14" fontWeight="800" fill="#D97706">
        {angle.toFixed(1)}&deg;
      </text>

      {/* Dog glyph walking up the ramp */}
      <g
        transform={`translate(${BASE_X + run * 0.35}, ${BASE_Y - rise * 0.35 - 24}) rotate(${-angle})`}
      >
        <ellipse cx="0" cy="0" rx="16" ry="9" fill={active ? '#FAFAF9' : '#D6D3D1'} stroke={active ? '#1C1917' : '#A8A29E'} strokeWidth="1.5" />
        <circle cx="-13" cy="-4" r="7" fill={active ? '#FAFAF9' : '#D6D3D1'} stroke={active ? '#1C1917' : '#A8A29E'} strokeWidth="1.5" />
        <line x1="8" y1="6" x2="8" y2="15" stroke={active ? '#1C1917' : '#A8A29E'} strokeWidth="3" />
        <line x1="-6" y1="6" x2="-6" y2="15" stroke={active ? '#1C1917' : '#A8A29E'} strokeWidth="3" />
      </g>

      {/* Size caption */}
      <text x="210" y="272" fontFamily="system-ui" fontSize="11" fontWeight="600" fill="#78716C" textAnchor="middle">
        {size.name} &middot; {size.lengthIn}&Prime; unfolded
      </text>
    </svg>
  );
};

/**
 * Interactive size finder.
 *
 * Enter the vehicle's cargo height (ground to bumper or cargo floor) and the
 * finder computes the real slope for each published size via slopeDeg() —
 * the ramp's unfolded length is the hypotenuse, so the angle is
 * asin(height / length): 24″ gives 22.8° on the Compact and 20.1° on the
 * Extended. The recommendation follows the published spec: up to 30″ the
 * Compact works; above it the Extended is the honest choice.
 *
 * "Select {Size}" writes the choice into the shared purchase context (which
 * resolves the matching Shopify variant) and scrolls to the offer box.
 */
export const SizeGuide: React.FC = () => {
  const { rampSize, setRampSize } = usePurchase();
  const [heightIn, setHeightIn] = useState(24);

  const recommended = recommendSize(heightIn);
  const compactSlope = slopeDeg(heightIn, RAMP_SIZES[0].lengthIn);
  const extendedSlope = slopeDeg(heightIn, RAMP_SIZES[1].lengthIn);

  const handleSelect = (size: RampSize) => {
    setRampSize(size.id);
    trackSizeFinderUsed({
      size: size.id,
      vehicleHeightIn: heightIn,
      slopeDeg: Number(slopeDeg(heightIn, size.lengthIn).toFixed(1)),
    });
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('offer')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section id="size-guide" className="scroll-mt-24 py-12 sm:py-16">
      <header className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-800">
          <Ruler className="h-3.5 w-3.5" aria-hidden="true" /> Size finder
        </span>
        <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
          Find the right size for your vehicle
        </h2>
        <p className="mt-2 max-w-xl text-stone-600">
          Measure from the ground to your bumper or cargo floor. The finder computes the
          slope you would actually get with each published size &mdash; lower is gentler.
        </p>
      </header>

      {/* Height input */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <label htmlFor="vehicle-height" className="block text-sm font-bold text-stone-900">
              Vehicle cargo height
            </label>
            <p className="mt-1 text-xs text-stone-500">
              Ground to the bumper or cargo floor your dog steps onto.
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-extrabold tabular-nums text-stone-900">{heightIn}</span>
            <span className="ml-1 text-lg font-bold text-stone-400">in</span>
          </div>
        </div>

        <input
          id="vehicle-height"
          type="range"
          min={18}
          max={42}
          step={1}
          value={heightIn}
          onChange={(e) => setHeightIn(Number(e.target.value))}
          className="mt-4 h-12 w-full cursor-pointer accent-blue-700"
          aria-describedby="vehicle-height-help"
        />
        <div className="flex justify-between text-[11px] font-medium text-stone-400">
          <span>18&Prime; (low sedan)</span>
          <span>42&Prime; (lifted truck)</span>
        </div>
        <p id="vehicle-height-help" className="mt-3 text-sm text-stone-600">
          At {heightIn}&Prime; the Compact gives you a{' '}
          <strong className="text-stone-900">{compactSlope.toFixed(1)}&deg;</strong> slope, the
          Extended <strong className="text-stone-900">{extendedSlope.toFixed(1)}&deg;</strong>.{' '}
          {heightIn > COMPACT_MAX_HEIGHT_IN
            ? `Above ${COMPACT_MAX_HEIGHT_IN}\u2033 the Compact steepens past ${slopeDeg(
                COMPACT_MAX_HEIGHT_IN,
                RAMP_SIZES[0].lengthIn
              ).toFixed(0)}\u00b0 — the Extended is the honest recommendation.`
            : `The Compact is the right call up to about ${COMPACT_MAX_HEIGHT_IN}\u2033; the Extended is there when you need it gentler or taller.`}
        </p>
      </div>

      {/* Size cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {RAMP_SIZES.map((size) => {
          const isRecommended = recommended.id === size.id;
          const isSelected = rampSize.id === size.id;
          const slope = slopeDeg(heightIn, size.lengthIn);
          return (
            <div
              key={size.id}
              className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 transition-colors ${
                isRecommended ? 'border-stone-900' : 'border-stone-200'
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-3 left-6 bg-stone-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  Recommended for {heightIn}&Prime;
                </span>
              )}

              <div className="mb-4 flex items-center gap-2.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  {size.tierName} &middot; {size.lengthIn}&Prime;
                </h3>
                <Dog className={`ml-auto h-6 w-6 ${isRecommended ? 'text-amber-600' : 'text-stone-300'}`} aria-hidden="true" />
              </div>

              {/* Live diagram */}
              <div className="rounded-xl border border-stone-200/60 bg-stone-100/80 p-3">
                <RampDiagram heightIn={heightIn} size={size} active={isRecommended} />
              </div>

              {/* Specs */}
              <dl className="mt-4 space-y-2.5 border-t border-stone-200 pt-4 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-stone-500">Slope at {heightIn}&Prime;</dt>
                  <dd className="font-bold text-amber-700">{slope.toFixed(1)}&deg;</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-stone-500">Weight capacity</dt>
                  <dd className="font-bold text-stone-900">{size.weightCapacityLb} lb</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-stone-500">Open dimensions</dt>
                  <dd className="text-right text-xs font-semibold text-stone-800">
                    {size.lengthIn}&Prime; L &times; {size.widthIn}&Prime; W &times; {size.deckHeightIn}&Prime; H
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-stone-500">Folded size</dt>
                  <dd className="text-xs font-semibold text-stone-800">{size.foldedIn}&Prime; folded</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-stone-500">Best for</dt>
                  <dd className="max-w-[60%] text-right text-xs font-medium text-stone-700">
                    {size.vehicleType}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
                <span className="text-sm font-bold text-stone-900">
                  {size.priceDelta > 0 ? `+$${formatMoney(size.priceDelta)}` : 'Included in every bundle'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelect(size)}
                  className={`flex min-h-12 items-center rounded-md px-5 text-sm font-bold transition-colors ${
                    isSelected
                      ? 'bg-stone-900 text-white hover:bg-stone-800'
                      : 'bg-[#F37021] text-white hover:bg-[#D95E1A]'
                  }`}
                >
                  {isSelected ? 'Selected' : `Select ${size.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reference slope table */}
      <div className="mt-8 overflow-x-auto rounded-2xl ring-1 ring-gray-900/5">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <caption className="px-5 py-3 text-left text-xs text-stone-500">
            Slope by vehicle height, computed from the published ramp lengths &mdash;{' '}
            <strong className="text-stone-700">lower is gentler</strong>.
          </caption>
          <thead>
            <tr className="border-b border-gray-900/5">
              <th scope="col" className="px-5 py-3 text-xs font-semibold text-stone-500">
                Cargo height
              </th>
              {RAMP_SIZES.map((size) => (
                <th key={size.id} scope="col" className="px-4 py-3 text-center">
                  <span className="block text-xs font-bold text-stone-900">{size.name}</span>
                  <span className="text-[11px] font-medium text-stone-500">{size.lengthIn}&Prime; ramp</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REFERENCE_HEIGHTS.map((h, idx) => (
              <tr
                key={h}
                className={`border-b border-gray-900/5 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}`}
              >
                <th scope="row" className="px-5 py-2.5 text-xs font-semibold text-stone-800">
                  {h}&Prime;
                </th>
                {RAMP_SIZES.map((size) => (
                  <td key={size.id} className="px-4 py-2.5 text-center text-xs font-medium text-stone-700">
                    {slopeDeg(h, size.lengthIn).toFixed(1)}&deg;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trust bar — values from lib/policy.ts */}
      <div className="mt-8 grid gap-4 rounded-2xl bg-stone-900 p-6 text-stone-100 sm:grid-cols-3">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
            <ShieldCheck className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold">{POLICY.returnDays}-Day Risk-Free Trial</h4>
            <p className="text-xs leading-relaxed text-stone-400">Test it with your dog in your own car.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:border-l sm:border-stone-800 sm:pl-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
            <Truck className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Insured Shipping</h4>
            <p className="text-xs leading-relaxed text-stone-400">
              Free on every order, in {POLICY.deliveryWindow}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:border-l sm:border-stone-800 sm:pl-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
            <RotateCcw className="h-5 w-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Hassle-Free Returns</h4>
            <p className="text-xs leading-relaxed text-stone-400">
              {POLICY.returnShippingPaidBy === 'store'
                ? 'Prepaid return label included.'
                : 'Return label provided at cost.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
