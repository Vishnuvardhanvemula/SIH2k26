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
  synthetic: 'VIRTUAL WATER COLUMN',
  virtual: 'VIRTUAL WATER COLUMN',
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
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-biolume shadow-[0_0_6px_rgba(76,224,210,0.8)]" />
          <span className="font-mono text-xs font-bold tracking-[0.15em] text-biolume uppercase">
            {PLATFORM_LABELS[platform] ?? platform.toUpperCase()}
          </span>
        </div>
        {hasAnomaly && <AnomalyBadge type="warning" />}
      </div>

      {/* Grid for metadata cards */}
      <div className="grid grid-cols-1 gap-2">
        {/* Float ID Card */}
        <div className="bg-thermocline/5 border border-thermocline/20 rounded p-2 flex flex-col gap-1">
          <p className="font-mono text-[0.55rem] tracking-widest text-foam-dim uppercase">PLATFORM ID</p>
          <MonoValue value={id} size="sm" color="foam" aria-label={`Platform ID: ${id}`} />
        </div>

        {/* Position & Time Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Coordinates */}
          <div className="bg-thermocline/5 border border-thermocline/20 rounded p-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={10} className="text-foam-dim shrink-0" aria-hidden="true" />
              <p className="font-mono text-[0.55rem] tracking-widest text-foam-dim uppercase">POSITION</p>
            </div>
            <div className="flex flex-col">
              <MonoValue value={`${Math.abs(lat).toFixed(4)}°${latDir}`} size="xs" color="foam" />
              <MonoValue value={`${Math.abs(lon).toFixed(4)}°${lonDir}`} size="xs" color="foam" />
            </div>
          </div>

          {/* Last surfaced */}
          <div className="bg-thermocline/5 border border-thermocline/20 rounded p-2 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Clock size={10} className="text-foam-dim shrink-0" aria-hidden="true" />
              <p className="font-mono text-[0.55rem] tracking-widest text-foam-dim uppercase">SURFACED</p>
            </div>
            <div className="flex flex-col">
              <MonoValue value={dateStr} size="xs" color="foam" />
              <MonoValue value={`${timeStr} UTC`} size="xs" color="foam" />
            </div>
          </div>
        </div>
      </div>

      {/* QC Status */}
      <div className={`mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded border ${
        qcStatus === 'ACCEPTED' 
          ? 'bg-biolume/5 border-biolume/20' 
          : 'bg-instrument-amber/5 border-instrument-amber/20'
      }`}>
        {qcStatus === 'ACCEPTED'
          ? <ShieldCheck size={11} className="text-biolume" aria-hidden="true" />
          : <ShieldAlert size={11} className="text-instrument-amber" aria-hidden="true" />
        }
        <span className={`font-mono text-2xs tracking-widest uppercase ${
          qcStatus === 'ACCEPTED' ? 'text-biolume' : 'text-instrument-amber'
        }`}>
          QC: {qcStatus}
        </span>
      </div>
    </div>
  );
}
