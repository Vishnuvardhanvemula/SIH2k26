'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useConsoleStore } from '@/lib/store/useConsoleStore';

interface CesiumViewerLike {
  canvas: HTMLCanvasElement;
  camera: {
    frustum: { fov: number; projectionMatrix: number[] };
    viewMatrix: number[];
  };
  scene: {
    preRender: { addEventListener: (fn: () => void) => void; removeEventListener: (fn: () => void) => void };
  };
}

interface ThreeDVolumeLayerProps {
  viewer: CesiumViewerLike | null;
}

export function ThreeDVolumeLayer({ viewer }: ThreeDVolumeLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useConsoleStore((s) => s.mode);

  useEffect(() => {
    if (!viewer || !canvasRef.current) return;

    // 1. Initialize Three.js Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true, // Crucial for z-fighting at planetary scale
    });
    
    // Match the Cesium canvas size
    const resize = () => {
      const width = viewer.canvas.clientWidth;
      const height = viewer.canvas.clientHeight;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // 2. Setup Three.js Scene
    const scene = new THREE.Scene();

    // 3. Setup Three.js Camera (matrix controlled by Cesium)
    const camera = new THREE.PerspectiveCamera(
      viewer.camera.frustum.fov * (180 / Math.PI), 
      viewer.canvas.clientWidth / viewer.canvas.clientHeight, 
      0.1, 
      100000000
    );
    camera.matrixAutoUpdate = false; // We will manually feed it Cesium's view matrix

    // 4. Create the "Glowing Box" Spike Test Object
    // We will place it roughly over the Indian Ocean
    const geometry = new THREE.BoxGeometry(500000, 500000, 500000); 
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x4ce0d2, // biolume
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const cube = new THREE.Mesh(geometry, material);
    
    // Convert Lat/Lon to Cartesian for Three.js
    // Let's import Cesium dynamically or assume it's available globally/from the viewer
    const Cesium = (window as Window & { Cesium?: { Cartesian3: { fromDegrees: (lon: number, lat: number, alt: number) => { x: number; y: number; z: number } }; Transforms: { eastNorthUpToFixedFrame: (pos: unknown) => number[] } } }).Cesium;
    if (Cesium) {
      const position = Cesium.Cartesian3.fromDegrees(80.0, 10.0, 250000); // 10N, 80E, floating up
      cube.position.set(position.x, position.y, position.z);
      
      // Orient the box so it aligns with the local tangent plane of the Earth
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      // transform is a Matrix4. We can apply it to the cube's quaternion
      const m = new THREE.Matrix4().fromArray(transform);
      cube.quaternion.setFromRotationMatrix(m);
    }
    
    scene.add(cube);

    // 5. The Sync Loop
    const renderLoop = () => {
      if (!viewer.scene || !viewer.camera) return;

      // Copy Cesium's Camera View Matrix
      const cvm = viewer.camera.viewMatrix;
      camera.matrixWorldInverse.fromArray(cvm);
      camera.matrixWorld.copy(camera.matrixWorldInverse).invert();

      // Copy Cesium's Camera Projection Matrix
      const cpm = viewer.camera.frustum.projectionMatrix;
      camera.projectionMatrix.fromArray(cpm);

      // Render
      renderer.render(scene, camera);
    };

    // Attach to Cesium's preRender hook
    viewer.scene.preRender.addEventListener(renderLoop);

    return () => {
      window.removeEventListener('resize', resize);
      viewer.scene.preRender.removeEventListener(renderLoop);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [viewer]);

  // Only show the Three.js layer if we are in CUT or DIVE mode
  const isVisible = mode === 'cutaway' || mode === 'dive';

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // VERY IMPORTANT: Let clicks pass through to Cesium
        zIndex: 10,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
      aria-hidden="true"
    />
  );
}
