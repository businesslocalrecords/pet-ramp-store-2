import React from 'react';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

type Cell = true | false | 'partial';

interface Row {
  feature: string;
  pawgrip: Cell;
  knockoff: Cell;
  jumping: Cell;
}

const rows: Row[] = [
  { feature: 'Holds 250 lbs without flexing', pawgrip: true, knockoff: false, jumping: 'partial' },
  { feature: 'High-traction surface that grips nails', pawgrip: true, knockoff: 'partial', jumping: false },
  { feature: 'Side rails for nervous dogs', pawgrip: true, knockoff: false, jumping: false },
  { feature: 'Non-slip feet on wet pavement', pawgrip: true, knockoff: false, jumping: 'partial' },
  { feature: 'Folds to 31" for trunk storage', pawgrip: true, knockoff: true, jumping: true },
  { feature: '1-year hardware warranty', pawgrip: true, knockoff: false, jumping: false },
  { feature: '30-day money-back guarantee', pawgrip: true, knockoff: false, jumping: false },
];

const CellIcon: React.FC<{ value: Cell }> = ({ value }) => {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" aria-label="Yes" />;
  }
  if (value === 'partial') {
    return <MinusCircle className="mx-auto h-6 w-6 text-amber-500" aria-label="Partial" />;
  }
  return <XCircle className="mx-auto h-6 w-6 text-red-500" aria-label="No" />;
};

/**
 * "Us vs. Them" cross-comparison matrix. Our column is highlighted so the
 * eye lands on it first.
 */
export const ComparisonTable: React.FC = () => {
  return (
    <section id="compare" className="scroll-mt-24">
      <header className="mb-7">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700">
          Head to head
        </span>
        <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
          PawGrip Pro vs. Cheap Knockoffs
        </h2>
        <p className="mt-2 max-w-xl text-stone-600">
          Most $60 ramps are plastic sheeting on wire hinges. Here is what you
          actually give up when you buy the cheapest option on the page.
        </p>
      </header>

      <div className="overflow-x-auto rounded-3xl ring-1 ring-gray-900/5">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-900/5">
              <th scope="col" className="px-5 py-4 text-sm font-semibold text-stone-500">
                Feature
              </th>
              <th scope="col" className="bg-blue-50/30 px-4 py-4 text-center">
                <span className="block text-sm font-bold text-blue-700">PawGrip Pro</span>
                <span className="text-[11px] font-medium text-blue-600/80">This product</span>
              </th>
              <th scope="col" className="px-4 py-4 text-center text-sm font-semibold text-stone-500">
                Cheap Knockoffs
              </th>
              <th scope="col" className="px-4 py-4 text-center text-sm font-semibold text-stone-500">
                Letting Them Jump
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b border-gray-900/5 last:border-0 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                }`}
              >
                <th scope="row" className="px-5 py-3.5 text-sm font-medium text-stone-800">
                  {row.feature}
                </th>
                <td className="bg-blue-50/30 px-4 py-3.5 ring-1 ring-inset ring-blue-600/20">
                  <CellIcon value={row.pawgrip} />
                </td>
                <td className="px-4 py-3.5">
                  <CellIcon value={row.knockoff} />
                </td>
                <td className="px-4 py-3.5">
                  <CellIcon value={row.jumping} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Included
        </span>
        <span className="flex items-center gap-1.5">
          <MinusCircle className="h-4 w-4 text-amber-500" /> Varies by seller
        </span>
        <span className="flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-red-500" /> Not included
        </span>
      </div>
    </section>
  );
};