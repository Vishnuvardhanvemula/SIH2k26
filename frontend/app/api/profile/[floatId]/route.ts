import { NextRequest, NextResponse } from 'next/server';
import profile from '@/lib/fixtures/profile.json';

export async function GET(
  _request: NextRequest,
  { params }: { params: { floatId: string } }
) {
  const { floatId } = params;

  await new Promise((r) => setTimeout(r, 100));

  // Return the fixture regardless of floatId for demo purposes
  return NextResponse.json({ ...profile, floatId, _demo: true });
}
