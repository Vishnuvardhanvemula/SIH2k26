'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useConsoleStore } from '@/lib/store/useConsoleStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CesiumViewerLike {
  canvas: HTMLCanvasElement;
  camera: {
    frustum: { fov: number; projectionMatrix: number[] };
    viewMatrix: number[];
  };
  scene: {
    preRender: {
      addEventListener: (fn: () => void) => void;
      removeEventListener: (fn: () => void) => void;
    };
    requestRender?: () => void;
  };
}

interface ThreeDVolumeLayerProps {
  viewer: unknown | null;
}

// ─── Colour maps ──────────────────────────────────────────────────────────────
/** Map a 0..1 normalised value to an RGB colour using a thermal heatmap */
function thermalColor(t: number): THREE.Color {
  // deep blue → cyan → green → yellow → red
  const colors = [
    new THREE.Color(0x0a1a4f),
    new THREE.Color(0x0d4e8a),
    new THREE.Color(0x4ce0d2),
    new THREE.Color(0x3dd68c),
    new THREE.Color(0xffc107),
    new THREE.Color(0xff5722),
  ];
  const idx = t * (colors.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.min(lo + 1, colors.length - 1);
  return colors[lo].clone().lerp(colors[hi], idx - lo);
}

function halineColor(t: number): THREE.Color {
  const colors = [
    new THREE.Color(0x2e0061),
    new THREE.Color(0x1a52a8),
    new THREE.Color(0x29b6f6),
    new THREE.Color(0x80cbc4),
    new THREE.Color(0xf9a825),
  ];
  const idx = t * (colors.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.min(lo + 1, colors.length - 1);
  return colors[lo].clone().lerp(colors[hi], idx - lo);
}

// ─── Depth levels & column params ────────────────────────────────────────────
const COLUMN_RADIUS_M  = 60_000;   // 60 km radius  (visual, exaggerated)
const COLUMN_HEIGHT_M  = 2_200_000; // 2 200 km exaggerated depth
const DEPTH_SCALE      = COLUMN_HEIGHT_M / 2000; // metres → Three.js units (same scale as radius)

// ─── Component ────────────────────────────────────────────────────────────────
export function ThreeDVolumeLayer({ viewer }: ThreeDVolumeLayerProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sceneRef   = useRef<THREE.Scene | null>(null);
  const columnGrpRef = useRef<THREE.Group | null>(null);

  const focusLat  = useConsoleStore((s) => s.focusLat);
  const focusLon  = useConsoleStore((s) => s.focusLon);
  const depth     = useConsoleStore((s) => s.depth);
  const variable  = useConsoleStore((s) => s.variable);

  // ── Fetch column data whenever focusPoint or variable changes ────────────
  const columnDataRef = useRef<{ depths: number[]; values: number[]; colorRange: [number,number]; unit: string } | null>(null);
  const columnFetchRef = useRef(0); // cancellation token

  // ── Renderer init ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!viewer || !canvasRef.current) return;
    const v = viewer as CesiumViewerLike;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
    });

    const resize = () => {
      renderer.setSize(v.canvas.clientWidth, v.canvas.clientHeight, false);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ambient light for mesh visibility
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Camera — matrix driven by Cesium every frame
    const camera = new THREE.PerspectiveCamera(
      v.camera.frustum.fov * (180 / Math.PI),
      v.canvas.clientWidth / v.canvas.clientHeight,
      0.1,
      1_000_000_000,
    );
    camera.matrixAutoUpdate = false;

    const renderLoop = () => {
      const vSync = v;
      if (!vSync.scene || !vSync.camera) return;
      const cvm = vSync.camera.viewMatrix;
      camera.matrixWorldInverse.fromArray(cvm);
      camera.matrixWorld.copy(camera.matrixWorldInverse).invert();
      const cpm = vSync.camera.frustum.projectionMatrix;
      camera.projectionMatrix.fromArray(cpm);
      renderer.render(scene, camera);
    };

    v.scene.preRender.addEventListener(renderLoop);

    return () => {
      window.removeEventListener('resize', resize);
      v.scene.preRender.removeEventListener(renderLoop);
      renderer.dispose();
      sceneRef.current = null;
    };
  }, [viewer]);

  // ── Build / rebuild the column whenever focusPoint or variable changes ────
  useEffect(() => {
    if (focusLat === null || focusLon === null || !sceneRef.current) return;

    const scene = sceneRef.current;
    const fetchId = ++columnFetchRef.current;

    // Remove old column
    if (columnGrpRef.current) {
      scene.remove(columnGrpRef.current);
      columnGrpRef.current = null;
    }

    fetch(`/api/column?lat=${focusLat}&lon=${focusLon}&variable=${variable}`)
      .then((r) => r.json())
      .then((data) => {
        if (fetchId !== columnFetchRef.current) return; // stale
        columnDataRef.current = data;
        buildColumn(scene, focusLat, focusLon, data, depth, variable);
      })
      .catch(console.error);
  }, [focusLat, focusLon, variable]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Rebuild highlights when depth slider moves (fast path) ────────────────
  useEffect(() => {
    if (focusLat === null || focusLon === null || !sceneRef.current || !columnDataRef.current) return;
    buildColumn(sceneRef.current, focusLat, focusLon, columnDataRef.current, depth, variable);
  }, [depth, focusLat, focusLon, variable]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Clear column when focus cleared ───────────────────────────────────────
  useEffect(() => {
    if (focusLat === null && focusLon === null && sceneRef.current && columnGrpRef.current) {
      sceneRef.current.remove(columnGrpRef.current);
      columnGrpRef.current = null;
      columnDataRef.current = null;
    }
  }, [focusLat, focusLon]);

  // Only show when viewer exists; visibility managed by opacity
  const isVisible = !!viewer;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
      aria-hidden="true"
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: build (or rebuild) the column group
  // ─────────────────────────────────────────────────────────────────────────
  function buildColumn(
    scene: THREE.Scene,
    lat: number,
    lon: number,
    data: { depths: number[]; values: number[]; colorRange: [number, number]; unit: string },
    activeDepth: number,
    variable: string,
  ) {
    // Remove previous
    if (columnGrpRef.current) {
      scene.remove(columnGrpRef.current);
    }

    import('cesium').then((Cesium) => {
      const group = new THREE.Group();

      const { depths, values, colorRange } = data;
      const [cMin, cMax] = colorRange;
      const colorFn = variable === 'salinity' ? halineColor : thermalColor;

      // ── Outer wireframe cylinder (the "bore hole") ──────────────────────
      const tubeGeo = new THREE.CylinderGeometry(
        COLUMN_RADIUS_M, COLUMN_RADIUS_M, COLUMN_HEIGHT_M, 32, 1, true,
      );
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x4ce0d2,
        wireframe: false,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      });
      group.add(new THREE.Mesh(tubeGeo, tubeMat));

      // Outer edge ring at surface
      const ringGeo = new THREE.TorusGeometry(COLUMN_RADIUS_M, 2000, 8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x4ce0d2, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = COLUMN_HEIGHT_M / 2;
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // ── Depth band discs ───────────────────────────────────────────────
      for (let i = 0; i < depths.length; i++) {
        const depthM  = depths[i];
        const value   = values[i];
        const t       = (value - cMin) / (cMax - cMin + 0.0001);
        const color   = colorFn(Math.max(0, Math.min(1, t)));

        const yPos    = COLUMN_HEIGHT_M / 2 - depthM * DEPTH_SCALE;
        const isActive = Math.abs(depthM - activeDepth) < 75;

        // Filled disc
        const discGeo = new THREE.CircleGeometry(COLUMN_RADIUS_M, 48);
        const discMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: isActive ? 0.92 : 0.35,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const disc = new THREE.Mesh(discGeo, discMat);
        disc.position.y = yPos;
        disc.rotation.x = Math.PI / 2;
        group.add(disc);

        // Active depth — glowing ring outline
        if (isActive) {
          const haloGeo = new THREE.TorusGeometry(COLUMN_RADIUS_M, 5000, 12, 64);
          const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.position.y = yPos;
          halo.rotation.x = Math.PI / 2;
          group.add(halo);
        }
      }

      // ── Vertical axis line ─────────────────────────────────────────────
      const axisPoints = [
        new THREE.Vector3(0, -COLUMN_HEIGHT_M / 2, 0),
        new THREE.Vector3(0,  COLUMN_HEIGHT_M / 2, 0),
      ];
      const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
      const axisMat = new THREE.LineBasicMaterial({ color: 0x4ce0d2, transparent: true, opacity: 0.6 });
      group.add(new THREE.Line(axisGeo, axisMat));

      // ── Position & orient at lat/lon ───────────────────────────────────
      // Place the TOP of the column at the surface (alt=0), group centre = mid-column
      const surfacePos = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
      // shift down by half height so top is at surface
      const downVec = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.negate(surfacePos, new Cesium.Cartesian3()),
        new Cesium.Cartesian3(),
      );
      const centrePos = Cesium.Cartesian3.add(
        surfacePos,
        Cesium.Cartesian3.multiplyByScalar(downVec, COLUMN_HEIGHT_M / 2, new Cesium.Cartesian3()),
        new Cesium.Cartesian3(),
      );

      group.position.set(centrePos.x, centrePos.y, centrePos.z);

      // Align the group's local Y-axis with the Earth's surface normal (pointing up)
      const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(surfacePos);
      const m4 = new THREE.Matrix4().fromArray(enuMatrix);
      group.quaternion.setFromRotationMatrix(m4);
      // CylinderGeometry's axis is Y; ENU Z is "up" → rotate X by -90°
      group.rotateX(-Math.PI / 2);

      scene.add(group);
      columnGrpRef.current = group;
      
      const v = viewer as CesiumViewerLike;
      v?.scene?.requestRender?.();
    });
  }
}
