// Shared TypeScript types matching the backend API contract
// DEMO: All types are built against mock fixtures first

export type Variable = 'temperature' | 'salinity';
export type Mode = 'surface' | 'cutaway' | 'dive';
export type ObservationType = 'argo' | 'glider' | 'buoy';
export type QCStatus = 'ACCEPTED' | 'PROVISIONAL' | 'FAILED' | 'UNKNOWN';

// GET /api/field
export interface FieldResponse {
  variable: Variable;
  depth: number;
  time: string;
  bbox: [number, number, number, number]; // [lonMin, latMin, lonMax, latMax]
  colorRange: [number, number];
  lat: number[];
  lon: number[];
  grid: number[][]; // grid[latIdx][lonIdx]
  u?: number[][]; // u-velocity component (east/west)
  v?: number[][]; // v-velocity component (north/south)
}

// GET /api/observations
export interface Observation {
  id: string;
  lat: number;
  lon: number;
  lastSurfaced: string; // ISO timestamp
  platform: ObservationType;
  qcStatus: QCStatus;
  hasAnomaly: boolean;
  depth: number; // last known depth in meters
}

// GET /api/profile/{floatId}
export interface ProfileResponse {
  floatId: string;
  lat: number;
  lon: number;
  lastSurfaced: string;
  qcStatus: QCStatus;
  depths: number[];
  temperature: number[];
  salinity: number[];
  qc: string[];
}

// GET /api/matchup/{floatId}
export interface MatchupResponse {
  floatId: string;
  depths: number[];
  observed: number[];
  model: number[];
  delta: number[];
  unit: string;
}

// UI-internal types
export interface ColormapConfig {
  name: string;
  min: number;
  max: number;
  opacity: number;
}

export interface PlaybackConfig {
  isPlaying: boolean;
  speed: number; // 0.5 | 1 | 2
}
