import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

/**
 * Video proof section — product demo with custom player controls.
 * Features: poster, play/pause overlay, progress bar, mute toggle, fullscreen.
 */
export const VideoProof: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);

  // Track progress for custom progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!started) {
      setStarted(true);
      video.play();
      setPlaying(true);
    } else if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  return (
    <section id="video" className="py-20 lg:py-24 bg-stone-900 text-stone-100 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Play className="w-3.5 h-3.5 fill-amber-400" /> See It Work
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Watch Rocky Go From
            <br />
            <span className="text-amber-400">Hesitant to Hop-In</span>
          </h2>
          <p className="mt-4 text-stone-400 text-lg">
            An 11-year-old Labrador with arthritis. He used to refuse to get in the car.
            This is his first week on the PawGrip Pro.
          </p>
        </div>

        {/* Video player */}
        <div className="relative group rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-stone-800">
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            muted={muted}
            loop
            playsInline
            preload="metadata"
            poster="/assets/poster-placeholder.svg"
            src="/assets/demo-video.mp4"
            onClick={togglePlay}
          />

          {/* Big play overlay (before first play) */}
          {!started && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/30"
              aria-label="Play demo video"
            >
              <span className="relative flex items-center justify-center">
                <span className="absolute w-24 h-24 rounded-full bg-white/20 animate-ping" />
                <span className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                  <Play className="w-9 h-9 text-stone-900 fill-stone-900 ml-1" />
                </span>
              </span>
            </button>
          )}

          {/* Pause overlay (during playback) */}
          {started && !playing && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
              aria-label="Resume video"
            >
              <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-7 h-7 text-stone-900 fill-stone-900 ml-1" />
              </span>
            </button>
          )}

          {/* Controls bar */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Progress bar */}
            <div
              className="w-full h-1.5 bg-white/25 rounded-full cursor-pointer mb-3 group/progress"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-amber-500 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-amber-500 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-amber-400 transition-colors" aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                </button>
                <button onClick={toggleMute} className="text-white hover:text-amber-400 transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <span className="text-xs text-white/70 font-medium">Rocky's first week &middot; 0:32</span>
              </div>
              <button onClick={toggleFullscreen} className="text-white hover:text-amber-400 transition-colors" aria-label="Fullscreen">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video proof points */}
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {[
            { k: '2 min 15 s', v: 'Average time for a dog to walk up unassisted' },
            { k: '0 lbs', v: 'Lifting required — your back stays healthy' },
            { k: '26° slope', v: 'Gentle angle vets recommend for joint safety' },
          ].map((item, i) => (
            <div key={i} className="text-center p-5 rounded-2xl bg-stone-800/60 border border-stone-800">
              <div className="text-2xl font-extrabold text-amber-400">{item.k}</div>
              <div className="mt-1 text-sm text-stone-400">{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};