import { create } from 'zustand';
import type { Variable, Mode, ObservationType, ColormapConfig, PlaybackConfig } from '../api/types';

export interface ConsoleState {
  // Field state
  variable: Variable;
  depth: number;
  time: string;
  mode: Mode;

  // Observation filters
  activeObservationTypes: Set<ObservationType>;

  // Selection
  selectedFloatId: string | null;

  // Colormap
  colormap: ColormapConfig;

  // Playback
  playback: PlaybackConfig;

  // Cursor readout (set by Cesium mouse move)
  cursorLat: number | null;
  cursorLon: number | null;

  // Focus point — clicked globe coordinate for depth column
  focusLat: number | null;
  focusLon: number | null;

  // Inspector open state
  inspectorOpen: boolean;
  
  // Visibility
  isModelFieldVisible: boolean;
  showCurrents: boolean;

  // Actions
  setVariable: (v: Variable) => void;
  setDepth: (d: number) => void;
  setTime: (t: string) => void;
  setMode: (m: Mode) => void;
  toggleObservationType: (t: ObservationType) => void;
  selectFloat: (id: string | null) => void;
  setColormap: (c: Partial<ColormapConfig>) => void;
  setPlayback: (p: Partial<PlaybackConfig>) => void;
  setCursor: (lat: number | null, lon: number | null) => void;
  setFocusPoint: (lat: number, lon: number) => void;
  clearFocusPoint: () => void;
  setInspectorOpen: (open: boolean) => void;
  toggleModelFieldVisibility: () => void;
  toggleCurrents: () => void;
  resetView: () => void;
}

const DEFAULT_TIME = '2026-08-01T00:00:00Z';

const DEFAULT_STATE = {
  variable: 'temperature' as Variable,
  depth: 0,
  time: DEFAULT_TIME,
  mode: 'surface' as Mode,
  activeObservationTypes: new Set<ObservationType>(['argo', 'glider', 'buoy']),
  selectedFloatId: null,
  colormap: {
    name: 'thermal',
    min: 20,
    max: 32,
    opacity: 0.75,
  },
  playback: {
    isPlaying: false,
    speed: 1,
  },
  cursorLat: null,
  cursorLon: null,
  focusLat: null,
  focusLon: null,
  inspectorOpen: false,
  isModelFieldVisible: true,
  showCurrents: false,
};

export const useConsoleStore = create<ConsoleState>()((set) => ({
  ...DEFAULT_STATE,

  setVariable: (variable) =>
    set((state) => {
      // Professionally recognized standard colormaps per variable
      const defaults = {
        temperature: { name: 'thermal' as const, min: 20, max: 32 },
        salinity: { name: 'haline' as const, min: 30, max: 38 },
      };
      return {
        variable,
        colormap: { ...state.colormap, ...defaults[variable] },
      };
    }),

  setDepth: (depth) => set({ depth }),

  setTime: (time) => set({ time }),

  setMode: (mode) => set({ mode }),

  toggleObservationType: (type) =>
    set((state) => {
      const next = new Set(state.activeObservationTypes);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return { activeObservationTypes: next };
    }),

  selectFloat: (id) =>
    set({
      selectedFloatId: id,
      inspectorOpen: id !== null,
      focusLat: null, // mutually exclusive with depth column HUD
      focusLon: null,
    }),

  setColormap: (partial) =>
    set((state) => ({
      colormap: { ...state.colormap, ...partial },
    })),

  setPlayback: (partial) =>
    set((state) => ({
      playback: { ...state.playback, ...partial },
    })),

  setCursor: (lat, lon) => set({ cursorLat: lat, cursorLon: lon }),

  setFocusPoint: (lat, lon) => set({ 
    focusLat: lat, 
    focusLon: lon,
    selectedFloatId: null, // mutually exclusive with float inspector
    inspectorOpen: true,   // open inspector for ocean-point data too
  }),

  clearFocusPoint: () => set({ focusLat: null, focusLon: null }),

  setInspectorOpen: (open) =>
    set((state) => ({
      inspectorOpen: open,
      selectedFloatId: open ? state.selectedFloatId : null,
    })),

  toggleModelFieldVisibility: () =>
    set((state) => ({ isModelFieldVisible: !state.isModelFieldVisible })),

  toggleCurrents: () =>
    set((state) => ({ showCurrents: !state.showCurrents })),

  resetView: () =>
    set({
      mode: 'surface',
      depth: 0,
      selectedFloatId: null,
      inspectorOpen: false,
      cursorLat: null,
      cursorLon: null,
      focusLat: null,
      focusLon: null,
    }),
}));
