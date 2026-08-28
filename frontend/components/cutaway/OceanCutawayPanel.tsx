'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';
import * as THREE from 'three';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { X, Thermometer, Droplets } from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────────
const MAX_DEPTH = 2000;

/** Ocean depth zones shown in the cutaway */
const ZONES = [
  {
    name: 'Epipelagic',
    alias: 'Sunlit Zone',
    minDepth: 0,
    maxDepth: 200,
    accentHex: '#4CE0D2',
    glowRgb: '76, 224, 210',
    desc: 'Light-rich, high-productivity surface layer. Home to 90 % of marine life.',
    facts: ['Phytoplankton blooms', 'Maximum UV exposure', 'Most biodiversity'],
  },
  {
    name: 'Mesopelagic',
    alias: 'Twilight Zone',
    minDepth: 200,
    maxDepth: 1000,
    accentHex: '#3A9BD4',
    glowRgb: '58, 155, 212',
    desc: 'Dimly lit thermocline region with active diel vertical migration.',
    facts: ['Bioluminescence', 'Oxygen minimum zone', 'Carbon pump'],
  },
  {
    name: 'Bathypelagic',
    alias: 'Midnight Zone',
    minDepth: 1000,
    maxDepth: 2000,
    accentHex: '#2254A0',
    glowRgb: '34, 84, 160',
    desc: 'Complete darkness, near-freezing temps, extreme pressure.',
    facts: ['No sunlight', '100 – 200 atm', 'Sparse cold-adapted fauna'],
  },
] as const;

type Zone = (typeof ZONES)[number];

const DEPTH_PRESETS = [0, 50, 100, 200, 500, 1000, 2000] as const;

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Profile {
  depths: number[];
  temperature: number[];
  salinity: number[];
  tempRange: [number, number];
  salinityRange: [number, number];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
/** Maps depth (metres) → normalised camera Y (1.0 = surface, -1.0 = seabed) */
function yFromDepth(d: number): number {
  return 1 - 2 * (d / MAX_DEPTH);
}

/** Linear interpolation through a depth profile */
function interpolate(depths: number[], values: number[], target: number): number {
  if (!depths.length) return 0;
  if (target <= depths[0]) return values[0];
  if (target >= depths[depths.length - 1]) return values[values.length - 1];
  for (let i = 0; i < depths.length - 1; i++) {
    if (target >= depths[i] && target <= depths[i + 1]) {
      const t = (target - depths[i]) / (depths[i + 1] - depths[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[0];
}

function getZone(depth: number): Zone {
  return (
    ZONES.find((z) => depth >= z.minDepth && depth < z.maxDepth) ?? ZONES[2]
  );
}

/** Maps a normalised 0..1 value to a CSS hsl colour string */
function valueToHsl(t: number, variable: 'temperature' | 'salinity'): string {
  const c = Math.max(0, Math.min(1, t));
  if (variable === 'temperature') {
    const hue = Math.round(240 - c * 240); // blue→red
    return `hsl(${hue},85%,58%)`;
  } else {
    const hue = Math.round(280 - c * 100); // violet→teal
    return `hsl(${hue},75%,55%)`;
  }
}

// ─── Sparkline ──────────────────────────────────────────────────────────────────
function SparklineChart({
  profile,
  variable,
  depth,
}: {
  profile: Profile;
  variable: 'temperature' | 'salinity';
  depth: number;
}) {
  const W = 156, H = 210;
  const pL = 34, pR = 8, pT = 10, pB = 22;
  const iW = W - pL - pR;
  const iH = H - pT - pB;

  const values = variable === 'temperature' ? profile.temperature : profile.salinity;
  const range  = variable === 'temperature' ? profile.tempRange    : profile.salinityRange;
  const [vMin, vMax] = range;
  const vRange = vMax - vMin + 0.0001;

  const pts = profile.depths.map((d, i) => ({
    x: pL + ((values[i] - vMin) / vRange) * iW,
    y: pT + (d / MAX_DEPTH) * iH,
    v: values[i],
    t: (values[i] - vMin) / vRange,
  }));

  const depthY    = pT + (depth / MAX_DEPTH) * iH;
  const activeV   = interpolate(profile.depths, values, depth);
  const activeX   = pL + ((activeV - vMin) / vRange) * iW;
  const activePct = (activeV - vMin) / vRange;

  // zone ticks on Y axis
  const yTicks = [0, 200, 500, 1000, 2000];
  // value ticks on X axis
  const xTicks = [vMin, (vMin + vMax) / 2, vMax];

  return (
    <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
      {/* Zone band backgrounds */}
      {ZONES.map((z) => {
        const y0 = pT + (z.minDepth / MAX_DEPTH) * iH;
        const bH = ((z.maxDepth - z.minDepth) / MAX_DEPTH) * iH;
        return (
          <rect
            key={z.name}
            x={pL}
            y={y0}
            width={iW}
            height={bH}
            fill={z.accentHex}
            opacity={0.07}
          />
        );
      })}

      {/* Chart border */}
      <rect x={pL} y={pT} width={iW} height={iH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Y axis ticks */}
      {yTicks.map((d) => {
        const y = pT + (d / MAX_DEPTH) * iH;
        return (
          <g key={d}>
            <line x1={pL - 3} y1={y} x2={pL} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <text x={pL - 5} y={y + 4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,0.45)" fontFamily="monospace">
              {d === 0 ? 'SFC' : d}
            </text>
          </g>
        );
      })}

      {/* X axis labels */}
      {xTicks.map((v, i) => {
        const x = pL + ((v - vMin) / vRange) * iW;
        return (
          <text key={i} x={x} y={H - 5} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
            {v.toFixed(1)}
          </text>
        );
      })}

      {/* Profile line — colored per segment */}
      {pts.slice(1).map((p, i) => (
        <line
          key={i}
          x1={pts[i].x} y1={pts[i].y}
          x2={p.x}       y2={p.y}
          stroke={valueToHsl((pts[i].t + p.t) / 2, variable)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      ))}

      {/* Data dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={valueToHsl(p.t, variable)} />
      ))}

      {/* Active depth crosshair */}
      <line x1={pL} y1={depthY} x2={W - pR} y2={depthY} stroke="#00efff" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />
      {/* Active value dot */}
      <circle cx={activeX} cy={depthY} r="5"   fill={valueToHsl(activePct, variable)} opacity="0.95" />
      <circle cx={activeX} cy={depthY} r="9"   fill="none" stroke={valueToHsl(activePct, variable)} strokeWidth="1" opacity="0.4" />
      <circle cx={activeX} cy={depthY} r="5"   fill="none" stroke="#00efff" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}

// ─── OceanCutawayPanel ─────────────────────────────────────────────────────────
export function OceanCutawayPanel() {
  const focusLat  = useConsoleStore((s) => s.focusLat);
  const focusLon  = useConsoleStore((s) => s.focusLon);
  const depth     = useConsoleStore((s) => s.depth);
  const setDepth  = useConsoleStore((s) => s.setDepth);
  const clearFocus = useConsoleStore((s) => s.clearFocusPoint);

  const [variable, setVariable] = useState<'temperature' | 'salinity'>('temperature');
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(false);

  // ─ Three.js refs (never stored in React state to avoid re-renders) ──────────
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const rendererRef    = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef      = useRef<THREE.OrthographicCamera | null>(null);
  const sceneRef       = useRef<THREE.Scene | null>(null);
  const frameRef       = useRef<number>(0);
  const bgMatRef       = useRef<THREE.ShaderMaterial | null>(null);
  const indicatorRef   = useRef<{ main: THREE.Mesh; glow: THREE.Mesh } | null>(null);
  const waveRef        = useRef<THREE.Line | null>(null);
  const depthRef       = useRef(0);   // mirrored from store for animation loop
  const aspectRef      = useRef(1);

  // Particle data stored entirely in refs
  const particlesRef = useRef<Array<{
    mesh: THREE.Points;
    positions: Float32Array;   // same buffer as BufferAttribute — mutated in place
    velocities: Float32Array;
    minY: number;
    maxY: number;
    count: number;
  }>>([]);

  const isOpen = focusLat !== null && focusLon !== null;

  // ── Mirror depth to ref for animation loop ──────────────────────────────────
  useEffect(() => { depthRef.current = depth; }, [depth]);

  // ── Fetch profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) { setProfile(null); return; }
    setLoading(true);
    fetch(`/api/column?lat=${focusLat}&lon=${focusLon}`)
      .then((r) => r.json())
      .then((d: Profile) => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [focusLat, focusLon, isOpen]);

  // ── Three.js scene (initialise once) ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Size & camera
    const W = canvas.clientWidth  || 480;
    const H = canvas.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false);
    const aspect = W / H;
    aspectRef.current = aspect;

    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, -10, 10);
    camera.position.z = 5;
    cameraRef.current = camera;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ────────────────────────────────────────────────────────────────────────────
    // Background gradient shader
    // ────────────────────────────────────────────────────────────────────────────
    const bgVert = /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const bgFrag = /* glsl */`
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        float d = 1.0 - vUv.y;        // 0 = surface, 1 = seabed

        // Zone colours (HSL → RGB baked)
        vec3 sunlit    = vec3(0.030, 0.52,  0.73);   // bright teal-blue
        vec3 twilight  = vec3(0.020, 0.17,  0.50);   // mid navy
        vec3 midnight  = vec3(0.012, 0.065, 0.24);   // deep navy
        vec3 abyss     = vec3(0.006, 0.020, 0.09);   // near-black

        float ep = 200.0 / 2000.0;    // 0.1
        float ms = 1000.0 / 2000.0;   // 0.5

        vec3 color;
        if (d < ep) {
          color = mix(sunlit,   twilight,  smoothstep(0.0, 1.0, d / ep));
        } else if (d < ms) {
          color = mix(twilight, midnight,  smoothstep(0.0, 1.0, (d - ep) / (ms - ep)));
        } else {
          color = mix(midnight, abyss,     smoothstep(0.0, 1.0, (d - ms) / (1.0 - ms)));
        }

        // Caustic shimmer in the sunlit zone
        if (d < ep) {
          float c1 = sin(vUv.x * 22.0 + uTime * 1.9) * sin(vUv.x * 8.3 - uTime * 1.1);
          float shimmer = c1 * 0.5 + 0.5;
          float fade = 1.0 - d / ep;
          color += vec3(0.04, 0.10, 0.15) * shimmer * fade;
        }

        // Faint horizontal scan grid (sonar feel)
        float grid = sin(d * 420.0) * 0.5 + 0.5;
        float gridAmt = pow(grid, 28.0) * 0.018 * (1.0 - d);
        color += vec3(gridAmt * 0.4, gridAmt * 0.8, gridAmt);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const bgMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: bgVert,
      fragmentShader: bgFrag,
    });
    bgMatRef.current = bgMat;
    const bgGeo = new THREE.PlaneGeometry(20, 2);
    const bg    = new THREE.Mesh(bgGeo, bgMat);
    bg.position.z = -2;
    scene.add(bg);

    // ── Zone separator lines ─────────────────────────────────────────────────
    ([200, 1000] as const).forEach((depthM, i) => {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10, yFromDepth(depthM), 0),
        new THREE.Vector3( 10, yFromDepth(depthM), 0),
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: 0x4a9fd4,
        transparent: true,
        opacity: i === 0 ? 0.30 : 0.20,
      });
      scene.add(new THREE.Line(geo, mat));
    });

    // ── Light rays (surface → mid-water) ────────────────────────────────────
    const rayCount = 7;
    for (let i = 0; i < rayCount; i++) {
      const xCenter    = (i / (rayCount - 1) - 0.5) * 3.2 * aspect;
      const topWidth   = 0.008 * aspect;
      const bottomWidth= (0.35 + Math.random() * 0.25) * aspect;
      const rayBottom  = yFromDepth((0.45 + Math.random() * 0.35) * MAX_DEPTH);

      const verts = new Float32Array([
        xCenter - topWidth,    yFromDepth(0),   -0.5,
        xCenter + topWidth,    yFromDepth(0),   -0.5,
        xCenter + bottomWidth, rayBottom,        -0.5,
        xCenter - bottomWidth, rayBottom,        -0.5,
      ]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      geo.setIndex([0, 1, 2,  0, 2, 3]);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xd0fbff,
        transparent: true,
        opacity: 0.022 + Math.random() * 0.018,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(geo, mat));
    }

    // ── Particles ─────────────────────────────────────────────────────────────
    const particleZones = [
      { count: 110, minDepth:    0, maxDepth:  200, color: 0x7eecff, size: 2.6, opacity: 0.72 },
      { count: 190, minDepth:  200, maxDepth: 1000, color: 0x4a9fd4, size: 1.9, opacity: 0.50 },
      { count:  90, minDepth: 1000, maxDepth: 2000, color: 0x1e4080, size: 1.3, opacity: 0.38 },
    ];

    particlesRef.current = [];

    particleZones.forEach(({ count, minDepth, maxDepth, color, size, opacity }) => {
      const yMin = yFromDepth(maxDepth);
      const yMax = yFromDepth(minDepth);
      // Positions & velocities — single typed array, mutated directly in loop
      const positions  = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 2); // vx, vy

      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 5;
        positions[i * 3 + 1] = yMin + Math.random() * (yMax - yMin);
        positions[i * 3 + 2] = 0;
        velocities[i * 2]    = (Math.random() - 0.5) * 0.00012;
        velocities[i * 2 + 1]= -(Math.random() * 0.00018 + 0.00006);
      }

      const geo = new THREE.BufferGeometry();
      // Important: pass the same Float32Array — we will mutate it directly
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        sizeAttenuation: false, depthWrite: false,
      });

      const mesh = new THREE.Points(geo, mat);
      scene.add(mesh);
      particlesRef.current.push({ mesh, positions, velocities, minY: yMin, maxY: yMax, count });
    });

    // ── Surface wave ─────────────────────────────────────────────────────────
    const WAVE_COUNT = 130;
    const wavePos = new Float32Array(WAVE_COUNT * 3);
    for (let i = 0; i < WAVE_COUNT; i++) {
      wavePos[i * 3]     = -6 * aspect + (i / (WAVE_COUNT - 1)) * 12 * aspect;
      wavePos[i * 3 + 1] = 1.0;
      wavePos[i * 3 + 2] = 0.5;
    }
    const waveGeo  = new THREE.BufferGeometry();
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
    const waveMesh = new THREE.Line(
      waveGeo,
      new THREE.LineBasicMaterial({ color: 0x80f4ff, transparent: true, opacity: 0.9 }),
    );
    scene.add(waveMesh);
    waveRef.current = waveMesh;

    // ── Depth indicator (main line + glow) ──────────────────────────────────
    const mkPlane = (height: number, color: number, opacity: number, z: number) => {
      const geo = new THREE.PlaneGeometry(20, height);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      const m   = new THREE.Mesh(geo, mat);
      m.position.z = z;
      scene.add(m);
      return m;
    };
    const mainLine = mkPlane(0.005, 0x00efff, 0.95, 1.0);
    const glowLine = mkPlane(0.030, 0x00cfff, 0.14, 0.9);
    indicatorRef.current = { main: mainLine, glow: glowLine };

    // ── Seabed ────────────────────────────────────────────────────────────────
    const seabedGeo = new THREE.PlaneGeometry(20, 0.04);
    const seabedMesh = new THREE.Mesh(seabedGeo, new THREE.MeshBasicMaterial({ color: 0x1a1208 }));
    seabedMesh.position.set(0, -1.04, -0.5);
    scene.add(seabedMesh);
    const sbCount = 90;
    const sbPos   = new Float32Array(sbCount * 3);
    for (let i = 0; i < sbCount; i++) {
      sbPos[i * 3]     = -6 * aspect + (i / (sbCount - 1)) * 12 * aspect;
      sbPos[i * 3 + 1] = -1 + (Math.sin(i * 0.55) * 0.012 + Math.sin(i * 0.14) * 0.022);
      sbPos[i * 3 + 2] = 0.1;
    }
    const sbGeo = new THREE.BufferGeometry();
    sbGeo.setAttribute('position', new THREE.BufferAttribute(sbPos, 3));
    scene.add(
      new THREE.Line(sbGeo, new THREE.LineBasicMaterial({ color: 0x3d2510, transparent: true, opacity: 0.65 })),
    );

    // ── Animation loop ────────────────────────────────────────────────────────
    let time = 0;
    const waveSpan = 12 * aspect;

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Shader time
      if (bgMatRef.current) bgMatRef.current.uniforms.uTime.value = time;

      // Wave
      const wave = waveRef.current;
      if (wave) {
        const wAttr = wave.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < WAVE_COUNT; i++) {
          const x  = -waveSpan / 2 + (i / (WAVE_COUNT - 1)) * waveSpan;
          const nx = x / (waveSpan / 2);   // -1..1
          const y  = 1
            + Math.sin(nx * 9   + time * 2.1) * 0.012
            + Math.sin(nx * 3.7 - time * 1.2) * 0.009
            + Math.sin(nx * 1.5 + time * 0.6) * 0.006;
          wAttr.setY(i, y);
        }
        wAttr.needsUpdate = true;
      }

      // Particles
      particlesRef.current.forEach((pd) => {
        const { positions, velocities, mesh, minY, maxY, count } = pd;
        for (let i = 0; i < count; i++) {
          positions[i * 3]     += velocities[i * 2]     + Math.sin(time * 0.6 + i * 1.4) * 0.00035;
          positions[i * 3 + 1] += velocities[i * 2 + 1] + Math.cos(time * 0.4 + i * 0.9) * 0.00008;
          // Wrap X
          if (positions[i * 3] >  5) positions[i * 3] = -5;
          if (positions[i * 3] < -5) positions[i * 3] =  5;
          // Wrap Y within zone
          if (positions[i * 3 + 1] < minY) {
            positions[i * 3 + 1] = maxY - Math.random() * 0.04;
          }
        }
        (mesh.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      });

      // Depth indicator
      const yPos = yFromDepth(depthRef.current);
      if (indicatorRef.current) {
        indicatorRef.current.main.position.y = yPos;
        indicatorRef.current.glow.position.y = yPos;
      }

      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
    animate();

    // ── Resize observer ───────────────────────────────────────────────────────
    const container = canvas.parentElement;
    const ro = container
      ? new ResizeObserver(() => {
          const nW = canvas.parentElement?.clientWidth  ?? W;
          const nH = canvas.parentElement?.clientHeight ?? H;
          renderer.setSize(nW, nH, false);
          const na = nW / nH;
          aspectRef.current = na;
          camera.left  = -na;
          camera.right =  na;
          camera.updateProjectionMatrix();
        })
      : null;
    ro?.observe(container!);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro?.disconnect();
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current    = null;
    };
  }, []); // init once

  // ── Close / canvas click ───────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    clearFocus();
    setDepth(0);
  }, [clearFocus, setDepth]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relY    = (e.clientY - rect.top) / rect.height;
      const clicked = Math.round((relY * MAX_DEPTH) / 25) * 25; // snap to 25 m
      setDepth(Math.max(0, Math.min(MAX_DEPTH, clicked)));
    },
    [setDepth],
  );

  // ── Derived display values ─────────────────────────────────────────────────
  const zone      = getZone(depth);
  const depthPct  = (depth / MAX_DEPTH) * 100;

  const tempVal   = profile ? interpolate(profile.depths, profile.temperature, depth) : null;
  const salVal    = profile ? interpolate(profile.depths, profile.salinity,    depth) : null;




  // Left colour-bar gradient
  const gradientCss = useMemo(() => {
    if (!profile) return 'transparent';
    const vals  = variable === 'temperature' ? profile.temperature : profile.salinity;
    const range = variable === 'temperature' ? profile.tempRange    : profile.salinityRange;
    const [vMin, vMax] = range;
    const vRange = vMax - vMin + 0.0001;
    const stops = profile.depths.map((d, i) => {
      const t   = (vals[i] - vMin) / vRange;
      const pct = (d / MAX_DEPTH) * 100;
      return `${valueToHsl(t, variable)} ${pct.toFixed(1)}%`;
    });
    return `linear-gradient(to bottom, ${stops.join(', ')})`;
  }, [profile, variable]);

  const latStr = focusLat !== null
    ? `${Math.abs(focusLat).toFixed(3)}°${focusLat >= 0 ? 'N' : 'S'}`
    : '';
  const lonStr = focusLon !== null
    ? `${Math.abs(focusLon).toFixed(3)}°${focusLon >= 0 ? 'E' : 'W'}`
    : '';

  // ── Panel container (always mounted, slides in/out via CSS) ──────────────────
  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-50"
      style={{
        width: 488,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
      }}
    >
      {/* ── Three.js canvas fills entire panel ──────────────────────────────── */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
        }}
      />

      {/* ── Left colour-gradient bar ─────────────────────────────────────────── */}
      <div
        className="absolute left-0 top-14 bottom-0 z-10 pointer-events-none"
        style={{ width: 7, background: gradientCss }}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4"
        style={{
          height: 56,
          background: 'rgba(2, 8, 28, 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(76, 224, 210, 0.12)',
          borderLeft: '1px solid rgba(76, 224, 210, 0.10)',
        }}
      >
        {/* Title + coordinate */}
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.6rem', letterSpacing: '0.18em', color: '#4CE0D2', opacity: 0.7, textTransform: 'uppercase', marginBottom: 2 }}>
            Ocean Cross-Section
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.8rem', color: '#d4f0f5', fontWeight: 500, letterSpacing: '0.04em' }}>
            📍 {latStr} &nbsp; {lonStr}
          </div>
        </div>

        {/* Variable tabs */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setVariable('temperature')}
            onMouseEnter={(e) => { if (variable !== 'temperature') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={(e) => { if (variable !== 'temperature') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; } }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 6, fontFamily: 'IBM Plex Mono',
              fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
              background: variable === 'temperature' ? 'rgba(234, 100, 30, 0.15)' : 'transparent',
              border: `1px solid ${variable === 'temperature' ? 'rgba(234, 100, 30, 0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: variable === 'temperature' ? '#f8943c' : 'rgba(255,255,255,0.35)',
            }}
          >
            <Thermometer size={11} />
            Temp
          </button>
          <button
            onClick={() => setVariable('salinity')}
            onMouseEnter={(e) => { if (variable !== 'salinity') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={(e) => { if (variable !== 'salinity') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; } }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 6, fontFamily: 'IBM Plex Mono',
              fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s',
              background: variable === 'salinity' ? 'rgba(130, 80, 220, 0.15)' : 'transparent',
              border: `1px solid ${variable === 'salinity' ? 'rgba(130, 80, 220, 0.35)' : 'rgba(255,255,255,0.08)'}`,
              color: variable === 'salinity' ? '#a87ee0' : 'rgba(255,255,255,0.35)',
            }}
          >
            <Droplets size={11} />
            Sal
          </button>
        </div>

        {/* Close */}
        <button
          onClick={handleClose}
          aria-label="Close ocean cutaway"
          style={{
            width: 30, height: 30, borderRadius: 6, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', background: 'transparent', border: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          <X size={15} />
        </button>
      </header>

      {/* ── Zone labels (overlaid on Three.js canvas) ────────────────────────── */}
      <div className="absolute z-10 pointer-events-none" style={{ top: 56, left: 10, right: 0, bottom: 0 }}>
        {ZONES.map((z) => {
          const topPct = (z.minDepth / MAX_DEPTH) * 100;
          return (
            <div
              key={z.name}
              className="absolute pointer-events-none flex flex-col items-start"
              style={{ top: `${topPct}%`, left: 0, right: 0, paddingTop: z.minDepth === 0 ? 12 : 8 }}
            >
              {/* Faint border line for zones (except surface) */}
              {z.minDepth > 0 && (
                <div 
                  className="absolute left-0 right-0 h-px"
                  style={{ top: 0, background: `linear-gradient(90deg, rgba(${z.glowRgb}, 0.25) 0%, transparent 100%)` }} 
                />
              )}
              
              <div 
                className="inline-flex flex-col gap-0.5 rounded-r border-l-2 py-1.5 pl-3 pr-6 mt-1"
                style={{
                  background: `linear-gradient(90deg, rgba(${z.glowRgb}, 0.15) 0%, rgba(0,0,0,0) 100%)`,
                  borderLeftColor: z.accentHex,
                  backdropFilter: 'blur(2px)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'IBM Plex Mono', fontSize: '0.65rem',
                    fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: z.accentHex, textShadow: `0 0 10px rgba(${z.glowRgb},0.5)`,
                    lineHeight: 1,
                  }}
                >
                  {z.name}
                </div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Mono', fontSize: '0.55rem',
                    letterSpacing: '0.08em', color: z.accentHex, opacity: 0.65,
                    lineHeight: 1,
                  }}
                >
                  {z.alias}
                  {z.minDepth > 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
                      ({z.minDepth}m)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Depth indicator (HTML overlay matching Three.js line position) ──────── */}
      <div
        className="absolute right-0 z-20 pointer-events-none flex items-center"
        style={{
          left: 7,
          top: `calc(56px + ${depthPct}% * (100% - 56px) / 100)`,
          transform: 'translateY(-50%)',
          transition: 'top 0.08s linear',
        }}
      >
        <div
          className="flex-1 h-px"
          style={{ background: 'rgba(0, 239, 255, 0.55)' }}
        />
        <div
          style={{
            fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', fontWeight: 600,
            padding: '2px 7px', borderRadius: 4, marginLeft: 4, flexShrink: 0,
            background: 'rgba(0, 15, 30, 0.92)',
            border: '1px solid rgba(0, 239, 255, 0.45)',
            color: '#00efff',
            boxShadow: '0 0 8px rgba(0, 239, 255, 0.2)',
          }}
        >
          {depth} m
        </div>
      </div>

      {/* ── Bottom info panel ─────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{
          background: 'rgba(1, 6, 22, 0.90)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(76, 224, 210, 0.12)',
          borderLeft: '1px solid rgba(76, 224, 210, 0.08)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.8rem', color: 'rgba(76,224,210,0.5)', letterSpacing: '0.08em' }} className="animate-pulse">
              Sounding depth profile…
            </div>
          </div>
        ) : (
          <div style={{ padding: '14px 14px 14px 18px', display: 'flex', gap: 14 }}>

            {/* ── Left: data + controls ──────────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Zone badge + desc */}
              <div>
                <div
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '3px 8px', borderRadius: 4, marginBottom: 4,
                    background: `rgba(${zone.glowRgb}, 0.10)`,
                    border: `1px solid rgba(${zone.glowRgb}, 0.25)`,
                    color: zone.accentHex,
                    fontFamily: 'IBM Plex Mono', fontSize: '0.62rem',
                    fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: zone.accentHex,
                      boxShadow: `0 0 6px ${zone.accentHex}`,
                      flexShrink: 0,
                    }}
                  />
                  {zone.name}
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.45 }}>
                  {zone.desc}
                </div>
              </div>

              {/* Temperature & Salinity readouts — always both shown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {/* Temperature card */}
                <div
                  style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: variable === 'temperature' ? 'rgba(234,100,30,0.10)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${variable === 'temperature' ? 'rgba(234,100,30,0.28)' : 'rgba(255,255,255,0.07)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onClick={() => setVariable('temperature')}
                  onMouseEnter={(e) => { if (variable !== 'temperature') { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; } }}
                  onMouseLeave={(e) => { if (variable !== 'temperature') { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                >
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                    Temperature
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span
                      style={{
                        fontFamily: 'IBM Plex Mono', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1,
                        color: tempVal !== null && profile
                          ? valueToHsl((tempVal - profile.tempRange[0]) / (profile.tempRange[1] - profile.tempRange[0] + 0.0001), 'temperature')
                          : '#fff',
                      }}
                    >
                      {tempVal !== null ? tempVal.toFixed(1) : '—'}
                    </span>
                    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>°C</span>
                  </div>
                </div>

                {/* Salinity card */}
                <div
                  style={{
                    padding: '8px 10px', borderRadius: 6,
                    background: variable === 'salinity' ? 'rgba(130,80,220,0.10)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${variable === 'salinity' ? 'rgba(130,80,220,0.28)' : 'rgba(255,255,255,0.07)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onClick={() => setVariable('salinity')}
                  onMouseEnter={(e) => { if (variable !== 'salinity') { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; } }}
                  onMouseLeave={(e) => { if (variable !== 'salinity') { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                >
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                    Salinity
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span
                      style={{
                        fontFamily: 'IBM Plex Mono', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1,
                        color: salVal !== null && profile
                          ? valueToHsl((salVal - profile.salinityRange[0]) / (profile.salinityRange[1] - profile.salinityRange[0] + 0.0001), 'salinity')
                          : '#fff',
                      }}
                    >
                      {salVal !== null ? salVal.toFixed(2) : '—'}
                    </span>
                    <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>PSU</span>
                  </div>
                </div>
              </div>

              {/* Zone fact chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {zone.facts.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontFamily: 'IBM Plex Mono', fontSize: '0.55rem',
                      padding: '2px 7px', borderRadius: 3,
                      background: `rgba(${zone.glowRgb}, 0.08)`,
                      border: `1px solid rgba(${zone.glowRgb}, 0.2)`,
                      color: zone.accentHex, opacity: 0.8,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Depth slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                    Depth
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.72rem', fontWeight: 700, color: '#00efff' }}>
                    {depth} m
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={MAX_DEPTH}
                  step={25}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00efff', height: 4, borderRadius: 4, cursor: 'pointer', display: 'block', marginBottom: 6 }}
                />
                {/* Preset buttons */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {DEPTH_PRESETS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDepth(d)}
                      style={{
                        fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', fontWeight: 600,
                        padding: '4px 9px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.18s',
                        background: depth === d ? 'rgba(0,239,255,0.20)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${depth === d ? 'rgba(0,239,255,0.45)' : 'rgba(255,255,255,0.15)'}`,
                        color: depth === d ? '#00efff' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {d === 0 ? 'SFC' : `${d}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Click hint */}
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', letterSpacing: '0.06em', marginTop: 4 }}>
                Click scene to set depth · Drag slider to explore
              </div>
            </div>

            {/* ── Right: sparkline profile chart ──────────────────────────────── */}
            {profile && (
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', textAlign: 'center', marginBottom: 4 }}>
                  {variable === 'temperature' ? 'Temp (°C)' : 'Salinity (PSU)'}
                </div>
                <SparklineChart profile={profile} variable={variable} depth={depth} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
