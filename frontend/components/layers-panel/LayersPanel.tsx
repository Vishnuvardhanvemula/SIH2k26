'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { VariableSelect } from './VariableSelect';
import { ObservationToggles } from './ObservationToggles';
import { ColormapControl } from './ColormapControl';

export function LayersPanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative h-full flex">
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="
          absolute -right-3 top-1/2 -translate-y-1/2 z-10
          w-5 h-8 flex items-center justify-center
          bg-deep-panel border border-thermocline/35 rounded-r
          text-foam-dim hover:text-biolume transition-colors
          focus:outline-none focus:ring-2 focus:ring-biolume/40
        "
        aria-label={collapsed ? 'Expand layers panel' : 'Collapse layers panel'}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {!collapsed && (
        <GlassPanel className="w-52 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-thermocline/25 shrink-0">
            <Layers size={13} className="text-biolume" aria-hidden="true" />
            <span className="font-display text-xs font-semibold text-foam tracking-wide">
              LAYERS
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto console-scroll px-3 py-3 flex flex-col gap-5">
            <VariableSelect />
            <div className="w-full h-px bg-thermocline/20" role="separator" />
            <ObservationToggles />
            <div className="w-full h-px bg-thermocline/20" role="separator" />
            <ColormapControl />
          </div>

          {/* Demo badge */}
          <div className="px-3 py-2 border-t border-thermocline/20 shrink-0">
            <span className="font-mono text-2xs text-foam-dim/50 tracking-widest">
              ⚑ DEMO DATA — INCOIS
            </span>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
