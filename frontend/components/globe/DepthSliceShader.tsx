'use client';

import { useEffect, useRef } from 'react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';

interface DepthSliceShaderProps {
  viewer: unknown | null;
}

interface CesiumViewer {
  scene: {
    globe: { clippingPlanes: unknown };
    requestRender: () => void;
  };
}

export default function DepthSliceShader({ viewer }: DepthSliceShaderProps) {
  const mode = useConsoleStore((s) => s.mode);
  const planesRef = useRef<{ enabled: boolean; isDestroyed: () => boolean; destroy: () => void } | null>(null);

  useEffect(() => {
    if (!viewer) return;

    import('cesium').then((Cesium) => {
      const v = viewer as CesiumViewer;
      
      if (!planesRef.current) {
        // Create a clipping plane that cuts the globe in half (roughly at the equator/target lat)
        // We use a plane with normal facing South (0, -1, 0) in local tangent space
        const position = Cesium.Cartesian3.fromDegrees(80.0, 10.0, 0); // Indian Ocean center
        const normal = new Cesium.Cartesian3(0.0, -1.0, 0.0); // Slice away the south
        
        // Transform the normal to Earth-Centered, Earth-Fixed (ECEF) coordinates
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        const normalECEF = Cesium.Matrix4.multiplyByPointAsVector(
          transform,
          normal,
          new Cesium.Cartesian3()
        );
        Cesium.Cartesian3.normalize(normalECEF, normalECEF);
        
        // The distance of the plane from the origin. 
        // We want the plane to pass through `position`.
        const distance = -Cesium.Cartesian3.dot(normalECEF, position);
        const plane = new Cesium.ClippingPlane(normalECEF, distance);

        const clippingPlanes = new Cesium.ClippingPlaneCollection({
          planes: [plane],
          edgeWidth: 2.0,
          edgeColor: Cesium.Color.fromCssColorString('#4CE0D2').withAlpha(0.5), // biolume edge
          enabled: false,
        });
        
        v.scene.globe.clippingPlanes = clippingPlanes;
        planesRef.current = clippingPlanes;
      }

      // Enable the cutaway slice only in cutaway or dive modes
      if (planesRef.current) {
        planesRef.current.enabled = mode === 'cutaway' || mode === 'dive';
        v.scene.requestRender();
      }
    });

    return () => {
      // Cleanup on unmount
      if (viewer && planesRef.current) {
        const v = viewer as CesiumViewer;
        v.scene.globe.clippingPlanes = undefined;
        if (!planesRef.current.isDestroyed()) {
          planesRef.current.destroy();
        }
        planesRef.current = null;
      }
    };
  }, [viewer, mode]);

  return null;
}
