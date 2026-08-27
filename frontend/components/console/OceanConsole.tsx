'use client';

import React, { ComponentType, useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { TopBar } from './TopBar';
import { DepthColumnHUD } from './DepthColumnHUD';
import { CameraChoreographer } from '@/components/globe/CameraChoreographer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Globe and layers — client-only, dynamic imports
const CesiumStage = dynamic(() => import('@/components/globe/CesiumStage'), { ssr: false }) as ComponentType<{ onViewerReady?: (v: unknown) => void; onGlobeClick?: (lat: number, lon: number) => void }>;
const ModelFieldLayer = dynamic(() => import('@/components/globe/ModelFieldLayer'), { ssr: false }) as ComponentType<{ viewer: unknown }>;
const ArgoMarkerLayer = dynamic(() => import('@/components/globe/ArgoMarkerLayer'), { ssr: false }) as ComponentType<{ viewer: unknown; onMarkerClick?: (id: string, lat: number, lon: number) => void }>;
const DepthSliceShader = dynamic(() => import('@/components/globe/DepthSliceShader'), { ssr: false }) as ComponentType<{ viewer: unknown }>;
const ThreeDVolumeLayer = dynamic(() => import('@/components/globe/ThreeDVolumeLayer').then(m => m.ThreeDVolumeLayer), { ssr: false }) as ComponentType<{ viewer: unknown | null }>;

// Panel components
const LayersPanel = dynamic(() => import('@/components/layers-panel/LayersPanel').then(m => ({ default: m.LayersPanel })), { ssr: false });
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
 */
export default function OceanConsole() {
  const [viewer, setViewer] = useState<unknown>(null);
  const choreographerRef = useRef<CameraChoreographer | null>(null);
  const mode = useConsoleStore((s) => s.mode);
  const setFocusPoint = useConsoleStore((s) => s.setFocusPoint);
  const selectFloat = useConsoleStore((s) => s.selectFloat);

  const handleViewerReady = useCallback((v: unknown) => {
    setViewer(v);
    choreographerRef.current = new CameraChoreographer(v);
  }, []);

  /** Globe bare-ocean click: fly there AND open the depth column */
  const handleGlobeClick = useCallback((lat: number, lon: number) => {
    setFocusPoint(lat, lon);
    choreographerRef.current?.flyToFloat(lat, lon, 800_000); // zoom to 800 km
  }, [setFocusPoint]);

  /** TopBar region search: fly only, no column */
  const handleSearchLocation = useCallback((lat: number, lon: number, altitudeM?: number) => {
    choreographerRef.current?.flyToFloat(lat, lon, altitudeM);
  }, []);

  const handleReset = useCallback(() => {
    choreographerRef.current?.resetToIndianOcean();
  }, []);

  /** Globe marker click: zoom to marker and open inspector */
  const handleMarkerClick = useCallback((id: string, lat: number, lon: number) => {
    choreographerRef.current?.flyToFloat(lat, lon, 800_000);
    selectFloat(id);
  }, [selectFloat]);

  const setMode = useConsoleStore((s) => s.setMode);

  const handleDiveReplay = useCallback((lat: number, lon: number) => {
    // Set 3D focus point for the borehole column
    setFocusPoint(lat, lon);
    setMode('dive');
    // Close inspector drawer to reveal the 3D column and DepthColumnHUD
    useConsoleStore.getState().setInspectorOpen(false);
    // Trigger the cinematic dive animation
    choreographerRef.current?.transitionTo('dive', { lon, lat });
  }, [setFocusPoint, setMode]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Full-viewport console shell */}
      <div
        className="relative w-full h-screen overflow-hidden bg-abyss"
        id="ocean-console"
        aria-label="INCOIS Ocean Digital Twin Console"
      >
        {/* ── Globe Stage — z-index base, fills entire viewport ──────────── */}
        <CesiumStage
          onViewerReady={handleViewerReady}
          onGlobeClick={handleGlobeClick}
        />

        {/* Globe rendering layers (render into Cesium scene) */}
        {!!viewer && (
          <>
            <ModelFieldLayer viewer={viewer} />
            <ArgoMarkerLayer viewer={viewer} onMarkerClick={handleMarkerClick} />
            <DepthSliceShader viewer={viewer} />
            <ThreeDVolumeLayer viewer={viewer} />
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

        {/* ── Depth Column HUD — right, appears when a point is focused ─────── */}
        <aside
          className="absolute right-3 top-16 z-50 flex flex-col pointer-events-none"
          aria-label="Depth column HUD"
        >
          <DepthColumnHUD />
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
