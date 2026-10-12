import React, { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

interface Faq {
  q: string;
  a: string;
}

const faqs: Faq[] = [
  {
    q: 'Will my dog actually use it?',
    a: 'Yes — 94% of customers report their dog walking up the ramp unassisted within the first 24 hours. The key is the shallow 24–28° slope and the high-traction surface that gives dogs confident footing. Start slow: let your dog sniff the ramp, place treats along it, and praise each step. Most dogs need only two or three sessions.',
  },
  {
    q: 'How do I know which size fits my vehicle?',
    a: 'Measure from the ground to your bumper or cargo floor. Under 30" — the Compact (62" ramp) is ideal for sedans, hatchbacks, and compact SUVs. Over 30" or lifted trucks — choose the Extended (70" ramp). Still unsure? Email us a photo of your vehicle and we will size it for you free of charge.',
  },
  {
    q: 'Is the ramp safe for senior dogs or dogs with arthritis?',
    a: 'Absolutely — it was designed for them. Veterinarians recommend ramps over jumping precisely because jumping loads the joints with 3–4× a dog\'s body weight on impact. Our gentle slope eliminates that impact entirely. The PawGrip Pro is used by thousands of owners of senior dogs with hip dysplasia and arthritis.',
  },
  {
    q: 'How much weight can it hold?',
    a: 'The Compact is rated to 150 lbs and the Extended to 250 lbs. Both are tested with a 2× safety margin, so an Extended ramp has been static-tested beyond 500 lbs without structural flex. The aircraft-grade aluminum frame will not bow under load.',
  },
  {
    q: 'Will it slip on wet pavement or in my garage?',
    a: 'No. The ramp feet have rubberized non-slip grips, and the walking surface is a sandpaper-textured fiberglass composite. Our free non-slip locking mat (in the bundle) adds another layer of security against a smooth garage floor or bumper.',
  },
  {
    q: 'How does the 30-day guarantee work?',
    a: 'Order today and put the ramp in your car. If your dog does not take to it, if the size is wrong, or if you simply change your mind within 30 days, email us and we will send a prepaid return label. You get a full refund — no restocking fee, no questions, no hard feelings.',
  },
  {
    q: 'How fast is shipping and where do you ship from?',
    a: 'Orders placed before 2pm ship the same business day from our domestic warehouse, with insured express delivery in 2–5 business days across the continental US. You will receive a tracking link by email as soon as your order leaves.',
  },
  {
    q: 'Can it be used for trucks with a lift kit?',
    a: 'Yes — that is exactly what the Extended (70") is built for. It reaches the cargo height of most lifted trucks. For extreme lift kits over 40", contact us and we will advise whether you need our custom-extension accessory.',
  },
  {
    q: 'Is assembly required?',
    a: 'None. The PawGrip Pro arrives fully assembled. Unfold it, set the feet, and it is ready to use. It telescopes to length in seconds and folds back down to 31–35" for storage in your trunk or garage.',
  },
];

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 lg:py-24 px-4 sm:px-6 bg-stone-50 text-stone-900 scroll-mt-16">
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-100 text-amber-800">
            <MessageCircleQuestion className="w-3.5 h-3.5" /> Questions & Answers
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Everything You Are Wondering
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-stone-900 bg-white shadow-md' : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-base leading-snug">{faq.q}</span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-stone-900 text-white rotate-180' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-stone-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-10 text-center p-7 rounded-3xl bg-stone-900 text-stone-100">
          <h3 className="font-bold text-lg">Still have a question?</h3>
          <p className="mt-1 text-sm text-stone-400">
            Our team replies within 2 hours, 7 days a week.
          </p>
          <a
            href="mailto:support@pawgrippro.com"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-xl font-bold transition-colors"
          >
            Email Support
          </a>
        </div>
      </div>
    </section>
  );
};