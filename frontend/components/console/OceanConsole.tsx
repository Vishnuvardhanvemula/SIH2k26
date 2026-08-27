'use client';

import React, { ComponentType, useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { TopBar } from './TopBar';
import { CameraChoreographer } from '@/components/globe/CameraChoreographer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Globe and layers — client-only, dynamic imports
const CesiumStage = dynamic(() => import('@/components/globe/CesiumStage'), { ssr: false }) as ComponentType<{ onViewerReady?: (v: unknown) => void }>;
const ModelFieldLayer = dynamic(() => import('@/components/globe/ModelFieldLayer'), { ssr: false }) as ComponentType<{ viewer: unknown }>;
const ArgoMarkerLayer = dynamic(() => import('@/components/globe/ArgoMarkerLayer'), { ssr: false }) as ComponentType<{ viewer: unknown }>;
const DepthSliceShader = dynamic(() => import('@/components/globe/DepthSliceShader'), { ssr: false }) as ComponentType<{ viewer: unknown }>;

// Panel components
const LayersPanel = dynamic(() => import('@/components/layers-panel/LayersPanel').then(m => ({ default: m.LayersPanel })), { ssr: false });
const DepthRail = dynamic(() => import('@/components/depth-rail/DepthRail').then(m => ({ default: m.DepthRail })), { ssr: false });
const InspectorDrawer = dynamic(() => import('@/components/inspector/InspectorDrawer').then(m => ({ default: m.InspectorDrawer })), { ssr: false });
const TimelineScrubber = dynamic(() => import('@/components/timeline/TimelineScrubber').then(m => ({ default: m.TimelineScrubber })), { ssr: false });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * OceanConsole — the root shell of the entire console.
 * Orchestrates all panels floating over the full-bleed Cesium globe.
 * Globe is always visible; panels are positioned absolutely over it.
 */
export default function OceanConsole() {
  const [viewer, setViewer] = useState<unknown>(null);
  const choreographerRef = useRef<CameraChoreographer | null>(null);
  const mode = useConsoleStore((s) => s.mode);

  const handleViewerReady = useCallback((v: unknown) => {
    setViewer(v);
    choreographerRef.current = new CameraChoreographer(v);
  }, []);

  const handleModeChange = useCallback(
    (newMode: 'surface' | 'cutaway' | 'dive') => {
      choreographerRef.current?.transitionTo(newMode, { lon: 80, lat: 10 });
    },
    []
  );

  const handleSearchLocation = useCallback((lat: number, lon: number) => {
    choreographerRef.current?.flyToFloat(lat, lon);
  }, []);

  const handleReset = useCallback(() => {
    choreographerRef.current?.resetToIndianOcean();
  }, []);

  const handleDiveReplay = useCallback(() => {
    choreographerRef.current?.transitionTo('dive', { lon: 78.3, lat: 12.4 });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Full-viewport console shell */}
      <div
        className="relative w-full h-screen overflow-hidden bg-abyss"
        id="ocean-console"
        aria-label="INCOIS Ocean Digital Twin Console"
      >
        {/* ── Globe Stage — z-index base, fills entire viewport ──────────── */}
        <CesiumStage onViewerReady={handleViewerReady} />

        {/* Globe rendering layers (render into Cesium scene) */}
        {!!viewer && (
          <>
            <ModelFieldLayer viewer={viewer} />
            <ArgoMarkerLayer viewer={viewer} />
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

        {/* ── Depth Rail — right, persistent ───────────────────────────────── */}
        <aside
          className="absolute right-3 top-16 bottom-20 z-40 flex flex-col"
          aria-label="Depth navigation rail"
        >
          <DepthRail onModeChange={handleModeChange} />
        </aside>

        {/* ── Inspector Drawer — right, slides in on float selection ────────── */}
        <InspectorDrawer onDiveReplay={handleDiveReplay} />

        {/* ── Timeline — bottom ─────────────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-40 h-16">
          <TimelineScrubber />
        </div>

        {/* ── Depth mode HUD badge ──────────────────────────────────────────── */}
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 mt-2 z-30 pointer-events-none"
          aria-live="polite"
          aria-label={`Current mode: ${mode}`}
        >
          {mode !== 'surface' && (
            <div className="
              flex items-center gap-2 px-3 py-1 rounded-full
              bg-deep-panel/80 backdrop-blur-sm border border-thermocline/30
              animate-fade-in
            ">
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
      </div>
    </QueryClientProvider>
  );
}
