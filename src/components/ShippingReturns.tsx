import React from 'react';
import { PackageCheck, Truck, RotateCcw, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface Step {
  num: string;
  title: string;
  desc: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    num: '1',
    title: 'Order in 60 Seconds',
    desc: 'Choose your size, check out securely with Shop Pay, Apple Pay, or card. Orders before 2pm ship the same business day.',
    icon: PackageCheck,
  },
  {
    num: '2',
    title: 'Arrives in 2–5 Days',
    desc: 'Insured express delivery from our domestic warehouse, fully tracked. Free on every order — no minimum.',
    icon: Truck,
  },
  {
    num: '3',
    title: 'Try It Risk-Free',
    desc: 'Give your dog up to 30 days to get comfortable. Watch them walk up unassisted — most dogs adapt in a day.',
    icon: Clock,
  },
  {
    num: '4',
    title: 'Love It or Return It',
    desc: 'Not the right fit? Email us for a prepaid return label and a full refund within 5 business days. No restocking fee.',
    icon: RotateCcw,
  },
];

export const ShippingReturns: React.FC = () => {
  return (
    <section id="shipping" className="py-20 lg:py-24 px-4 sm:px-6 bg-white text-stone-900 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-100 text-amber-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Service Promise
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Shipping & Returns, Completely Sorted
          </h2>
          <p className="mt-4 text-stone-600 text-lg">
            Fast, free, insured — and a guarantee with zero fine print.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-7 rounded-3xl bg-stone-50 border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
            >
              <span className="absolute -top-4 -left-4 w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-extrabold text-lg shadow-lg rotate-3">
                {step.num}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-5 mt-2">
                <step.icon className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Detail panels */}
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl border-2 border-stone-200">
            <div className="flex items-center gap-2.5 mb-3">
              <MapPin className="w-5 h-5 text-stone-900" />
              <h4 className="font-bold">Where We Ship</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              All 50 US states via insured express carriers. Canada and UK available at checkout —
              duties calculated upfront so nothing surprises you at the door.
            </p>
          </div>

          <div className="p-6 rounded-3xl border-2 border-stone-200">
            <div className="flex items-center gap-2.5 mb-3">
              <RotateCcw className="w-5 h-5 text-stone-900" />
              <h4 className="font-bold">Return Policy</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              30 days from delivery, used or unused. Email us and we send a prepaid label the same day.
              Refunds are issued within 5 business days of the warehouse receiving the ramp.
            </p>
          </div>

          <div className="p-6 rounded-3xl border-2 border-stone-200">
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldCheck className="w-5 h-5 text-stone-900" />
              <h4 className="font-bold">1-Year Warranty</h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Every ramp is covered against manufacturing defects for a full year —
              frame, surface, and hardware. The 30-day money-back guarantee is separate and unconditional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};