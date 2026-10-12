import React, { useRef, useState } from 'react';
import { Play, VolumeX, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { GATES } from '../lib/assets';

/**
 * One slot in the carousel.
 *
 * NOTE FOR LAUNCH: these are content SLOTS, not finished UGC. Each slot
 * describes the real clip that belongs there (owner demo, size demo, etc.).
 * Drop the real vertical clips into /assets/ugc/ and fill in the fields
 * below with genuine customer content before running paid traffic.
 * Fabricated usernames or scripted "reviews" would violate ad-network
 * policy and are intentionally not included.
 *
 * GATED: renders nothing until GATES.ugcGallery is enabled.
 */
interface UgcClip {
  id: string;
  /** Slot purpose — describes which real clip belongs here. */
  slotLabel: string;
  /** Filename in /assets/ugc/ once you add the real clip. */
  videoFile: string;
  /** Real attribution, e.g. the customer's handle. Leave blank until you have it. */
  credit?: string;
  /** Poster frame. */
  poster: string;
}

const CLIPS: UgcClip[] = [
  {
    id: 'slot-1',
    slotLabel: 'Owner demo — parking lot',
    videoFile: '/assets/ugc/owner-demo-1.mp4',
    poster: '/assets/poster-placeholder.svg',
    credit: '',
  },
  {
    id: 'slot-2',
    slotLabel: 'Size demo — 90 lb shepherd',
    videoFile: '/assets/ugc/size-demo-2.mp4',
    poster: '/assets/poster-placeholder.svg',
    credit: '',
  },
  {
    id: 'slot-3',
    slotLabel: 'Senior dog, first try',
    videoFile: '/assets/ugc/senior-dog-3.mp4',
    poster: '/assets/poster-placeholder.svg',
    credit: '',
  },
  {
    id: 'slot-4',
    slotLabel: 'Fold + storage demo',
    videoFile: '/assets/ugc/fold-storage-4.mp4',
    poster: '/assets/poster-placeholder.svg',
    credit: '',
  },
  {
    id: 'slot-5',
    slotLabel: 'SUV height walkthrough',
    videoFile: '/assets/ugc/suv-height-5.mp4',
    poster: '/assets/poster-placeholder.svg',
    credit: '',
  },
];

/**
 * Shoppable UGC carousel — a snap-scrolling row of vertical, social-style
 * video slots styled like TikTok / Reels.
 */
export const UGCGallery: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  // Gate after the hooks so hook order is stable across renders.
  if (!GATES.ugcGallery) return null;

  return (
    <section id="ugc" className="scroll-mt-24">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-stone-600">
            <Camera className="h-3.5 w-3.5" aria-hidden="true" /> Real owners
          </span>
          <h2 className="mt-3 text-2xl font-bold text-stone-900 sm:text-3xl">
            Watch Dogs Use It, Unscripted
          </h2>
          <p className="mt-2 max-w-lg text-stone-600">
            Vertical clips sent in by owners. Swipe through to see the ramp in
            real driveways, with real dogs.
          </p>
        </div>

        {/* Desktop arrows */}
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Previous clips"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-900/10 transition-colors hover:bg-stone-50"
          >
            <ChevronLeft className="h-5 w-5 text-stone-700" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="More clips"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-900/10 transition-colors hover:bg-stone-50"
          >
            <ChevronRight className="h-5 w-5 text-stone-700" />
          </button>
        </div>
      </header>

      {/* Snap-scrolling carousel */}
      <div
        ref={scrollerRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {CLIPS.map((clip) => {
          const isPlaying = playingId === clip.id;
          return (
            <figure
              key={clip.id}
              className="relative w-[68%] shrink-0 snap-start overflow-hidden rounded-3xl bg-stone-900 ring-1 ring-gray-900/10 sm:w-[42%] md:w-[30%] lg:w-[23%]"
            >
              {/* Vertical 9:16 frame */}
              <div className="aspect-[9/16]">
                <video
                  className="h-full w-full object-cover"
                  src={clip.videoFile}
                  poster={clip.poster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onClick={() => setPlayingId(isPlaying ? null : clip.id)}
                />
              </div>

              {/* Play affordance */}
              {!isPlaying && (
                <button
                  onClick={() => setPlayingId(clip.id)}
                  aria-label={`Play clip: ${clip.slotLabel}`}
                  className="absolute inset-0 flex items-center justify-center bg-stone-900/25 transition-colors hover:bg-stone-900/15"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30">
                    <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
                  </span>
                </button>
              )}

              {/* Social-style overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/85 via-stone-900/40 to-transparent p-4">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{clip.slotLabel}</p>
                    {clip.credit ? (
                      <p className="truncate text-[11px] text-white/70">@{clip.credit}</p>
                    ) : (
                      <p className="text-[11px] text-white/50">Awaiting owner clip</p>
                    )}
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-md">
                    <VolumeX className="h-3 w-3" aria-hidden="true" />
                    Muted
                  </span>
                </div>
              </div>

              {/* Slot badge (top) */}
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur-md">
                UGC
              </span>
            </figure>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-stone-500">
        Swipe to browse. Clips are muted by default &mdash; tap one to enable sound.
      </p>
    </section>
  );
};