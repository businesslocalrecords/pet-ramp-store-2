# Public Assets

Static media served from `public/assets/` (referenced as absolute paths, e.g. `/assets/product/ramp-compact.svg`).

## Current files

| File | Purpose | Replace with |
|------|---------|-------------|
| `product/ramp-compact.svg` | Compact (62″) product rendering, white background | `ramp-compact.webp` — owner photo (~1200×800, white bg) |
| `product/ramp-extended.svg` | Extended (70″) product rendering, white background | `ramp-extended.webp` — owner photo (~1200×800, white bg) |
| `badges/30-day-guarantee.svg` | Guarantee badge (matches `POLICY.returnDays`) | Optional custom badge |
| `badges/free-shipping.svg` | Shipping badge | Optional custom badge |
| `badges/secure-checkout.svg` | Security badge | Optional custom badge |

Product renderings are **original SVG artwork** — deliberately NOT scraped from Chewy/PetSafe (copyright, the brief's own rule 5, and Merchant Center imagery checks). See `claims.md` for the recorded decision.

## Swapping in real media

1. Drop real files into `public/assets/`.
2. Update the path in `src/lib/assets.ts` (`ASSETS.product.*`) — one place, not per component.
3. For owner photography in the hero, populate `ASSETS.heroPhotos`; `HeroSection` prefers real photos and falls back to the renderings.
4. Gated sections (demo video, owner clips, reviews, founder note) live behind `GATES` in `src/lib/assets.ts` — flip the flag only when the real asset exists. See the asset-gate pattern documented at the top of that file.

## Recommended video specs (for the gated video sections)

- 15–30 seconds, 1080p, H.264, MP4
- Show a real dog walking up the ramp unassisted
- Keep it under 10 MB for mobile page speed
- Add captions — most of your CPC traffic will watch muted
