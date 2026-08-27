'use client';

import { X, ChevronRight } from 'lucide-react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { LoadingScan } from '@/components/shared/LoadingScan';
import { FloatSummaryCard } from './FloatSummaryCard';
import { DepthProfileChart } from './DepthProfileChart';
import { ModelVsObservationTable } from './ModelVsObservationTable';
import { DiveReplayButton } from './DiveReplayButton';
import { useProfile, useMatchup, useObservations } from '@/lib/api/queries';
import type { Observation } from '@/lib/api/types';

interface InspectorDrawerProps {
  onDiveReplay: (lat: number, lon: number) => void;
}

export function InspectorDrawer({ onDiveReplay }: InspectorDrawerProps) {
  const selectedId = useConsoleStore((s) => s.selectedFloatId);
  const open = useConsoleStore((s) => s.inspectorOpen);
  const setInspectorOpen = useConsoleStore((s) => s.setInspectorOpen);
  const clearFocusPoint = useConsoleStore((s) => s.clearFocusPoint);
  const focusLat = useConsoleStore((s) => s.focusLat);
  const focusLon = useConsoleStore((s) => s.focusLon);
  const time = useConsoleStore((s) => s.time);

  const isOceanPoint = !selectedId && focusLat !== null && focusLon !== null;
  // For ocean points: show as long as focusLat/lon is set (no need for inspectorOpen flag)
  // For float markers: show only when inspectorOpen is explicitly true
  const shouldShow = isOceanPoint || (open && !!selectedId);

  const effectiveId = selectedId || (isOceanPoint ? `GEO_${focusLat!.toFixed(2)}_${focusLon!.toFixed(2)}` : null);

  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(effectiveId);
  const { data: matchup, isLoading: matchupLoading } = useMatchup(effectiveId);

  // Get observation metadata for the selected float or construct synthetic ocean point observation
  const { data: observations } = useObservations({
    types: ['argo', 'glider', 'buoy'],
    time,
  });

  const selectedObservation: Observation | undefined = selectedId
    ? observations?.find((o) => o.id === selectedId)
    : (isOceanPoint ? {
        id: `INCOIS-STATION-${Math.abs(focusLat!).toFixed(2)}${focusLat! >= 0 ? 'N' : 'S'}-${Math.abs(focusLon!).toFixed(2)}${focusLon! >= 0 ? 'E' : 'W'}`,
        lat: focusLat!,
        lon: focusLon!,
        platform: 'argo' as const,
        lastSurfaced: time || '2026-08-01T00:00:00Z',
        qcStatus: 'ACCEPTED' as const,
        hasAnomaly: false,
        depth: 0,
      } : undefined);

  if (!shouldShow) return null;

  const handleClose = () => {
    setInspectorOpen(false);
    if (isOceanPoint) clearFocusPoint();
  };

  return (
    <div
      className="absolute right-3 top-16 bottom-20 z-50 w-72 animate-slide-in-right"
      role="dialog"
      aria-modal="false"
      aria-label={selectedObservation ? `Inspector for ${selectedObservation.id}` : 'Ocean inspector'}
    >
      <GlassPanel strong className="h-full">
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-thermocline/25 shrink-0">
            <div className="flex items-center gap-2">
              <ChevronRight size={12} className="text-biolume" aria-hidden="true" />
              <span className="font-display text-xs font-semibold text-foam tracking-wide">
                INSPECTOR
              </span>
            </div>
            <button
              onClick={handleClose}
              className="
                w-6 h-6 flex items-center justify-center rounded
                text-foam-dim hover:text-foam hover:bg-thermocline/20
                focus:outline-none focus:ring-2 focus:ring-biolume/40
                transition-colors
              "
              aria-label="Close inspector"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto console-scroll px-3 py-3 flex flex-col gap-5">
            {/* Float / Station summary */}
            {selectedObservation ? (
              <FloatSummaryCard observation={selectedObservation} />
            ) : (
              <div className="font-mono text-2xs text-foam-dim">
                PROFILE STREAM READY
              </div>
            )}

            <div className="w-full h-px bg-thermocline/20 shrink-0" role="separator" />

            {/* Depth profile chart */}
            {profileLoading ? (
              <LoadingScan label="Loading profile…" compact />
            ) : profileError ? (
              <div className="font-mono text-xs text-coral-delta/80">
                PROFILE STREAM ERROR
              </div>
            ) : profile ? (
              <DepthProfileChart profile={profile} />
            ) : (
              <div className="font-mono text-2xs text-foam-dim">
                NO PROFILE DATA AT THIS DEPTH
              </div>
            )}

            <div className="w-full h-px bg-thermocline/20 shrink-0" role="separator" />

            {/* Model vs observation table */}
            {matchupLoading ? (
              <LoadingScan label="Loading matchup…" compact />
            ) : matchup ? (
              <ModelVsObservationTable matchup={matchup} />
            ) : (
              <div className="font-mono text-2xs text-foam-dim">
                NO MODEL COVERAGE AT THIS DEPTH
              </div>
            )}

            <div className="w-full h-px bg-thermocline/20 shrink-0" role="separator" />

            {/* Dive / Depth View replay action */}
            <DiveReplayButton onReplay={() => {
              if (selectedObservation) {
                onDiveReplay(selectedObservation.lat, selectedObservation.lon);
              }
            }} />
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
