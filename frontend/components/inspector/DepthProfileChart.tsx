'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import type { ProfileResponse } from '@/lib/api/types';

interface DepthProfileChartProps {
  profile: ProfileResponse;
}

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-deep-panel/95 border border-thermocline/40 rounded px-2 py-1.5">
      <p className="font-mono text-2xs text-foam-dim mb-1">— {label} m</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono text-2xs" style={{ color: p.color }}>
          {p.dataKey === 'temperature' ? 'T' : 'S'}: {p.value.toFixed(2)}{' '}
          {p.dataKey === 'temperature' ? '°C' : 'PSU'}
        </p>
      ))}
    </div>
  );
};

export function DepthProfileChart({ profile }: DepthProfileChartProps) {
  const depth = useConsoleStore((s) => s.depth);

  // Build chart data: depth on Y axis (inverted), T/S on X
  const data = profile.depths.map((d, i) => ({
    depth: d,
    temperature: profile.temperature[i],
    salinity: profile.salinity[i],
  }));

  return (
    <div role="img" aria-label={`Depth profile for float ${profile.floatId}`}>
      <p className="label-ui mb-2">DEPTH PROFILE — T/S</p>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
        >
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(28,92,107,0.25)" />

          {/* Depth axis (Y, inverted = deeper at bottom) */}
          <YAxis
            dataKey="depth"
            type="number"
            domain={[0, Math.max(...profile.depths)]}
            reversed
            tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#8FA5AC' }}
            tickFormatter={(v) => (v === 0 ? 'SFC' : `${v}m`)}
            width={38}
            label={{
              value: 'm',
              position: 'insideTopLeft',
              offset: -2,
              fontSize: 9,
              fill: '#8FA5AC',
              fontFamily: 'IBM Plex Mono',
            }}
          />

          {/* Temperature X axis (top) */}
          <XAxis
            dataKey="temperature"
            type="number"
            xAxisId="temp"
            orientation="top"
            domain={['auto', 'auto']}
            tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#4CE0D2' }}
            tickFormatter={(v) => `${v.toFixed(0)}°`}
          />

          {/* Salinity X axis (bottom) */}
          <XAxis
            dataKey="salinity"
            type="number"
            xAxisId="sal"
            orientation="bottom"
            domain={['auto', 'auto']}
            tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#E8A33D' }}
            tickFormatter={(v) => `${v.toFixed(1)}`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Current depth reference line */}
          <ReferenceLine
            y={depth}
            stroke="rgba(76,224,210,0.5)"
            strokeDasharray="4 2"
            label={{
              value: `▶ ${depth}m`,
              fontSize: 8,
              fill: '#4CE0D2',
              fontFamily: 'IBM Plex Mono',
              position: 'right',
            }}
          />

          {/* Temperature line */}
          <Line
            dataKey="temperature"
            xAxisId="temp"
            type="monotone"
            stroke="#4CE0D2"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: '#4CE0D2' }}
          />

          {/* Salinity line */}
          <Line
            dataKey="salinity"
            xAxisId="sal"
            type="monotone"
            stroke="#E8A33D"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="3 2"
            activeDot={{ r: 3, fill: '#E8A33D' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-1" aria-label="Chart legend">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-biolume" aria-hidden="true" />
          <span className="font-mono text-2xs text-foam-dim">Temperature (°C)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-instrument-amber border-dashed" style={{ borderTop: '1px dashed #E8A33D' }} aria-hidden="true" />
          <span className="font-mono text-2xs text-foam-dim">Salinity (PSU)</span>
        </div>
      </div>
    </div>
  );
}
