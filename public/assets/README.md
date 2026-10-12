# Public Assets

Static media served from `public/assets/` (referenced as absolute paths, e.g. `/assets/hero-ramp.svg`).

## Current files (generated SVG placeholders)

| File | Purpose | Replace with |
|------|---------|-------------|
| `hero-ramp.svg` | Hero product/lifestyle illustration | `hero-ramp.webp` (~1920×1080, < 250 KB) |
| `poster-placeholder.svg` | Video poster frame | First frame of your demo clip |
| `demo-video.mp4` | Demo video for `VideoProof` | 15–30s H.264 clip (~10 MB max) |
| `badges/30-day-guarantee.svg` | Guarantee badge | Optional custom badge |
| `badges/free-shipping.svg` | Shipping badge | Optional custom badge |
| `badges/vet-approved.svg` | Vet endorsement badge | Optional custom badge |
| `badges/secure-checkout.svg` | Security badge | Optional custom badge |

The SVG placeholders are illustration-quality and render instantly with zero
network cost, so the store is fully presentable before photography is shot.

## Swapping in real media

1. Drop real files into `public/assets/`.
2. Update the `src` in `src/components/HeroSection.tsx` (line ~46).
3. Update `src` and `poster` in `src/components/VideoProof.tsx`.

## Recommended video specs

- 15–30 seconds, 1080p, H.264, MP4
- Show a real dog walking up the ramp unassisted
- Keep it under 10 MB for mobile page speed
- Add captions — most of your CPC traffic will watch muted
