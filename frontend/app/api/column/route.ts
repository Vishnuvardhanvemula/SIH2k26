import { NextRequest, NextResponse } from 'next/server';

// Standard oceanographic depth levels (metres)
const DEPTH_LEVELS = [0, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];

/**
 * GET /api/column?lat=&lon=
 * Returns a full vertical profile (temperature + salinity) at the given coordinate.
 * Data is mock / demo-quality following realistic oceanographic curves.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '10');
  const lon = parseFloat(searchParams.get('lon') ?? '80');

  // Deterministic noise seeded from lat/lon so each point gives a unique profile
  const seed  = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const noise = seed - Math.floor(seed); // 0..1

  // Temperature profile — thermocline between 100-500 m
  const temperature = DEPTH_LEVELS.map((d) => {
    const surface = 28 + noise * 3;           // 28-31 °C
    const deep    = 3.5 + noise * 1.5;        // 3.5-5 °C
    const decay   = Math.exp(-d / 300);
    return parseFloat(
      (deep + (surface - deep) * decay + (Math.random() - 0.5) * 0.4).toFixed(2),
    );
  });

  // Salinity profile — freshened surface, halocline ~150 m, deep ~34.8 PSU
  const salinity = DEPTH_LEVELS.map((d) => {
    const base      = 34.5 + noise * 0.8;
    const halocline = 1.4 * Math.exp(-((d - 150) ** 2) / (2 * 120 ** 2));
    return parseFloat(
      (base + halocline + (Math.random() - 0.5) * 0.15).toFixed(2),
    );
  });

  const tempRange: [number, number]     = [Math.min(...temperature), Math.max(...temperature)];
  const salinityRange: [number, number] = [Math.min(...salinity),    Math.max(...salinity)];

  await new Promise((r) => setTimeout(r, 60)); // simulate network latency

  return NextResponse.json({
    lat, lon,
    depths: DEPTH_LEVELS,
    temperature,
    salinity,
    tempRange,
    salinityRange,
    _demo: true,
  });
}
