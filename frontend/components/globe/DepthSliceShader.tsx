'use client';

import { useEffect, useRef } from 'react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';

interface DepthSliceShaderProps {
  viewer: unknown | null;
}

/**
 * DepthSliceShader — Cesium ClippingPlane fallback for the cutaway effect.
 * When mode = 'cutaway', applies a clipping plane to reveal a depth-graded
 * vertical slice beneath the selected region.
 *
 * This is the stable fallback path (vs. Three.js volume rendering).
 * The component API and state interface are identical — the renderer underneath
 * can be swapped without touching anything downstream.
 */
export default function DepthSliceShader({ viewer }: DepthSliceShaderProps) {
  useEffect(() => {
    if (!viewer) return;
    
    // Cleanup any lingering clipping planes from older versions
    import('cesium').then((Cesium) => {
      const v = viewer as { scene: { globe: { clippingPlanes: unknown } } };
      if (v.scene && v.scene.globe) {
        v.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
          planes: [],
          enabled: false,
        });
      }
    });
  }, [viewer]);

  // Cutaway effect is now handled natively via extrudedHeight in ModelFieldLayer
  return null;
}
