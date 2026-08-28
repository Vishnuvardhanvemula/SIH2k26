'use client';

import { MonoValue } from '@/components/shared/MonoValue';
import type { MatchupResponse } from '@/lib/api/types';

interface ModelVsObservationTableProps {
  matchup: MatchupResponse;
}

const DELTA_THRESHOLD_NOTABLE = 0.3;   // amber
const DELTA_THRESHOLD_CRITICAL = 0.5;  // coral

function getDeltaColor(delta: number): 'amber' | 'coral' | 'dim' {
  const abs = Math.abs(delta);
  if (abs >= DELTA_THRESHOLD_CRITICAL) return 'coral';
  if (abs >= DELTA_THRESHOLD_NOTABLE) return 'amber';
  return 'dim';
}

// Show only a representative subset for readability
const DISPLAY_DEPTHS = [0, 50, 100, 200, 300, 500, 700, 1000];

export function ModelVsObservationTable({ matchup }: ModelVsObservationTableProps) {
  const { depths, observed, model, delta, unit } = matchup;

  const rows = DISPLAY_DEPTHS
    .map((targetDepth) => {
      const idx = depths.reduce((best, d, i) =>
        Math.abs(d - targetDepth) < Math.abs(depths[best] - targetDepth) ? i : best,
        0
      );
      return {
        depth: depths[idx],
        obs: observed[idx],
        mod: model[idx],
        dlt: delta[idx],
      };
    })
    .filter((_, i, arr) => arr.findIndex((r) => r.depth === arr[i].depth) === i); // deduplicate

  const maxAbsDelta = Math.max(...rows.map((r) => Math.abs(r.dlt)));

  return (
    <div role="region" aria-label="Model vs observation comparison table">
      <p className="label-ui mb-2">MODEL — OBSERVATION MATCHUP</p>

      <div className="overflow-hidden rounded border border-thermocline/25 bg-deep-panel/40 shadow-inner">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-0 bg-thermocline/10 border-b border-thermocline/25">
          {['DEPTH', 'OBS', 'MODEL', 'Δ'].map((h) => (
            <div key={h} className="px-2 py-1.5 text-center">
              <span className="font-mono text-2xs text-foam-dim tracking-widest">{h}</span>
            </div>
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-thermocline/15">
          {rows.map((row) => {
            const deltaColor = getDeltaColor(row.dlt);
            const isSignificant = Math.abs(row.dlt) >= DELTA_THRESHOLD_NOTABLE;

            return (
              <div
                key={row.depth}
                className={`grid grid-cols-4 gap-0 transition-colors ${
                  isSignificant ? 'bg-instrument-amber/5' : 'hover:bg-thermocline/5'
                }`}
              >
                {/* Depth */}
                <div className="px-2 py-1.5 text-center">
                  <MonoValue
                    value={row.depth === 0 ? 'SFC' : row.depth.toFixed(0)}
                    unit={row.depth === 0 ? '' : 'm'}
                    size="xs"
                    color="dim"
                  />
                </div>

                {/* Observed */}
                <div className="px-2 py-1.5 text-center">
                  <MonoValue
                    value={row.obs.toFixed(2)}
                    size="xs"
                    color="foam"
                    aria-label={`Observed: ${row.obs.toFixed(2)} ${unit}`}
                  />
                </div>

                {/* Model */}
                <div className="px-2 py-1.5 text-center">
                  <MonoValue
                    value={row.mod.toFixed(2)}
                    size="xs"
                    color="dim"
                    aria-label={`Model: ${row.mod.toFixed(2)} ${unit}`}
                  />
                </div>

                {/* Delta */}
                <div className="px-2 py-1.5 text-center">
                  <MonoValue
                    value={`${row.dlt >= 0 ? '+' : ''}${row.dlt.toFixed(2)}`}
                    size="xs"
                    color={deltaColor}
                    aria-label={`Delta: ${row.dlt >= 0 ? '+' : ''}${row.dlt.toFixed(2)} ${unit}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: unit + max delta */}
        <div className="px-2 py-1.5 border-t border-thermocline/25 bg-thermocline/5 flex justify-between">
          <span className="font-mono text-2xs text-foam-dim/50">unit: {unit}</span>
          <span className={`font-mono text-2xs ${getDeltaColor(maxAbsDelta) === 'coral' ? 'text-coral-delta' : 'text-instrument-amber'}`}>
            MAX Δ: {maxAbsDelta >= 0 ? '+' : ''}{maxAbsDelta.toFixed(2)} {unit}
          </span>
        </div>
      </div>

      {/* Status copy */}
      <p className="font-mono text-2xs text-foam-dim/60 mt-2 tracking-wide">
        {maxAbsDelta >= DELTA_THRESHOLD_CRITICAL
          ? '⚠ MODEL–OBSERVATION DELTA EXCEEDS THRESHOLD'
          : `MODEL–OBSERVATION DELTA: +${matchup.delta.slice(0, 5).map(d => d.toFixed(2)).join(', ')} ${unit}`
        }
      </p>
    </div>
  );
}
