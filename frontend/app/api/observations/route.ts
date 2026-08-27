import { NextRequest, NextResponse } from 'next/server';
import observations from '@/lib/fixtures/observations.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const types = searchParams.getAll('type');

  const filtered =
    types.length === 0
      ? observations
      : observations.filter((o) => types.includes(o.platform));

  await new Promise((r) => setTimeout(r, 60));

  return NextResponse.json(filtered.map((o) => ({ ...o, _demo: true })));
}
