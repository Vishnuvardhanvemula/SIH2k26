'use client';

import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { MonoValue } from '@/components/shared/MonoValue';

/**
 * LiveReadout — real-time lat/lon/depth/UTC display.
 * Updated from Cesium cursor position. Falls back to stable demo values.
 */
export function LiveReadout() {
  const cursorLat = useConsoleStore((s) => s.cursorLat);
  const cursorLon = useConsoleStore((s) => s.cursorLon);
  const depth = useConsoleStore((s) => s.depth);
  const time = useConsoleStore((s) => s.time);

  // Format UTC time
  const utcTime = new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  });

  const displayLat = cursorLat !== null ? cursorLat.toFixed(2) : '10.00';
  const displayLon = cursorLon !== null ? cursorLon.toFixed(2) : '80.00';
  const latDir = parseFloat(displayLat) >= 0 ? 'N' : 'S';
  const lonDir = parseFloat(displayLon) >= 0 ? 'E' : 'W';

  return (
    <div
      className="hidden md:flex items-center gap-4"
      aria-label="Live position and time readout"
      role="status"
      aria-live="polite"
    >
      {/* Coordinates */}
      <div className="flex items-center gap-1">
        <MonoValue
          value={`${Math.abs(parseFloat(displayLat)).toFixed(2)}°${latDir}`}
          size="sm"
          color="biolume"
          aria-label={`Latitude: ${displayLat} degrees`}
        />
        <span className="text-thermocline text-xs">·</span>
        <MonoValue
          value={`${Math.abs(parseFloat(displayLon)).toFixed(2)}°${lonDir}`}
          size="sm"
          color="biolume"
          aria-label={`Longitude: ${displayLon} degrees`}
        />
      </div>

      {/* Divider */}
      <span className="w-px h-3 bg-thermocline/50" />

      {/* Depth */}
      <MonoValue
        value={depth === 0 ? 'SURFACE' : depth.toFixed(0)}
        unit={depth === 0 ? '' : 'm'}
        size="sm"
        color="amber"
        aria-label={`Current depth: ${depth === 0 ? 'surface' : depth + ' meters'}`}
      />

      {/* Divider */}
      <span className="w-px h-3 bg-thermocline/50" />

      {/* Time */}
      <MonoValue
        value={utcTime}
        unit="UTC"
        size="sm"
        color="dim"
        aria-label={`Time: ${utcTime} UTC`}
      />
    </div>
  );
}
