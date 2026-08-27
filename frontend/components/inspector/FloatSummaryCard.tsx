'use client';

import { MapPin, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { MonoValue } from '@/components/shared/MonoValue';
import { AnomalyBadge } from './AnomalyBadge';
import type { Observation } from '@/lib/api/types';

interface FloatSummaryCardProps {
  observation: Observation;
}

const PLATFORM_LABELS: Record<string, string> = {
  argo: 'ARGO FLOAT',
  glider: 'GLIDER',
  buoy: 'SURFACE BUOY',
};

export function FloatSummaryCard({ observation }: FloatSummaryCardProps) {
  const { id, lat, lon, lastSurfaced, platform, qcStatus, hasAnomaly } = observation;

  const lastSurfacedDate = new Date(lastSurfaced);
  const dateStr = lastSurfacedDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC',
  });
  const timeStr = lastSurfacedDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false,
  });

  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  return (
    <div className="flex flex-col gap-3" role="region" aria-label={`Float ${id} summary`}>
      {/* Platform type badge */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xs tracking-[0.18em] text-foam-dim uppercase">
          {PLATFORM_LABELS[platform] ?? platform.toUpperCase()}
        </span>
        {hasAnomaly && <AnomalyBadge type="warning" />}
      </div>

      {/* Float ID */}
      <div>
        <p className="label-ui text-[0.55rem] mb-0.5">PLATFORM ID</p>
        <MonoValue value={id} size="sm" color="biolume" aria-label={`Platform ID: ${id}`} />
      </div>

      {/* Coordinates */}
      <div className="flex items-start gap-1">
        <MapPin size={11} className="text-foam-dim mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <p className="label-ui text-[0.55rem]">POSITION</p>
          <div className="flex gap-2">
            <MonoValue
              value={`${Math.abs(lat).toFixed(4)}°${latDir}`}
              size="xs"
              color="foam"
              aria-label={`Latitude: ${lat}`}
            />
            <MonoValue
              value={`${Math.abs(lon).toFixed(4)}°${lonDir}`}
              size="xs"
              color="foam"
              aria-label={`Longitude: ${lon}`}
            />
          </div>
        </div>
      </div>

      {/* Last surfaced */}
      <div className="flex items-start gap-1">
        <Clock size={11} className="text-foam-dim mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="label-ui text-[0.55rem]">LAST SURFACED</p>
          <MonoValue value={`${dateStr} ${timeStr} UTC`} size="xs" color="foam" />
        </div>
      </div>

      {/* QC Status */}
      <div className="flex items-center gap-1.5">
        {qcStatus === 'ACCEPTED'
          ? <ShieldCheck size={11} className="text-biolume" aria-hidden="true" />
          : <ShieldAlert size={11} className="text-instrument-amber" aria-hidden="true" />
        }
        <span className={`font-mono text-2xs tracking-widest ${
          qcStatus === 'ACCEPTED' ? 'text-biolume' : 'text-instrument-amber'
        }`}>
          QC STATUS: {qcStatus}
        </span>
      </div>
    </div>
  );
}
