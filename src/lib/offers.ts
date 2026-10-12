/**
 * Canonical offer + catalog definitions.
 *
 * Pricing is grounded in market research: the reference product
 * (PetSafe Happy Ride Foldable Dog Car Ramp) has an MSRP of $59.99 on
 * PetSafe.com, Amazon and Target. At $129 the offer was more than double
 * the name-brand reference and would lose to Shopping Comparison listings.
 *
 * $79.99 / $139.99 compare-at (43% off) sits ~33% above the reference MSRP,
 * which the PawGrip Tread, 100-day guarantee and lifetime warranty justify,
 * while leaving ~$40 gross margin for ad spend.
 */

export interface OfferTier {
  id: string;
  label: string;
  sublabel: string;
  price: number;
  compareAt: number;
  badge?: 'MOST POPULAR' | 'BEST VALUE';
  perks: string[];
  /** Whether this tier already includes the traction mat. */
  includesMat: boolean;
  /** Whether this tier includes the crash-tested tether upgrade. */
  includesTether?: boolean;
}

export const TIERS: OfferTier[] = [
  {
    id: 'one',
    label: '1 Ramp',
    sublabel: 'Single vehicle',
    price: 79.99,
    compareAt: 139.99,
    perks: ['Free insured shipping', '100-day money-back guarantee'],
    includesMat: false,
  },
  {
    id: 'two',
    label: '1 Ramp + Traction Mat',
    sublabel: 'The complete setup',
    price: 89.99,
    compareAt: 169.99,
    badge: 'MOST POPULAR',
    perks: [
      'Heavy-Duty Traction Mat 2-Pack (a $30 value)',
      'Free insured express shipping',
      '100-day money-back guarantee',
    ],
    includesMat: true,
  },
  {
    id: 'three',
    label: '2 Ramps + Mat + Tether',
    sublabel: 'Two vehicles, fully kitted',
    price: 159.99,
    compareAt: 249.97,
    badge: 'BEST VALUE',
    perks: [
      '2 ramps for two vehicles',
      'Traction Mat 2-Pack + crash-tested tether',
      'Priority white-glove shipping',
      '100-day money-back guarantee',
    ],
    includesMat: true,
    includesTether: true,
  },
];

/** Default tier shown on load. */
export const DEFAULT_TIER_ID = 'two';

/** Returns a tier by id, falling back to the recommended bundle. */
export function getTier(id: string): OfferTier {
  return TIERS.find((t) => t.id === id) ?? TIERS[1];
}

/* --------------------------------------------------------------------------
   Money helpers
   -------------------------------------------------------------------------- */

/**
 * Rounds to whole cents.
 *
 * JS float arithmetic makes 139.99 - 79.99 evaluate to 60.000000000000014,
 * which renders verbatim into prices and destroys trust in the offer. Every
 * displayed amount goes through here.
 */
export function money(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Formats as a 2-decimal string, e.g. 79.9 -> "79.90". */
export function formatMoney(value: number): string {
  return money(value).toFixed(2);
}

/* --------------------------------------------------------------------------
   Shopify product handles — must match the slugs created in Shopify Admin.
   The seeder in scripts/shopify-seed.mjs creates exactly these handles.
   -------------------------------------------------------------------------- */
export const PRODUCT_HANDLES = {
  heroRamp: 'premium-foldable-dog-car-ramp',
  tractionMat: 'heavy-duty-traction-mat-upgrade-2-pack',
  carTether: 'crash-tested-adjustable-car-safety-tether',
  bedSteps: 'orthopedic-foam-bed-steps',
  jointChews: 'advanced-hip-joint-soft-chews',
} as const;

/** Collection handles the storefront can pull from. */
export const COLLECTION_HANDLES = {
  carMobility: 'car-mobility',
  homeMobility: 'home-mobility',
  jointCare: 'joint-care',
  bumps: 'bumps',
} as const;

/** Add-on prices used by the order bump and post-purchase upsell. */
export const ADDON_PRICES = {
  tractionMat: 15,
  carTether: 19.99,
} as const;
