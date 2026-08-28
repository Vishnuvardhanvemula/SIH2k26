'use client';

import React, { ComponentType, useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { TopBar } from './TopBar';
import { CameraChoreographer } from '@/components/globe/CameraChoreographer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Globe and layers — client-only, dynamic imports
const CesiumStage = dynamic(
  () => import('@/components/globe/CesiumStage'),
  { ssr: false },
) as ComponentType<{ onViewerReady?: (v: unknown) => void; onGlobeClick?: (lat: number, lon: number) => void }>;

const ModelFieldLayer = dynamic(
  () => import('@/components/globe/ModelFieldLayer'),
  { ssr: false },
) as ComponentType<{ viewer: unknown }>;

const ArgoMarkerLayer = dynamic(
  () => import('@/components/globe/ArgoMarkerLayer'),
  { ssr: false },
) as ComponentType<{ viewer: unknown; onMarkerClick?: (id: string, lat: number, lon: number) => void }>;

const DepthSliceShader = dynamic(
  () => import('@/components/globe/DepthSliceShader'),
  { ssr: false },
) as ComponentType<{ viewer: unknown }>;

// Panel components
const LayersPanel = dynamic(
  () => import('@/components/layers-panel/LayersPanel').then((m) => ({ default: m.LayersPanel })),
  { ssr: false },
);

const TimelineScrubber = dynamic(
  () => import('@/components/timeline/TimelineScrubber').then((m) => ({ default: m.TimelineScrubber })),
  { ssr: false },
);

const InspectorDrawer = dynamic(
  () => import('@/components/inspector/InspectorDrawer').then((m) => ({ default: m.InspectorDrawer })),
  { ssr: false },
);

// Ocean cutaway panel — replaces ThreeDVolumeLayer + DepthColumnHUD
const OceanCutawayPanel = dynamic(
  () => import('@/components/cutaway/OceanCutawayPanel').then((m) => ({ default: m.OceanCutawayPanel })),
  { ssr: false },
) as ComponentType<Record<string, never>>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * OceanConsole — root shell of the console.
 * Orchestrates all panels floating over the full-bleed Cesium globe.
 */
export default function OceanConsole() {
  const [viewer, setViewer] = useState<unknown>(null);
  const choreographerRef = useRef<CameraChoreographer | null>(null);
  const mode         = useConsoleStore((s) => s.mode);
  const setMode      = useConsoleStore((s) => s.setMode);
  const setFocusPoint = useConsoleStore((s) => s.setFocusPoint);
  const setInspectorOpen = useConsoleStore((s) => s.setInspectorOpen);

  const handleViewerReady = useCallback((v: unknown) => {
    setViewer(v);
    choreographerRef.current = new CameraChoreographer(v);
  }, []);

  /** Globe bare-ocean click: set focus point → cutaway panel opens */
  const handleGlobeClick = useCallback(
    (lat: number, lon: number) => {
      setFocusPoint(lat, lon);
      choreographerRef.current?.flyToFloat(lat, lon, 800_000);
    },
    [setFocusPoint],
  );

  /** TopBar region search: fly only, no column */
  const handleSearchLocation = useCallback(
    (lat: number, lon: number, altitudeM?: number) => {
      choreographerRef.current?.flyToFloat(lat, lon, altitudeM);
    },
    [],
  );

  const handleReset = useCallback(() => {
    choreographerRef.current?.resetToIndianOcean();
  }, []);

  /**
   * Argo / glider / buoy marker click:
   * Fly there AND set the focus point so the cutaway panel opens at that location.
   */
  const handleMarkerClick = useCallback(
    (_id: string, lat: number, lon: number) => {
      choreographerRef.current?.flyToFloat(lat, lon, 800_000);
      setFocusPoint(lat, lon);
    },
    [setFocusPoint],
  );

  const handleDiveReplay = useCallback(
    (lat: number, lon: number) => {
      setFocusPoint(lat, lon);
      setMode('dive');
      setInspectorOpen(false);
      choreographerRef.current?.transitionTo('dive', { lon, lat });
    },
    [setFocusPoint, setMode, setInspectorOpen],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Full-viewport console shell */}
      <div 
        className="w-full h-full relative" 
        role="application" 
        aria-label="INCOIS OceanRoot Console"
      >
        {/* ── Globe Stage — z-index base, fills entire viewport ──────────── */}
        <CesiumStage
          onViewerReady={handleViewerReady}
          onGlobeClick={handleGlobeClick}
        />

        {/* Globe rendering layers */}
        {!!viewer && (
          <>
            <ModelFieldLayer viewer={viewer} />
            <ArgoMarkerLayer viewer={viewer} onMarkerClick={handleMarkerClick} />
            <DepthSliceShader viewer={viewer} />
          </>
        )}

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <TopBar
          onSearchLocation={handleSearchLocation}
          onReset={handleReset}
        />

        {/* ── Layers Panel — left, floating ────────────────────────────────── */}
        <aside
          className="absolute left-3 top-16 bottom-20 z-40 w-52 flex flex-col"
          aria-label="Layers panel"
        >
          <LayersPanel />
        </aside>

        {/* ── Timeline — bottom ─────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-40 h-16">
          <TimelineScrubber />
        </div>

        {/* ── Mode HUD badge ─────────────────────────────────────────────────── */}
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 mt-2 z-30 pointer-events-none"
          aria-live="polite"
          aria-label={`Current mode: ${mode}`}
        >
          {mode !== 'surface' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-deep-panel/80 backdrop-blur-sm border border-thermocline/30 animate-fade-in">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  mode === 'dive' ? 'bg-coral-delta animate-pulse' : 'bg-instrument-amber'
                }`}
              />
              <span className="font-mono text-2xs tracking-widest uppercase text-foam-dim">
                {mode === 'cutaway' ? 'CUTAWAY MODE' : 'DIVE MODE'}
              </span>
            </div>
          )}
        </div>

        {/* ── Inspector Drawer — slides in alongside cutaway ── */}
        <InspectorDrawer onDiveReplay={handleDiveReplay} />

        {/* ── Ocean Cutaway Panel — right side, always mounted for smooth animation ── */}
        <OceanCutawayPanel />
      </div>
    </QueryClientProvider>
  );
}
