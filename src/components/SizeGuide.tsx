import React, { useState } from 'react';
import { ShieldCheck, Ruler, Truck, RotateCcw, CheckCircle2, Dog } from 'lucide-react';

interface SizeOption {
  tier: string;
  shortName: string;
  weightCapacity: string;
  vehicleType: string;
  idealBreeds: string;
  dimensions: string;
  folded: string;
  angle: number;
  badge?: string;
  priceDelta: number;
}

const sizes: SizeOption[] = [
  {
    tier: 'Standard Compact',
    shortName: 'Compact',
    weightCapacity: 'Up to 150 lbs',
    vehicleType: 'Sedans, Hatchbacks & Compact SUVs',
    idealBreeds: 'Beagles, French Bulldogs, Border Collies, Spaniels',
    dimensions: '62" L x 16" W x 4" H',
    folded: '31" folded',
    angle: 28,
    badge: 'Best Seller',
    priceDelta: 0,
  },
  {
    tier: 'Heavy-Duty Extended',
    shortName: 'Extended',
    weightCapacity: 'Up to 250 lbs',
    vehicleType: 'Full-Size SUVs, Trucks & Lifted Vehicles',
    idealBreeds: 'German Shepherds, Golden Retrievers, Mastiffs, Labs',
    dimensions: '70" L x 18" W x 4" H',
    folded: '35" folded',
    angle: 24,
    badge: 'Maximum Reach',
    priceDelta: 40,
  },
];

/**
 * Inline geometric SVG showing the ramp angle relative to a vehicle.
 * Symmetric, wireframe-style to match the store's design language.
 */
const RampGeometryDiagram: React.FC<{ angle: number; selected: boolean }> = ({ angle, selected }) => {
  const baseY = 170;
  const rampLength = 190;
  const rad = (angle * Math.PI) / 180;
  const topX = 200 + rampLength * Math.cos(rad);
  const topY = baseY - rampLength * Math.sin(rad);

  return (
    <svg viewBox="0 0 420 200" className="w-full h-auto" role="img" aria-label={`Ramp angle diagram, ${angle} degrees`}>
      <defs>
        <linearGradient id={`rg-${angle}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={selected ? '#1C1917' : '#A8A29E'} />
          <stop offset="100%" stopColor={selected ? '#44403C' : '#D6D3D1'} />
        </linearGradient>
      </defs>

      {/* Ground */}
      <line x1="20" y1={baseY} x2="400" y2={baseY} stroke="#D6D3D1" strokeWidth="2" />
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
        <line key={x} x1={x} y1={baseY} x2={x - 10} y2={baseY + 10} stroke="#E7E5E4" strokeWidth="2" />
      ))}

      {/* Vehicle (right side) */}
      <path
        d={`M${topX} ${topY} L400 ${topY - 22} L400 ${topY + 46} L${topX} ${topY} Z`}
        fill="#E7E5E4"
        stroke="#D6D3D1"
        strokeWidth="1.5"
      />
      <circle cx={topX + 40} cy={topY + 48} r="12" fill="#1C1917" />
      <circle cx={topX + 40} cy={topY + 48} r="4" fill="#FAFAF9" />
      <circle cx="365" cy={topY + 48} r="12" fill="#1C1917" />
      <circle cx="365" cy={topY + 48} r="4" fill="#FAFAF9" />

      {/* Ramp */}
      <path
        d={`M40 ${baseY - 8} L${topX} ${topY} L${topX} ${topY + 8} L40 ${baseY + 4} Z`}
        fill={`url(#rg-${angle})`}
      />
      {/* Ramp treads */}
      {[60, 95, 130, 165].map((x, i) => {
        const t = (x - 40) / (topX - 40);
        const yTop = baseY - 8 + t * (topY - baseY + 8);
        const yBot = baseY + 4 + t * (topY + 8 - baseY - 4);
        return <line key={i} x1={x} y1={yTop + 2} x2={x} y2={yBot - 2} stroke="#FAFAF9" strokeWidth="1.5" opacity="0.4" />;
      })}

      {/* Angle arc */}
      <path
        d={`M40 ${baseY - 38} A38 38 0 0 1 ${40 + 38 * Math.cos(rad)} ${baseY - 38 * Math.sin(rad)}`}
        fill="none"
        stroke="#FBBF24"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text x="62" y={baseY - 42} fontFamily="system-ui" fontSize="15" fontWeight="800" fill="#D97706">
        {angle}°
      </text>

      {/* Height marker */}
      <line x1="20" y1={topY} x2="20" y2={baseY} stroke="#A8A29E" strokeWidth="1" strokeDasharray="3 3" />
      <text x="2" y={(topY + baseY) / 2 + 4} fontFamily="system-ui" fontSize="10" fill="#78716C">
        {Math.round(rampLength * Math.sin(rad))}"
      </text>

      {/* Dog icon on ramp */}
      <g transform={`translate(${70 + (topX - 70) * 0.25}, ${baseY - 8 + (topY - baseY + 8) * 0.25 - 22})`}>
        <ellipse cx="0" cy="0" rx="16" ry="9" fill={selected ? '#FAFAF9' : '#D6D3D1'} />
        <circle cx="-13" cy="-4" r="7" fill={selected ? '#FAFAF9' : '#D6D3D1'} />
        <path d="M-20 -9 L-18 -17 L-12 -11 Z" fill={selected ? '#FAFAF9' : '#D6D3D1'} />
        <line x1="8" y1="6" x2="8" y2="15" stroke={selected ? '#FAFAF9' : '#D6D3D1'} strokeWidth="3" />
        <line x1="-6" y1="6" x2="-6" y2="15" stroke={selected ? '#FAFAF9' : '#D6D3D1'} strokeWidth="3" />
      </g>
    </svg>
  );
};

export const SizeGuide: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState(0);

  return (
    <section id="size-guide" className="py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-stone-50 text-stone-900 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-100 text-amber-800">
            <Ruler className="w-3.5 h-3.5" /> Precision Fit System
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Find the Perfect Fit for Your Companion
          </h2>
          <p className="mt-4 text-stone-600 text-lg">
            Engineered with precise geometric angles to ensure a safe, gentle slope
            for effortless vehicle entry. Select your size below.
          </p>
        </div>

        {/* Size selector cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sizes.map((item, idx) => {
            const isSelected = selectedTier === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedTier(idx)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTier(idx)}
                className={`relative cursor-pointer rounded-3xl p-7 transition-all duration-300 border-2 flex flex-col ${
                  isSelected
                    ? 'border-stone-900 bg-white shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] md:-translate-y-1'
                    : 'border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {item.badge && (
                  <span
                    className={`absolute -top-3 left-7 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                      isSelected ? 'bg-amber-500 text-stone-900' : 'bg-stone-900 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <h3 className="text-xl font-bold">{item.tier}</h3>
                    </div>
                    <p className="text-sm text-stone-500 ml-7.5">{item.vehicleType}</p>
                  </div>
                  <Dog className={`w-7 h-7 shrink-0 ${isSelected ? 'text-amber-600' : 'text-stone-300'}`} />
                </div>

                {/* Geometry diagram */}
                <div className="rounded-2xl bg-stone-100/80 border border-stone-200/60 p-3 mb-5">
                  <RampGeometryDiagram angle={item.angle} selected={isSelected} />
                </div>

                {/* Specs */}
                <div className="space-y-3 text-sm border-t border-stone-200 pt-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Weight Capacity</span>
                    <span className="font-bold text-stone-900">{item.weightCapacity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Open Dimensions</span>
                    <span className="font-semibold text-stone-800 text-right text-xs">{item.dimensions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Folded Size</span>
                    <span className="font-semibold text-stone-800 text-right text-xs">{item.folded}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Slope Angle</span>
                    <span className="font-bold text-amber-700">{item.angle}° gentle slope</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-200">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Recommended For
                  </span>
                  <p className="text-xs text-stone-700 font-medium leading-relaxed">{item.idealBreeds}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vehicle fit calculator hint */}
        <div className="max-w-2xl mx-auto mb-12 p-5 rounded-2xl bg-white border border-stone-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Ruler className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-900">How to measure your vehicle height</h4>
            <p className="text-sm text-stone-600 mt-1">
              Measure from the ground to the bumper or cargo floor of your vehicle. If it is under
              <span className="font-semibold text-stone-900"> 30"</span>, the Compact works. Over 30" — or if you have a
              lifted truck — choose the Extended. Still unsure? Message us and we will size it for you.
            </p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="grid sm:grid-cols-3 gap-4 bg-stone-900 text-stone-100 p-7 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">30-Day Risk-Free Trial</h4>
              <p className="text-xs text-stone-400 leading-relaxed">Test it with your dog in your own car.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:border-l border-stone-800 sm:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Express Insured Shipping</h4>
              <p className="text-xs text-stone-400 leading-relaxed">From domestic fulfillment centers.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:border-l border-stone-800 sm:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-stone-400 leading-relaxed">Prepaid return labels included.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};