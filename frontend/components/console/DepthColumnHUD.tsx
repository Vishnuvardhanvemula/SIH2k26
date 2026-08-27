'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Thermometer, Droplets } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { useConsoleStore } from '@/lib/store/useConsoleStore';

interface ColumnData {
  depths: number[];
  values: number[];
  colorRange: [number, number];
  unit: string;
}

const DEPTH_PRESETS = [0, 50, 100, 200, 500, 1000, 2000];

/** Interpolate column values at the exact depth the slider is at */
function interpolateValue(depths: number[], values: number[], targetDepth: number): number {
  if (depths.length === 0) return 0;
  if (targetDepth <= depths[0]) return values[0];
  if (targetDepth >= depths[depths.length - 1]) return values[values.length - 1];
  for (let i = 0; i < depths.length - 1; i++) {
    if (targetDepth >= depths[i] && targetDepth <= depths[i + 1]) {
      const t = (targetDepth - depths[i]) / (depths[i + 1] - depths[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[0];
}

export function DepthColumnHUD() {
  const focusLat      = useConsoleStore((s) => s.focusLat);
  const focusLon      = useConsoleStore((s) => s.focusLon);
  const depth         = useConsoleStore((s) => s.depth);
  const variable      = useConsoleStore((s) => s.variable);
  const setDepth      = useConsoleStore((s) => s.setDepth);
  const setVariable   = useConsoleStore((s) => s.setVariable);
  const clearFocus    = useConsoleStore((s) => s.clearFocusPoint);
  const inspectorOpen = useConsoleStore((s) => s.inspectorOpen);

  const [colData, setColData] = useState<ColumnData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch column data whenever focus or variable changes
  useEffect(() => {
    if (focusLat === null || focusLon === null) {
      setColData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/column?lat=${focusLat}&lon=${focusLon}&variable=${variable}`)
      .then((r) => r.json())
      .then((d: ColumnData) => {
        setColData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [focusLat, focusLon, variable]);

  const currentValue = colData
    ? interpolateValue(colData.depths, colData.values, depth)
    : null;

  const setMode       = useConsoleStore((s) => s.setMode);

  const handleClose = useCallback(() => {
    clearFocus();
    setDepth(0);
    setMode('surface');
  }, [clearFocus, setDepth, setMode]);

  if (inspectorOpen || focusLat === null || focusLon === null) return null;

  const formatCoord = (v: number, pos: 'N' | 'S' | 'E' | 'W') =>
    `${Math.abs(v).toFixed(2)}°${pos}`;

  const latStr = focusLat >= 0
    ? formatCoord(focusLat, 'N') : formatCoord(focusLat, 'S');
  const lonStr = focusLon >= 0
    ? formatCoord(focusLon, 'E') : formatCoord(focusLon, 'W');

  return (
    <GlassPanel
      strong
      className="w-60 pointer-events-auto flex flex-col gap-3 p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-2xs text-biolume tracking-widest uppercase mb-0.5">
            Depth Profile
          </div>
          <div className="font-mono text-xs text-foam">
            📍 {latStr}  {lonStr}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center rounded text-foam-dim hover:text-foam hover:bg-thermocline/20 transition-colors focus:outline-none"
          aria-label="Close depth column"
        >
          <X size={13} />
        </button>
      </div>

      {/* Variable toggle */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setVariable('temperature')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-2xs font-mono uppercase tracking-widest transition-all ${
            variable === 'temperature'
              ? 'bg-biolume/15 text-biolume border border-biolume/30'
              : 'text-foam-dim border border-thermocline/20 hover:text-foam hover:border-thermocline/40'
          }`}
        >
          <Thermometer size={11} />
          Temp
        </button>
        <button
          onClick={() => setVariable('salinity')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-2xs font-mono uppercase tracking-widest transition-all ${
            variable === 'salinity'
              ? 'bg-instrument-amber/15 text-instrument-amber border border-instrument-amber/30'
              : 'text-foam-dim border border-thermocline/20 hover:text-foam hover:border-thermocline/40'
          }`}
        >
          <Droplets size={11} />
          Salinity
        </button>
      </div>

      {/* Depth slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xs text-foam-dim uppercase tracking-widest">Depth</span>
          <span className="font-mono text-xs text-foam font-semibold">{depth} m</span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          step={25}
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          className="w-full accent-biolume h-1 rounded-full cursor-pointer"
          aria-label="Depth slider"
          style={{ direction: 'ltr' }}
        />
        {/* Quick preset buttons */}
        <div className="flex gap-1 flex-wrap">
          {DEPTH_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className={`px-1.5 py-0.5 rounded text-2xs font-mono transition-all ${
                depth === d
                  ? 'bg-biolume/20 text-biolume border border-biolume/30'
                  : 'text-foam-dim border border-thermocline/15 hover:text-foam'
              }`}
            >
              {d === 0 ? 'SFC' : `${d}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Live readout */}
      <div className="border border-thermocline/20 rounded bg-deep-panel/60 px-3 py-2.5 flex flex-col gap-1">
        {loading ? (
          <span className="font-mono text-2xs text-foam-dim animate-pulse">Loading profile…</span>
        ) : colData && currentValue !== null ? (
          <>
            <div className="flex justify-between items-center">
              <span className="font-mono text-2xs text-foam-dim uppercase tracking-widest">
                {variable === 'temperature' ? 'Temperature' : 'Salinity'} @ {depth}m
              </span>
            </div>
            <div className="font-mono text-lg font-semibold text-biolume leading-none">
              {currentValue.toFixed(2)}
              <span className="text-xs text-foam-dim ml-1">{colData.unit}</span>
            </div>
            <div className="flex justify-between font-mono text-2xs text-foam-dim mt-1">
              <span>Min {colData.colorRange[0].toFixed(1)}</span>
              <span>Max {colData.colorRange[1].toFixed(1)}</span>
            </div>
          </>
        ) : (
          <span className="font-mono text-2xs text-foam-dim">No data</span>
        )}
      </div>

      {/* Depth profile mini-chart: coloured bar */}
      {colData && (
        <div className="flex gap-px h-3 w-full rounded overflow-hidden">
          {colData.values.map((v, i) => {
            const t = (v - colData.colorRange[0]) / (colData.colorRange[1] - colData.colorRange[0] + 0.001);
            const hue = variable === 'temperature'
              ? Math.round(240 - t * 200)   // blue→red thermal
              : Math.round(280 - t * 120);   // purple→teal haline
            return (
              <div
                key={i}
                className="flex-1"
                style={{ background: `hsl(${hue}, 80%, 55%)` }}
                title={`${colData.depths[i]}m: ${v.toFixed(1)}${colData.unit}`}
              />
            );
          })}
        </div>
      )}

      <div className="font-mono text-2xs text-foam-dim/50 text-center leading-tight">
        Scroll 3D column to compare depths
      </div>
    </GlassPanel>
  );
}
