# claims.md — Claim Audit & Rewordings

Every claim on this storefront, where it came from, and what happened to it.
This is the record that proves the V3 overhaul removed unverifiable content
rather than quietly reworded it. If you are about to add a claim, add a row
here first.

## The rules

1. **No claim without a source.** Specifications, policy numbers and prices
   live in `src/lib/offers.ts` / `src/lib/policy.ts` and are single-sourced.
2. **No invented social proof.** No star ratings, review counts, "94% of
   customers", customer counts, or vet/medical endorsements that the store
   cannot produce.
3. **No medical claims.** The ramp is described with physics and specs
   (slope angles, published weight ratings); health outcomes are deferred to
   the visitor's veterinarian.
4. **Real compare-at prices only.** A strikethrough price must be one the
   store has actually charged.

## Approved price-display decision (owner)

The original brief asked to strip all compare-at prices. The owner decided to
**keep them as a subtle anchor** instead:

- The compare-at price renders muted and small (`text-xs text-gray-400
  line-through`) in `TieredOfferSelector` — it anchors value without reading
  like discount-warehouse pricing.
- "Save $x vs buying separately" is computed live
  (`bundleSavings()` in `offers.ts`) and renders **only when genuinely
  positive**.
- Every compare-at in `offers.ts` is a real, previously charged price.

## Rewording table

| Where | Old claim | Why it had to go | What it says now |
|---|---|---|---|
| `index.html` JSON-LD | `aggregateRating` 4.9 / 2,847 | Fabricated ratings; Google rich-result & Merchant Center policy reject invented review markup | Removed. Returns only when a real review source exists (LAUNCH_BLOCKERS #5) |
| `index.html` meta/JSON-LD | "vet-approved", "fits any vehicle", `price: "149"` | Unverifiable; false for the 150 lb Compact; stale price | "rated to 150 lb (Compact) or 250 lb (Extended)", `price: "79.99"` matching `DEFAULT_TIER_ID` |
| `HeroSection` | "4.9 stars · 2,847 reviews", "96% would buy again" | Invented review stats | Removed; reviews live behind `GATES.testimonials` |
| `HeroSection` | "24–28° joint-safe slope" | Vet-style medical claim; the real angles depend on vehicle height | "about 20–25° at typical SUV heights", computed by `slopeDeg()` and shown live in the SizeGuide |
| `AdvertorialHeader` | Fake "Advertisement — Lifestyles" editorial shell + fabricated vet author | The page is a product page, not an advertorial | Component deleted |
| `AuthorByline` → `Byline` | "Dr. Sarah Jenkins, DVM — medically reviewed" | Invented veterinarian and medical review | "By the PawGrip Pro team" + last-updated stamp |
| `UrgencyBar` → `AnnouncementBar` | "RAMP20 — 20% off", countdown, stock scraped from the nonexistent `dog-car-ramp` handle | Coupon no longer exists; the stock call never resolved (dead code — real handle is `premium-foldable-dog-car-ramp`) | Static bar: free insured shipping, 30-day money-back guarantee, 12-month hardware warranty (all from `policy.ts`) |
| `FeatureBento` → `Benefits` | "Vet-Approved Slope", "eliminates the 3–4× body-weight impact" | Medical claims | "A gentle, computed slope" with the real angles (23° / 20° at 24″) |
| `TrustBadges` | "Vet Approved" badge + `vet-approved.svg` | No veterinary endorsement exists | Badge and SVG deleted; three in-house badges remain |
| `hero-ramp.svg` | Floating "Vet Approved / Tested & certified 250 lb / 26° slope" cards baked into the hero image | Unverifiable claims in artwork; 250 lb wrong for the Compact | File deleted; replaced by original product renderings in `public/assets/product/` |
| `FAQ` | "94% of customers report…", "veterinarians recommend", "static-tested beyond 500 lbs", "2× safety margin" | Invented statistics | Spec-based answers; senior-dog question defers to the visitor's veterinarian |
| `FAQ` | "ships same business day… 2–5 business days… Canada and UK at checkout" | International shipping not set up | Policy values from `policy.ts`; continental US only |
| `ComparisonTable` | "PawGrip Pro vs. Cheap Knockoffs" with unverifiable competitor claims | Cannot assert what competitors' products do | Compact / Extended / Lifting / Jumping, with an honest-limitation row and a buyer's checklist |
| `Tiers` perks | "100-day money-back guarantee" | Policy is 30 days | `30-day money-back guarantee` (from `policy.ts`) |
| `TrustBlock` | "100-Day Trial", "covered for as long as you own it" | Wrong window; lifetime claim | 30-day trial; 12-month hardware warranty |
| `index.tsx` | "Lifetime hardware warranty" | No lifetime warranty exists | `WARRANTY_PRODUCT_LABEL` (12-month) |
| `Footer` | "Join 12,000+ owners", "Lifetime hardware warranty", dead social links | Invented customer count; false warranty term; links went nowhere | Removed; policy-sourced labels; links to real policy pages |
| `TetherUpsell` | "Crash-Tested Car Safety Tether" | "Crash-tested" overstated what the store can evidence (owner decision) | "Adjustable Car Safety Tether" — Shopify handle unchanged (`crash-tested-adjustable-car-safety-tether`) |
| `StickyHeader` | Hardcoded `$199 / $149` | Contradicted `offers.ts` | Live tier price + compare-at from the purchase context |
| Seeder hero copy | "rated by 2,800+ owners", "94% within 24 hours", "vet-approved", "Made in the USA", "100-day guarantee card" | Invented proof + unverifiable origin | Published specifications + the real 30-day/12-month policy |
| Seeder chews | "Vet Formulated", "formulated with veterinarians", "Made in the USA" | Unverifiable claims on a regulated category (product also unpublished) | "Advanced Hip & Joint Soft Chews", spec-only copy |
| Testimonials / VideoProof / UGCGallery | Entire sections | Placeholder narrative presented as real customers/video | `return null` behind `GATES` (asset-gate pattern in `src/lib/assets.ts`) |

## Deliberately kept (and why)

| Claim | Justification |
|---|---|
| `$79.99 / $139.99` compare-at | Real pricing decision; see "Approved price-display decision" above |
| "150 lb / 250 lb rated" | Published ratings for the two published sizes; confirm against the supplier spec sheet (LAUNCH_BLOCKERS #3) |
| "62″ / 70″ unfolded, 31″ / 35″ folded" | Published dimensions in the size finder and catalog |
| Slope table (22.8° / 20.1° at 24″) | Arithmetic on the published dimensions: `asin(height / length)` because the ramp is the hypotenuse |
| "rubber, non-slip feet", "textured deck", "side rails" | Published product features |
| "Ships within 1 business day (before 2pm), 2–5 business day delivery" | Store policy in `policy.ts`; confirm operationally (LAUNCH_BLOCKERS) |
