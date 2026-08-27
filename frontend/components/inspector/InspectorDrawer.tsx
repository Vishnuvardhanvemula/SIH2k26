'use client';

import { X, ChevronRight } from 'lucide-react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { LoadingScan } from '@/components/shared/LoadingScan';
import { FloatSummaryCard } from './FloatSummaryCard';
import { DepthProfileChart } from './DepthProfileChart';
import { ModelVsObservationTable } from './ModelVsObservationTable';
import { DiveReplayButton } from './DiveReplayButton';
import { useProfile, useMatchup } from '@/lib/api/queries';
import { useObservations } from '@/lib/api/queries';

interface InspectorDrawerProps {
  onDiveReplay: () => void;
}

export function InspectorDrawer({ onDiveReplay }: InspectorDrawerProps) {
  const selectedId = useConsoleStore((s) => s.selectedFloatId);
  const open = useConsoleStore((s) => s.inspectorOpen);
  const setInspectorOpen = useConsoleStore((s) => s.setInspectorOpen);
  const time = useConsoleStore((s) => s.time);

  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(selectedId);
  const { data: matchup, isLoading: matchupLoading } = useMatchup(selectedId);

  // Get observation metadata for the selected float
  const { data: observations } = useObservations({
    types: ['argo', 'glider', 'buoy'],
    time,
  });
  const selectedObservation = observations?.find((o) => o.id === selectedId);

  if (!open || !selectedId) return null;

  return (
    <div
      className="absolute right-20 top-16 bottom-20 z-50 w-72 animate-slide-in-right"
      role="dialog"
      aria-modal="false"
      aria-label={`Inspector for ${selectedId}`}
    >
      <GlassPanel strong className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-thermocline/25 shrink-0">
          <div className="flex items-center gap-2">
            <ChevronRight size={12} className="text-biolume" aria-hidden="true" />
            <span className="font-display text-xs font-semibold text-foam tracking-wide">
              INSPECTOR
            </span>
          </div>
          <button
            onClick={() => setInspectorOpen(false)}
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
          {/* Float summary */}
          {selectedObservation ? (
            <FloatSummaryCard observation={selectedObservation} />
          ) : (
            <div className="font-mono text-2xs text-foam-dim">
              PROFILE STREAM READY
            </div>
          )}

          <div className="w-full h-px bg-thermocline/20" role="separator" />

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

          <div className="w-full h-px bg-thermocline/20" role="separator" />

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

          <div className="w-full h-px bg-thermocline/20" role="separator" />

          {/* Dive replay action */}
          <DiveReplayButton onReplay={onDiveReplay} />
        </div>
      </GlassPanel>
    </div>
  );
}
