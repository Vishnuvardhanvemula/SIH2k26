'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { PlaybackControls } from './PlaybackControls';
import { MonoValue } from '@/components/shared/MonoValue';
import { Calendar } from 'lucide-react';

// Demo time range: August 2026 (30 days)
const RANGE_START = new Date('2026-08-01T00:00:00Z');
const RANGE_END = new Date('2026-08-31T23:59:59Z');
const RANGE_MS = RANGE_END.getTime() - RANGE_START.getTime();

// Advance time by this many minutes per second at 1× speed
const MINUTES_PER_SECOND = 60 * 6; // 6 hours / real second at 1×

export function TimelineScrubber() {
  const time = useConsoleStore((s) => s.time);
  const setTime = useConsoleStore((s) => s.setTime);
  const playback = useConsoleStore((s) => s.playback);
  const setPlayback = useConsoleStore((s) => s.setPlayback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Current position as fraction [0, 1]
  const currentMs = new Date(time).getTime() - RANGE_START.getTime();
  const fraction = Math.max(0, Math.min(1, currentMs / RANGE_MS));

  // Format current time for display
  const displayDate = new Date(time).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC',
  });
  const displayTime = new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
  });

  // Playback tick
  const tick = useCallback(() => {
    const current = new Date(time).getTime();
    const advance = MINUTES_PER_SECOND * playback.speed * 1000; // ms
    const next = Math.min(current + advance, RANGE_END.getTime());
    if (next >= RANGE_END.getTime()) {
      setPlayback({ isPlaying: false });
      setTime(RANGE_END.toISOString());
    } else {
      setTime(new Date(next).toISOString());
    }
  }, [time, playback.speed, setTime, setPlayback]);

  useEffect(() => {
    if (playback.isPlaying) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playback.isPlaying, tick]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = parseFloat(e.target.value) / 1000;
    const newTime = new Date(RANGE_START.getTime() + f * RANGE_MS);
    setTime(newTime.toISOString());
  };

  return (
    <GlassPanel className="h-full flex items-center px-4 gap-4 rounded-none border-l-0 border-r-0 border-b-0">
      {/* Date display */}
      <div className="flex items-center gap-2 shrink-0">
        <Calendar size={12} className="text-foam-dim" aria-hidden="true" />
        <div className="flex flex-col leading-none">
          <MonoValue value={displayDate} size="xs" color="foam" />
          <MonoValue value={displayTime} unit="UTC" size="xs" color="dim" />
        </div>
      </div>

      {/* Range labels */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-mono text-2xs text-foam-dim/50">
          {RANGE_START.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })}
        </span>
      </div>

      {/* Scrubber */}
      <div className="flex-1 relative h-full flex items-center">
        {/* Active window highlight */}
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded bg-biolume/20"
          style={{ width: `${fraction * 100}%` }}
          aria-hidden="true"
        />
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(fraction * 1000)}
          onChange={handleScrub}
          className="w-full h-1 rounded appearance-none cursor-pointer z-10 relative"
          style={{ accentColor: '#4CE0D2', background: 'rgba(28,92,107,0.3)' }}
          aria-label="Timeline position"
          aria-valuemin={0}
          aria-valuemax={1000}
          aria-valuenow={Math.round(fraction * 1000)}
          aria-valuetext={`${displayDate} ${displayTime} UTC`}
        />
      </div>

      {/* End date */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-mono text-2xs text-foam-dim/50">
          {RANGE_END.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' })}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-thermocline/25 shrink-0" />

      {/* Playback controls */}
      <PlaybackControls />

      {/* Demo badge */}
      <span className="font-mono text-2xs text-foam-dim/40 shrink-0 tracking-widest hidden lg:block">
        AUG 2026
      </span>
    </GlassPanel>
  );
}
