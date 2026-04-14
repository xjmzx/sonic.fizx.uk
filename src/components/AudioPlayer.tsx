import React, { useRef, useState, useCallback, useEffect } from 'react';
import { formatDuration } from '@/hooks/useAudioFeed';

interface AudioPlayerProps {
  url: string;
  mime?: string;
}

export function AudioPlayer({ url, mime }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      setLoading(true);
      try { await el.play(); } catch { setErrored(true); }
      setLoading(false);
    }
  }, [playing]);

  // Seek on progress bar click
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
  }, [duration]);

  // Keyboard: space to play/pause when focused
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
  }, [toggle]);

  // Stop on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  if (errored) {
    return (
      <p className="text-[10px] font-mono text-red-400/60 py-1">
        Playback unavailable — <a href={url} className="underline hover:text-red-300" target="_blank" rel="noopener">open directly</a>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">

        {/* Play / pause button */}
        <button
          onClick={toggle}
          onKeyDown={handleKey}
          aria-label={playing ? 'Pause' : 'Play'}
          disabled={loading}
          className="shrink-0 w-8 h-8 flex items-center justify-center border border-primary/60 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          ) : playing ? (
            // Pause icon
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="4" height="10" rx="1"/>
              <rect x="7" y="1" width="4" height="10" rx="1"/>
            </svg>
          ) : (
            // Play icon
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1.5l9 4.5-9 4.5V1.5z"/>
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 h-1.5 bg-border/40 cursor-pointer group relative"
        >
          <div
            className="h-full bg-primary transition-none"
            style={{ width: `${pct}%` }}
          />
          {/* Scrub thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Time */}
        <span className="shrink-0 text-[10px] font-mono text-muted-foreground tabular-nums">
          {formatDuration(currentTime)}{duration > 0 ? ` / ${formatDuration(duration)}` : ''}
        </span>
      </div>

      {/* Native audio element (hidden) */}
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        onError={() => setErrored(true)}
        {...(mime ? { type: mime } : {})}
      />
    </div>
  );
}
