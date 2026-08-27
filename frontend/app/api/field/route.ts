import { NextRequest, NextResponse } from 'next/server';
import fieldFixture from '@/lib/fixtures/field.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const variable = searchParams.get('variable') || 'temperature';
  const depth = Number(searchParams.get('depth') || 0);

  // Simulate depth-based temperature reduction
  const depthFactor = Math.max(0, 1 - depth / 2000);
  const grid = (fieldFixture.grid as number[][]).map((row) =>
    row.map((v) => parseFloat((v * depthFactor + (1 - depthFactor) * 4).toFixed(2)))
  );

  const colorMin = variable === 'salinity' ? 32 : parseFloat((fieldFixture.colorRange[0] * depthFactor + 2).toFixed(1));
  const colorMax = variable === 'salinity' ? 36 : parseFloat((fieldFixture.colorRange[1] * depthFactor + 4).toFixed(1));

  // Simulate slight network latency for realism
  await new Promise((r) => setTimeout(r, 80));

  return NextResponse.json({
    variable,
    depth,
    time: searchParams.get('time') || fieldFixture.time,
    bbox: fieldFixture.bbox,
    colorRange: [colorMin, colorMax],
    lat: fieldFixture.lat,
    lon: fieldFixture.lon,
    grid,
    _demo: true,
  });
}
