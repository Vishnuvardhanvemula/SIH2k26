import { NextRequest, NextResponse } from 'next/server';

// Standard oceanographic depth levels (metres)
const DEPTH_LEVELS = [0, 25, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];

/**
 * GET /api/column?lat=&lon=&variable=temperature|salinity
 * Returns a vertical profile at the given coordinate.
 * Data is mock / demo-quality — follows realistic thermocline/halocline curves.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat  = parseFloat(searchParams.get('lat')  ?? '10');
  const lon  = parseFloat(searchParams.get('lon')  ?? '80');
  const variable = (searchParams.get('variable') ?? 'temperature') as 'temperature' | 'salinity';

  // Seed a deterministic "noise" value from the lat/lon so different points
  // give slightly different profiles.
  const seed = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const noise = (seed - Math.floor(seed)); // 0..1

  const values = DEPTH_LEVELS.map((d) => {
    if (variable === 'temperature') {
      // Surface ~28-30°C, thermocline 100-500m, deep ~4°C
      const surface = 28 + noise * 3;
      const deep    = 3.5 + noise * 1.5;
      const decay   = Math.exp(-d / 300);
      return parseFloat((deep + (surface - deep) * decay + (Math.random() - 0.5) * 0.4).toFixed(2));
    } else {
      // Salinity: surface freshened ~34.5, halocline ~200m peaks at 36, deep ~34.8
      const base = 34.5 + noise * 0.8;
      const halocline = 1.4 * Math.exp(-((d - 150) ** 2) / (2 * 120 ** 2));
      return parseFloat((base + halocline + (Math.random() - 0.5) * 0.15).toFixed(2));
    }
  });

  // Colour range for legend
  const colorRange: [number, number] = variable === 'temperature'
    ? [Math.min(...values), Math.max(...values)]
    : [Math.min(...values), Math.max(...values)];

  await new Promise((r) => setTimeout(r, 60)); // simulate network

  return NextResponse.json({
    lat, lon, variable,
    depths: DEPTH_LEVELS,
    values,
    colorRange,
    unit: variable === 'temperature' ? '°C' : 'PSU',
    _demo: true,
  });
}
