import { NextRequest, NextResponse } from 'next/server';
import matchup from '@/lib/fixtures/matchup.json';

export async function GET(
  _request: NextRequest,
  { params }: { params: { floatId: string } }
) {
  const { floatId } = params;

  await new Promise((r) => setTimeout(r, 120));

  return NextResponse.json({ ...matchup, floatId, _demo: true });
}
