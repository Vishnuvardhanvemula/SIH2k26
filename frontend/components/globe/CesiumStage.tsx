'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';

interface CesiumStageProps {
  onViewerReady?: (viewer: unknown) => void;
}

/**
 * CesiumStage — the full-bleed 3D ocean globe.
 * Initializes Cesium client-only, frames the Indian Ocean.
 */
export default function CesiumStage({ onViewerReady }: CesiumStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const setCursor = useConsoleStore((s) => s.setCursor);
  const handlerRef = useRef<unknown>(null);

  const initCesium = useCallback(async () => {
    if (!containerRef.current || viewerRef.current) return;

    try {
      const Cesium = await import('cesium');
      // Import Cesium CSS
      try {
        await import('cesium/Build/Cesium/Widgets/widgets.css');
      } catch {
        // CSS import may fail in some configs — not critical
      }

      // Configure Cesium assets path
      (window as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = '/cesium';

      // Configure Cesium Ion token (optional)
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (token) {
        Cesium.Ion.defaultAccessToken = token;
      }

      // ─── Viewer init ─────────────────────────────────────────────────────────
      const viewer = new Cesium.Viewer(containerRef.current, {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div'),
        requestRenderMode: false,
        shadows: false,
        useDefaultRenderLoop: true,
      });

      viewerRef.current = viewer;
      const scene = viewer.scene;

      // ─── Scene styling ────────────────────────────────────────────────────────
      try { scene.backgroundColor = Cesium.Color.fromCssColorString('#050B14'); } catch {}
      try { scene.fog.enabled = true; scene.fog.density = 0.0001; } catch {}
      try { scene.skyBox.show = false; } catch {}

      // ─── Lock Camera Zoom/Tilt ────────────────────────────────────────────────
      // Prevents user scrolling from breaking the HUD framing
      try {
        viewer.scene.screenSpaceCameraController.enableZoom = false;
        viewer.scene.screenSpaceCameraController.enableTilt = false;
      } catch {}

      // Style imagery layer for dark instrument look
      const layers = viewer.imageryLayers;
      if (layers && layers.length > 0) {
        const base = layers.get(0);
        if (base) {
          try { base.brightness = 0.45; } catch {}
          try { base.contrast = 1.2; } catch {}
          try { base.saturation = 0.5; } catch {}
        }
      }

      // Globe dark base color
      try {
        viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#050B14');
      } catch {}
      try {
        viewer.scene.globe.depthTestAgainstTerrain = false;
      } catch {}

      // ─── Camera: frame the Indian Ocean ──────────────────────────────────────
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(80.0, 10.0, 8000000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90), // -90 centers the globe in the viewport
          roll: 0,
        },
        duration: 0,
      });

      // ─── Mouse coordinate tracking ────────────────────────────────────────────
      const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
      handlerRef.current = handler;

      handler.setInputAction((movement: { endPosition: { x: number; y: number } }) => {
        try {
          const cartesian = viewer.camera.pickEllipsoid(
            movement.endPosition as unknown as import('cesium').Cartesian2,
            scene.globe.ellipsoid
          );
          if (cartesian) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            setCursor(parseFloat(lat.toFixed(4)), parseFloat(lon.toFixed(4)));
          } else {
            setCursor(null, null);
          }
        } catch {
          // Ignore mouse tracking errors
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      onViewerReady?.(viewer);
      console.log('[CesiumStage] Initialized successfully');

    } catch (err) {
      console.error('[CesiumStage] Failed to initialize Cesium:', err);
    }
  }, [setCursor, onViewerReady]);

  useEffect(() => {
    // Small delay to ensure DOM is fully mounted
    const timer = setTimeout(initCesium, 100);
    return () => {
      clearTimeout(timer);
      if (handlerRef.current) {
        try { (handlerRef.current as { destroy(): void }).destroy(); } catch {}
      }
      if (viewerRef.current) {
        try { (viewerRef.current as { destroy(): void }).destroy(); } catch {}
        viewerRef.current = null;
      }
    };
  }, [initCesium]);

  return (
    <div
      ref={containerRef}
      id="cesium-stage"
      className="absolute inset-0 w-full h-full"
      aria-label="3D Ocean Globe — Indian Ocean Digital Twin"
      role="img"
    />
  );
}
