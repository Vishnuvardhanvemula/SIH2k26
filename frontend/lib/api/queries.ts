import { useQuery } from '@tanstack/react-query';
import type {
  FieldResponse,
  Observation,
  ObservationType,
  ProfileResponse,
  MatchupResponse,
  Variable,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// ─── Field Query ─────────────────────────────────────────────────────────────
interface FieldParams {
  variable: Variable;
  depth: number;
  time: string;
  bbox?: [number, number, number, number];
}

async function fetchField(params: FieldParams): Promise<FieldResponse> {
  const bbox = params.bbox ?? [60, -10, 100, 25];
  const url = new URL(`${BASE_URL}/api/field`, window.location.href);
  url.searchParams.set('variable', params.variable);
  url.searchParams.set('depth', String(params.depth));
  url.searchParams.set('time', params.time);
  url.searchParams.set('bbox', bbox.join(','));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Field fetch failed: ${res.status}`);
  const data = await res.json() as FieldResponse;
  
  // Inject mock vector data (U and V) for currents overlay since our fixture lacks it
  const { lat, lon } = data;
  const u = [];
  const v = [];
  for (let i = 0; i < lat.length; i++) {
    const uRow = [];
    const vRow = [];
    for (let j = 0; j < lon.length; j++) {
      // Create a procedural swirl flow pattern
      const y = (lat[i] - 5) / 10;
      const x = (lon[j] - 80) / 10;
      uRow.push(-y * 1.5 + Math.sin(x) * 0.5); // East-West flow
      vRow.push(x * 1.5 + Math.cos(y) * 0.5);  // North-South flow
    }
    u.push(uRow);
    v.push(vRow);
  }
  data.u = u;
  data.v = v;

  return data;
}

export function useModelField(params: FieldParams) {
  return useQuery<FieldResponse, Error>({
    queryKey: ['model_field_v2', params.variable, params.depth, params.time, params.bbox],
    queryFn: () => fetchField(params),
    staleTime: 1000 * 60 * 5, // 5 min — field data doesn't change rapidly in demo
    placeholderData: (prev) => prev,
  });
}

// ─── Observations Query ───────────────────────────────────────────────────────
interface ObservationsParams {
  types: ObservationType[];
  bbox?: [number, number, number, number];
  time: string;
}

async function fetchObservations(params: ObservationsParams): Promise<Observation[]> {
  const bbox = params.bbox ?? [60, -10, 100, 25];
  const url = new URL(`${BASE_URL}/api/observations`, window.location.href);
  params.types.forEach((t) => url.searchParams.append('type', t));
  url.searchParams.set('bbox', bbox.join(','));
  url.searchParams.set('time', params.time);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Observations fetch failed: ${res.status}`);
  return res.json();
}

export function useObservations(params: ObservationsParams) {
  return useQuery<Observation[], Error>({
    queryKey: ['observations', params.types.sort().join(','), params.time, params.bbox],
    queryFn: () => fetchObservations(params),
    staleTime: 1000 * 60 * 2,
    enabled: params.types.length > 0,
    placeholderData: (prev) => prev,
  });
}

// ─── Profile Query ────────────────────────────────────────────────────────────
async function fetchProfile(floatId: string): Promise<ProfileResponse> {
  const res = await fetch(`${BASE_URL}/api/profile/${encodeURIComponent(floatId)}`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

export function useProfile(floatId: string | null) {
  return useQuery<ProfileResponse, Error>({
    queryKey: ['profile', floatId],
    queryFn: () => fetchProfile(floatId!),
    enabled: !!floatId,
    staleTime: 1000 * 60 * 10,
  });
}

// ─── Matchup Query ────────────────────────────────────────────────────────────
async function fetchMatchup(floatId: string): Promise<MatchupResponse> {
  const res = await fetch(`${BASE_URL}/api/matchup/${encodeURIComponent(floatId)}`);
  if (!res.ok) throw new Error(`Matchup fetch failed: ${res.status}`);
  return res.json();
}

export function useMatchup(floatId: string | null) {
  return useQuery<MatchupResponse, Error>({
    queryKey: ['matchup', floatId],
    queryFn: () => fetchMatchup(floatId!),
    enabled: !!floatId,
    staleTime: 1000 * 60 * 10,
  });
}
