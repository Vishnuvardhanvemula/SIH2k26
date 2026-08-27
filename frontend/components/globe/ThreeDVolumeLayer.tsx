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
  viewer: unknown | null;
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
      const v = viewer as CesiumViewerLike;
      const width = v.canvas.clientWidth;
      const height = v.canvas.clientHeight;
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // 2. Setup Three.js Scene
    const scene = new THREE.Scene();

    // 3. Setup Three.js Camera (matrix controlled by Cesium)
    const v = viewer as CesiumViewerLike;
    const camera = new THREE.PerspectiveCamera(
      v.camera.frustum.fov * (180 / Math.PI), 
      v.canvas.clientWidth / v.canvas.clientHeight, 
      0.1, 
      100000000
    );
    camera.matrixAutoUpdate = false; // We will manually feed it Cesium's view matrix

    // 4. Create the Cutaway Volumetric Plane
    // The cutaway plane spans East-West along 10N.
    const width = 8000000; // 8000 km wide
    const depth = 2000000; // 2000 km deep (exaggerated for visual impact)
    const geometry = new THREE.PlaneGeometry(width, depth, 64, 16); 
    
    // Custom Shader for the "volumetric depth slice"
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color(0x4ce0d2) }, // biolume
        uColorBottom: { value: new THREE.Color(0x0a1a2f) }, // deep ocean blue
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorTop;
        uniform vec3 uColorBottom;
        varying vec2 vUv;
        
        void main() {
          // Heatmap gradient from top (1.0) to bottom (0.0)
          vec3 baseColor = mix(uColorBottom, uColorTop, vUv.y);
          
          // Grid lines
          float gridX = abs(fract(vUv.x * 40.0 - uTime * 0.1) - 0.5) * 2.0;
          float gridY = abs(fract(vUv.y * 10.0 - uTime * 0.05) - 0.5) * 2.0;
          float lineX = smoothstep(0.95, 1.0, gridX);
          float lineY = smoothstep(0.9, 1.0, gridY);
          
          // Scanning beam effect
          float scan = sin(vUv.y * 20.0 - uTime * 2.0) * 0.5 + 0.5;
          scan = smoothstep(0.98, 1.0, scan) * 0.5;
          
          float alpha = 0.6 * vUv.y + lineX * 0.3 + lineY * 0.3 + scan;
          
          gl_FragColor = vec4(baseColor + (lineX+lineY)*0.5 + scan, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    
    const slicePlane = new THREE.Mesh(geometry, material);
    scene.add(slicePlane);
    
    // Convert Lat/Lon to Cartesian for Three.js
    import('cesium').then((Cesium) => {
      // Place the center of the plane at 10N, 80E, but halfway down the depth
      const position = Cesium.Cartesian3.fromDegrees(80.0, 10.0, -depth / 2); 
      slicePlane.position.set(position.x, position.y, position.z);
      
      // Orient the plane to match the local East-North-Up frame
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      const m = new THREE.Matrix4().fromArray(transform);
      slicePlane.quaternion.setFromRotationMatrix(m);
      
      // In ENU, X is East, Y is North, Z is Up.
      // A standard ThreeJS plane faces +Z. We want it to stand vertically, extending East-West (X) and Up-Down (Z).
      // So we rotate it 90 degrees around the X axis so it faces North (+Y).
      slicePlane.rotateX(Math.PI / 2);
    });

    // 5. The Sync Loop
    const renderLoop = () => {
      const vSync = viewer as CesiumViewerLike;
      if (!vSync.scene || !vSync.camera) return;

      // Update shader time
      material.uniforms.uTime.value += 0.016;

      // Copy Cesium's Camera View Matrix
      const cvm = vSync.camera.viewMatrix;
      camera.matrixWorldInverse.fromArray(cvm);
      camera.matrixWorld.copy(camera.matrixWorldInverse).invert();

      // Copy Cesium's Camera Projection Matrix
      const cpm = vSync.camera.frustum.projectionMatrix;
      camera.projectionMatrix.fromArray(cpm);

      // Render
      renderer.render(scene, camera);
    };

    // Attach to Cesium's preRender hook
    const vEvents = viewer as CesiumViewerLike;
    vEvents.scene.preRender.addEventListener(renderLoop);

    return () => {
      window.removeEventListener('resize', resize);
      vEvents.scene.preRender.removeEventListener(renderLoop);
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
