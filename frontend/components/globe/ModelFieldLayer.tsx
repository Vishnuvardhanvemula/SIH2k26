'use client';

import { useEffect, useRef } from 'react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { useModelField } from '@/lib/api/queries';
import { valueToColor } from '@/lib/cesium/colormaps';
import type { ColormapName } from '@/lib/cesium/colormaps';

interface ModelFieldLayerProps {
  viewer: unknown | null;
}

/**
 * ModelFieldLayer — renders the temperature/salinity model field
 * as colored rectangles on the Cesium globe surface.
 * Uses scientific colormaps (thermal/viridis/cividis).
 */
export default function ModelFieldLayer({ viewer }: ModelFieldLayerProps) {
  const variable = useConsoleStore((s) => s.variable);
  const depth = useConsoleStore((s) => s.depth);
  const time = useConsoleStore((s) => s.time);
  const colormap = useConsoleStore((s) => s.colormap);
  const isModelFieldVisible = useConsoleStore((s) => s.isModelFieldVisible);
  const showCurrents = useConsoleStore((s) => s.showCurrents);
  const entityIdsRef = useRef<unknown[]>([]);

  const { data: field } = useModelField({ variable, depth, time });

  useEffect(() => {
    if (!viewer) return;

    const v = viewer as {
      entities: {
        add: (e: unknown) => unknown;
        remove: (e: unknown) => void;
      };
      scene: { requestRender: () => void };
    };

    // Always clear existing entities on update
    entityIdsRef.current.forEach((e) => v.entities.remove(e));
    entityIdsRef.current = [];

    if (!field) return;

    // Draw base scalar grid if visible
    if (isModelFieldVisible) {
      const { lat, lon, grid, colorRange } = field;
      const [min, max] = colorRange;
      const cmName = colormap.name as ColormapName;
      const opacity = colormap.opacity;

      import('cesium').then((Cesium) => {
        const latStep = lat.length > 1 ? lat[1] - lat[0] : 2;
        const lonStep = lon.length > 1 ? lon[1] - lon[0] : 2.5;

        for (let i = 0; i < lat.length; i++) {
          for (let j = 0; j < lon.length; j++) {
            const value = grid[i][j];
            if (value === null || value === undefined) continue;

            const color = valueToColor(value, min, max, cmName);
            const [r, g, b] = color.match(/\d+/g)!.map(Number);

            const entity = v.entities.add({
              rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(
                  lon[j] - lonStep / 2,
                  lat[i] - latStep / 2,
                  lon[j] + lonStep / 2,
                  lat[i] + latStep / 2
                ),
                height: 0,
                extrudedHeight: depth > 0 ? -depth : undefined,
                material: new Cesium.ColorMaterialProperty(
                  new Cesium.Color(r / 255, g / 255, b / 255, opacity)
                ),
                outline: false,
              },
            });

            entityIdsRef.current.push(entity);
          }
        }
        v.scene.requestRender?.();
      });
    }

    // Draw vector overlays (current flow arrows) if enabled
    if (showCurrents && field.u && field.v) {
      const { lat, lon, u, v: vVel } = field;
      import('cesium').then((Cesium) => {
        for (let i = 0; i < lat.length; i += 1) {
          for (let j = 0; j < lon.length; j += 1) {
            const uVal = u[i][j];
            const vVal = vVel[i][j];
            const speed = Math.sqrt(uVal * uVal + vVal * vVal);
            if (speed < 0.1) continue;

            // Arrow direction (end point offset scaled for visual clarity)
            const scale = 0.8;
            const endLon = lon[j] + uVal * scale;
            const endLat = lat[i] + vVal * scale;

            // Calculate height logic based on depth (we want arrows hovering slightly above the slice)
            const arrowHeight = depth > 0 ? -depth + 10 : 10;

            const arrow = v.entities.add({
              polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                  lon[j], lat[i], arrowHeight,
                  endLon, endLat, arrowHeight
                ]),
                width: 4,
                material: new Cesium.PolylineArrowMaterialProperty(
                  new Cesium.Color(1.0, 1.0, 1.0, 0.7)
                ),
              }
            });
            entityIdsRef.current.push(arrow);
          }
        }
        v.scene.requestRender?.();
      });
    }

    return () => {
      entityIdsRef.current.forEach((e) => v.entities.remove(e));
      entityIdsRef.current = [];
    };
  }, [viewer, field, colormap, isModelFieldVisible, showCurrents, depth]);

  return null; // Globe-layer component — renders into Cesium, not React DOM
}
