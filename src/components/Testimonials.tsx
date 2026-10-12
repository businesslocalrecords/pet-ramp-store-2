import React from 'react';
import { Star, Quote, BadgeCheck, ThumbsUp } from 'lucide-react';

interface Review {
  name: string;
  location: string;
  dog: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
}

const reviews: Review[] = [
  {
    name: 'Marcus T.',
    location: 'Austin, TX',
    dog: 'German Shepherd, 4 yrs',
    rating: 5,
    title: 'My back is saved — and Zeus loves it',
    body: 'I am 61 and lifting an 85 lb shepherd into my F-150 was destroying my back. First day on this ramp he walked right up like he had done it his whole life. The non-slip surface actually grips his nails. Best purchase I have made for my dog.',
    date: '2 weeks ago',
    helpful: 142,
  },
  {
    name: 'Priya R.',
    location: 'Denver, CO',
    dog: 'Golden Retriever, 9 yrs',
    rating: 5,
    title: 'Our senior dog is hiking again',
    body: 'Bella has hip dysplasia and jumping into the car became impossible. Her vet recommended a ramp at a shallow angle and this one measured up. We took her on three trail trips since and she hops right in. Worth every penny.',
    date: '1 month ago',
    helpful: 98,
  },
  {
    name: 'Dana K.',
    location: 'Portland, OR',
    dog: 'Corgi, 6 yrs',
    rating: 5,
    title: 'Even works for a low corgi',
    body: 'I thought a ramp would be overkill for a corgi but his back is long and jumping was getting risky. The compact size fits my forester perfectly and it folds flat enough to store behind the seat. Shipping was two days.',
    date: '3 weeks ago',
    helpful: 76,
  },
  {
    name: 'James W.',
    location: 'Chicago, IL',
    dog: 'Great Dane mix, 3 yrs',
    rating: 5,
    title: 'Holds 140 lbs without flexing',
    body: 'I was skeptical about the weight rating but our Dane is 140 lbs and the ramp does not flex or creak at all. The side rails give him confidence and he does not shy away from the edge. Solid engineering.',
    date: '1 week ago',
    helpful: 64,
  },
  {
    name: 'Elena S.',
    location: 'Miami, FL',
    dog: 'Labrador, 11 yrs',
    rating: 5,
    title: 'Arthritis made this a necessity',
    body: 'Rocky refused to get in the car after his arthritis got bad. Within a week of using the ramp daily he walks up on his own. It is sturdy but light enough for me to carry one-handed. Absolutely recommend.',
    date: '5 days ago',
    helpful: 51,
  },
  {
    name: 'Tom H.',
    location: 'Seattle, WA',
    dog: 'Husky, 5 yrs',
    rating: 4,
    title: 'Great ramp, wish the mat was bigger',
    body: 'The ramp itself is excellent — very grippy and stable even on wet pavement. The non-slip mat is a nice idea but a bit small for my SUV bumper. Minor issue on an otherwise fantastic product. Support was responsive when I emailed.',
    date: '2 months ago',
    helpful: 33,
  },
];

const Stars: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`${size} ${i <= rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300 fill-stone-200'}`}
      />
    ))}
  </div>
);

/** Avatar initials in a deterministic gradient tile. */
const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  const palettes = [
    'from-amber-400 to-orange-500',
    'from-stone-600 to-stone-800',
    'from-emerald-400 to-teal-600',
    'from-sky-400 to-indigo-600',
    'from-rose-400 to-pink-600',
    'from-violet-400 to-purple-600',
  ];
  const palette = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div
      className={`w-11 h-11 rounded-full bg-gradient-to-br ${palette} flex items-center justify-center text-white font-bold text-sm shrink-0`}
    >
      {initials}
    </div>
  );
};

export const Testimonials: React.FC = () => {
  return (
    <section id="reviews" className="py-20 lg:py-24 px-4 sm:px-6 bg-white text-stone-900 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-100 text-amber-800">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified Buyer Reviews
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Loved by Dogs, Trusted by Owners
          </h2>

          {/* Aggregate rating */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-4xl font-extrabold">4.9</span>
              <div>
                <Stars rating={5} size="w-5 h-5" />
                <p className="text-xs text-stone-500 mt-0.5">2,847 verified reviews</p>
              </div>
            </div>
            <div className="text-sm text-stone-600 text-left space-y-1">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-stone-900">96%</span> would buy again
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-stone-900">94%</span> saw their dog use it within 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Review grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="relative flex flex-col p-6 rounded-3xl bg-stone-50 border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-stone-200" />

              <div className="flex items-center gap-3 mb-4">
                <Avatar name={review.name} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm truncate">{review.name}</span>
                    <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-stone-500 truncate">
                    {review.location} &middot; {review.dog}
                  </p>
                </div>
              </div>

              <Stars rating={review.rating} />

              <h3 className="mt-3 font-bold text-base leading-snug">{review.title}</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed flex-1">{review.body}</p>

              <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span>{review.date}</span>
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {review.helpful} found this helpful
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust summary strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { k: '2,847', v: 'Verified reviews' },
            { k: '4.9/5', v: 'Average rating' },
            { k: '12,000+', v: 'Ramps delivered' },
            { k: '96%', v: 'Would recommend' },
          ].map((item, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-stone-900 text-stone-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{item.k}</div>
              <div className="mt-1 text-xs text-stone-400">{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};