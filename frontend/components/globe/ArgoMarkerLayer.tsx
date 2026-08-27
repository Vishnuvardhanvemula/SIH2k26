'use client';

import { useEffect, useRef } from 'react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { useObservations } from '@/lib/api/queries';
import type { Observation } from '@/lib/api/types';

interface ArgoMarkerLayerProps {
  viewer: unknown | null;
}

const PLATFORM_COLOR = {
  argo: { r: 76, g: 224, b: 210 },    // biolume
  glider: { r: 232, g: 163, b: 61 },  // instrument-amber
  buoy: { r: 143, g: 165, b: 172 },   // foam-dim
};

/**
 * ArgoMarkerLayer — renders Argo floats, gliders, and buoys
 * as Cesium point entities. Handles click → selectedFloatId.
 */
export default function ArgoMarkerLayer({ viewer }: ArgoMarkerLayerProps) {
  const activeTypes = useConsoleStore((s) => s.activeObservationTypes);
  const time = useConsoleStore((s) => s.time);
  const selectedId = useConsoleStore((s) => s.selectedFloatId);
  const selectFloat = useConsoleStore((s) => s.selectFloat);

  const { data: observations } = useObservations({
    types: Array.from(activeTypes),
    time,
  });

  const entityMapRef = useRef<Map<string, unknown>>(new Map());
  const clickHandlerRef = useRef<unknown>(null);
  const cesiumRef = useRef<typeof import('cesium') | null>(null);

  // ── Initialize click handler once ──────────────────────────────────────────
  useEffect(() => {
    if (!viewer) return;

    import('cesium').then((Cesium) => {
      cesiumRef.current = Cesium;

      // Destroy any previous handler
      if (clickHandlerRef.current) {
        try { (clickHandlerRef.current as { destroy(): void }).destroy(); } catch {}
      }

      const canvas = (viewer as { scene: { canvas: HTMLCanvasElement } }).scene?.canvas;
      if (!canvas) return;

      const handler = new Cesium.ScreenSpaceEventHandler(canvas);
      clickHandlerRef.current = handler;

      handler.setInputAction((click: { position: { x: number; y: number } }) => {
        try {
          const picked = (viewer as {
            scene: { pick(pos: unknown): unknown };
          }).scene.pick(click.position);

          if (picked) {
            // Cesium entity click: entity is in picked.id
            const entity = (picked as { id?: { id?: string } }).id;
            if (entity?.id) {
              selectFloat(entity.id);
              return;
            }
          }
          // Click on empty globe — deselect
          selectFloat(null);
        } catch {
          // Swallow pick errors (e.g. during scene transitions)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    });

    return () => {
      if (clickHandlerRef.current) {
        try { (clickHandlerRef.current as { destroy(): void }).destroy(); } catch {}
        clickHandlerRef.current = null;
      }
    };
  }, [viewer, selectFloat]);

  // ── Render/update entities when observations or selection changes ──────────
  useEffect(() => {
    if (!viewer || !observations) return;

    const v = viewer as {
      entities: {
        add(e: unknown): unknown;
        remove(e: unknown): void;
      };
      scene: { requestRender(): void };
    };

    if (!v.entities || typeof v.entities.add !== 'function') return;

    import('cesium').then((Cesium) => {
      // Remove old entities
      entityMapRef.current.forEach((entity) => {
        try { v.entities.remove(entity); } catch {}
      });
      entityMapRef.current.clear();

      observations.forEach((obs: Observation) => {
        const isSelected = obs.id === selectedId;
        const isAnomaly = obs.hasAnomaly;
        const colors = PLATFORM_COLOR[obs.platform] ?? PLATFORM_COLOR.argo;

        let color: import('cesium').Color;
        if (isSelected) {
          color = Cesium.Color.fromCssColorString('#4CE0D2');
        } else if (isAnomaly) {
          color = Cesium.Color.fromCssColorString('#E8A33D');
        } else {
          color = new Cesium.Color(colors.r / 255, colors.g / 255, colors.b / 255, 0.9);
        }

        try {
          const entity = v.entities.add({
            id: obs.id,
            position: Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, 0),
            point: {
              pixelSize: isSelected ? 14 : obs.platform === 'argo' ? 10 : 8,
              color,
              outlineColor: isSelected
                ? Cesium.Color.WHITE.withAlpha(0.8)
                : Cesium.Color.fromCssColorString('#050B14').withAlpha(0.5),
              outlineWidth: isSelected ? 2 : 1,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                obs.lon, obs.lat, 0,
                obs.lon, obs.lat, -2000
              ]),
              width: 1,
              material: new Cesium.PolylineDashMaterialProperty({
                color: color.withAlpha(0.5),
                dashLength: 8,
              }),
            },
            label: isSelected
              ? {
                  text: obs.id,
                  font: '10px "IBM Plex Mono"',
                  fillColor: Cesium.Color.fromCssColorString('#E9F1F3'),
                  outlineColor: Cesium.Color.fromCssColorString('#050B14'),
                  outlineWidth: 2,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  pixelOffset: new Cesium.Cartesian2(0, -18),
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                }
              : undefined,
          });
          entityMapRef.current.set(obs.id, entity);
        } catch (err) {
          console.warn('[ArgoMarkerLayer] Failed to add entity:', obs.id, err);
        }
      });

      try { v.scene.requestRender?.(); } catch {}
    });

    const currentMap = entityMapRef.current;
    return () => {
      currentMap.forEach((entity) => {
        try { v.entities.remove(entity); } catch {}
      });
      currentMap.clear();
    };
  }, [viewer, observations, selectedId]);

  return null;
}
