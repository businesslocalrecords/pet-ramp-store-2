# PawGrip Pro â€” Headless Shopify Landing Page

A high-conversion, single-product landing page for a foldable dog car ramp.
Built with **React 19 + Vite + Tailwind CSS v4**, powered by the **Shopify Storefront API** (headless â€” Shopify handles checkout).

## Sections

| # | Section | Purpose |
|---|---------|---------|
| 1 | `UrgencyBar` | Rotating social proof + countdown + promo code |
| 2 | `StickyHeader` | Persistent logo + price + buy CTA on scroll |
| 3 | `HeroSection` | Headline, price anchor, live stock, primary CTA |
| 4 | `VideoProof` | Custom video player with controls + proof stats |
| 5 | `SizeGuide` | Two-tier selector with geometric angle diagrams |
| 6 | `ComparisonTable` | Ramp vs. jumping vs. lifting |
| 7 | `Testimonials` | Verified review cards + aggregate rating |
| 8 | `BundleSelector` | 3-tier offer structure (AOV optimization) |
| 9 | `TrustBadges` | Guarantee / shipping / vet / security badges |
| 10 | `ShippingReturns` | 4-step process + policy details |
| 11 | `Faq` | Accordion + FAQPage JSON-LD for SEO |
| 12 | `Footer` | Final CTA + links + social |
| 13 | `StickyMobileCTA` | Mobile cart bar with checkout link |

## Quick Start

```bash
npm install
cp .env.example .env.local     # then fill in your Shopify credentials
npm run shopify:seed:dry       # preview the catalog (no credentials needed)
npm run shopify:seed           # create the catalog in Shopifynpm run dev                    # http://localhost:5173
npm run build                  # production bundle in dist/
npm run lint                   # oxlint
```

## Shopify Setup

### 1. The three credentials (this trips everyone up)

| Variable | Format | Used by | Can create products? |
|----------|--------|---------|---------------------|
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | 32-char hex ("public access token") | React frontend | No â€” read published products, write carts |
| `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` | ~32 char / `shpss_â€¦` | `scripts/shopify-seed.mjs` | Yes |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | `shpat_â€¦` | `scripts/shopify-seed.mjs` | Yes |

**The Storefront and Admin token formats are not interchangeable.** An `shpat_`
Admin token sent to the Storefront API returns `401`, which breaks every product
query on the site. Storefront tokens are hex, public by design, and safe to ship
in browser JS.

Currently in use for `vynils-galor.myshopify.com`:

| Variable | Value |
|----------|-------|
| `VITE_SHOPIFY_STOREFRONT_DOMAIN` | `vynils-galor.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | `055c1ac160fae23c3f43f80b9bfceee6` |
| `SHOPIFY_CLIENT_ID` | `7a3868cb0531481a4d1c51356b478e8b` |
| `SHOPIFY_CLIENT_SECRET` | *(secret â€” in `.env.local` only)* |

The storefront app must also grant `unauthenticated_read_product_inventory`
for live stock counts; without it the seeder and site still work, and stock
messaging stays hidden rather than erroring.

### 2. Run the seeder

```bash
npm run shopify:seed:dry    # preview, no credentials needed, no writes
npm run shopify:seed        # create or update the catalog
npm run shopify:verify      # re-check what exists in the store
npm run shopify:purge -- --yes   # DELETE every non-catalog product
```

**The seeder is idempotent.** Because the Admin app lacks `read_products`, it
remembers the product IDs it created in `scripts/seed-output.json` and uses
`productUpdate` on those instead of `productCreate`. Variants are only created
once per product, so re-running cannot duplicate products or variants. To make
it also detect products created outside this script, grant `read_products` to
the Admin app.

### 2. Create the catalog

```bash
npm run shopify:seed:dry    # preview, no credentials needed, no writes
npm run shopify:seed        # create everything
npm run shopify:verify      # re-check what exists in the store
npm run shopify:purge       # list non-catalog products (dry, deletes nothing)
npm run shopify:purge -- --yes   # DELETE every non-catalog product
```

The seeder is idempotent â€” it matches on handle, so running it twice updates
rather than duplicates. Created IDs land in `scripts/seed-output.json`.

**`--purge` is for reusing a store that already has junk in it.** It deletes
everything that is not part of the PawGrip catalog â€” the default snowboard /
gift-card demo products, dead vinyl inventory, anything â€” and keeps the Shopify
`gift-card` product, which is not API-deletable and is ignored by Shopping ads.
It prints the exact list first and requires `--yes` before deleting anything.

### 3. Products created

| Handle | Title | Price | Compare-at | Tag | Role |
|--------|-------|-------|-----------|-----|------|
| `premium-foldable-dog-car-ramp` | The Premium Foldable Dog Car Ramp | $79.99 | $139.99 | `hero-product` | Main funnel product |
| `heavy-duty-traction-mat-upgrade-2-pack` | Heavy-Duty Traction Mat Upgrade (2-Pack) | $15.00 | $30.00 | `order-bump` | Pre-checkout bump |
| `crash-tested-adjustable-car-safety-tether` | Crash-Tested Adjustable Car Safety Tether | $19.99 | $35.00 | `post-purchase-upsell` | Cart upsell |
| `orthopedic-foam-bed-steps` | Orthopedic Foam Bed Steps | $65.00 | $99.00 | â€” | Home Mobility |
| `advanced-hip-joint-soft-chews` | Advanced Hip & Joint Soft Chews | $29.99 | $45.00 | â€” | Joint Care (add Subscribe & Save) |

Plus collections: **Car Mobility**, **Home Mobility**, **Joint Care**, and a
hidden **Bumps** collection.

**Pricing rationale:** the reference product (PetSafe Happy Ride) has an MSRP
of $59.99. $79.99 / $139.99 (43% off) sits ~33% above that â€” defensible with
the PawGrip Tread, 100-day guarantee and lifetime warranty â€” while leaving a
~52% gross margin on the hero for ad spend.

### 4. Before running PMax / Shopping ads

The seeder cannot do these for you:

- **Delete the default demo products.** Shopify seeds new stores with 15
  snowboard/gift-card products. Unrelated inventory causes Merchant Center
  disapproval.
- **Upload product images** with a pure white (`#FFFFFF`) background.
  GMC requires an image on every product. The hero's second image should be
  an action shot of a dog walking up the ramp.
- **Add Subscribe & Save** to `advanced-hip-joint-soft-chews` (Admin â†’
  Products â†’ the product â†’ Selling plans). The Admin API requires an app-owned
  selling plan group, which this script deliberately does not attempt.
- **Fill in the business address and phone** in `src/components/Footer.tsx`
  (currently `REPLACE_WITH_â€¦` placeholders, flagged with a visible banner).


## Analytics (CPC Campaigns)

Conversion events are wired in `src/lib/analytics.ts` and fire automatically:

| Event | Fires when |
|-------|-----------|
| `view_item` | Hero mounts (PageView on load) |
| `add_to_cart` | Any add to cart |
| `begin_checkout` | Checkout redirect |
| `purchase` | Thank-you page (call `trackPurchase` manually) |

Supported platforms: **Google Analytics 4**, **Google Ads**, **Meta Pixel**.
Set the matching IDs in `.env` â€” `initAnalytics()` in `src/main.tsx` loads the scripts.

## Assets

Placeholders live in `public/assets/` and are generated SVGs so the site renders
before photography is ready.

| File | Replace with |
|------|--------------|
| `assets/hero-ramp.svg` | `hero-ramp.webp` â€” hero product/lifestyle shot (~1920Ã—1080) |
| `assets/poster-placeholder.svg` | Video poster frame |
| `assets/demo-video.mp4` | 15â€“30s demo clip (~10 MB max, H.264) |
| `assets/badges/*.svg` | Optional custom trust badges |

To swap in real media, replace the `src` strings in `HeroSection.tsx` and `VideoProof.tsx`.

## Deployment

Builds to static files in `dist/` â€” deploy anywhere:

- **Netlify / Vercel** â€” connect the repo, build command `npm run build`, output `dist/`
- Add environment variables in the host dashboard, not the repo.

Point your Google Ads / Meta campaign landing page URL at the deployed domain.

## Structure

```
src/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ UrgencyBar.tsx          scarcity + countdown
â”‚   â”œâ”€â”€ StickyHeader.tsx        scroll-triggered buy bar
â”‚   â”œâ”€â”€ HeroSection.tsx         primary conversion block
â”‚   â”œâ”€â”€ VideoProof.tsx          custom video player
â”‚   â”œâ”€â”€ SizeGuide.tsx           size selector + angle diagrams
â”‚   â”œâ”€â”€ ComparisonTable.tsx     alternative comparison
â”‚   â”œâ”€â”€ Testimonials.tsx        review cards
â”‚   â”œâ”€â”€ BundleSelector.tsx      3-tier bundle offers
â”‚   â”œâ”€â”€ TrustBadges.tsx         guarantee badges + payment icons
â”‚   â”œâ”€â”€ ShippingReturns.tsx     logistics steps
â”‚   â”œâ”€â”€ Faq.tsx                 accordion + FAQ schema
â”‚   â”œâ”€â”€ Footer.tsx              final CTA + links
â”‚   â””â”€â”€ StickyMobileCTA.tsx     mobile cart bar
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ shopify.ts              Storefront API (products + cart)
â”‚   â”œâ”€â”€ cart.tsx                CartProvider
â”‚   â”œâ”€â”€ cart-context.ts         cart context + useCart hook
â”‚   â”œâ”€â”€ purchase-provider.tsx   shared purchase flow (one buy() for both CTAs)
â”‚   â”œâ”€â”€ purchase-context.ts     purchase context + usePurchase hook
â”‚   â”œâ”€â”€ offers.ts               tiers, prices, product handles, collections
â”‚   â”œâ”€â”€ dki.ts                  DKI params + attribution forwarding
â”‚   â””â”€â”€ analytics.ts            GA4 / Google Ads / Meta Pixel + dataLayer
â””â”€â”€ scripts/
    â”œâ”€â”€ shopify-seed.mjs        Admin API catalog seeder
    â””â”€â”€ seed-output.json        generated manifest of created IDs
```
