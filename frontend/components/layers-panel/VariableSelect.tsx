'use client';

import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Eye, EyeOff, Thermometer, Droplets, Wind } from 'lucide-react';
import type { Variable } from '@/lib/api/types';

const SCALAR_VARIABLES: { id: Variable; label: string; icon: React.ReactNode; unit: string }[] = [
  { id: 'temperature', label: 'Temperature', icon: <Thermometer size={12} />, unit: '°C' },
  { id: 'salinity', label: 'Salinity', icon: <Droplets size={12} />, unit: 'PSU' },
];

export function VariableSelect() {
  const variable = useConsoleStore((s) => s.variable);
  const setVariable = useConsoleStore((s) => s.setVariable);
  const isModelFieldVisible = useConsoleStore((s) => s.isModelFieldVisible);
  const toggleModelFieldVisibility = useConsoleStore((s) => s.toggleModelFieldVisibility);
  const showCurrents = useConsoleStore((s) => s.showCurrents);
  const toggleCurrents = useConsoleStore((s) => s.toggleCurrents);

  return (
    <div className="flex flex-col gap-4">
      {/* SCALAR BASE LAYER */}
      <div role="radiogroup" aria-label="Select base scalar field">
        <div className="flex items-center justify-between mb-2">
          <p className="label-ui">Base Field</p>
          <button
            onClick={toggleModelFieldVisibility}
            className="text-foam-dim hover:text-foam focus:outline-none transition-colors"
            aria-label={isModelFieldVisible ? 'Hide Base Field' : 'Show Base Field'}
            title={isModelFieldVisible ? 'Hide Base Field' : 'Show Base Field'}
          >
            {isModelFieldVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {SCALAR_VARIABLES.map((v) => {
            const active = variable === v.id;
            return (
              <button
                key={v.id}
                role="radio"
                aria-checked={active}
                onClick={() => setVariable(v.id)}
                className={`
                  relative flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs
                  border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-biolume/40
                  ${active
                    ? 'bg-deep-panel border-biolume/50 text-biolume shadow-[inset_2px_0_0_var(--biolume)]'
                    : 'bg-transparent border-thermocline/20 text-foam-dim hover:text-foam hover:border-thermocline/40'
                  }
                `}
              >
                {/* LED Indicator */}
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${active ? 'bg-biolume shadow-[0_0_8px_var(--biolume)]' : 'bg-deep-panel border border-thermocline/50'}`} />
                
                <span className={active ? 'text-biolume' : 'text-foam-dim'} aria-hidden="true">
                  {v.icon}
                </span>
                <span className="font-ui tracking-wide">{v.label}</span>
                <span className="ml-auto font-mono text-[0.55rem] text-foam-dim/50">{v.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VECTOR OVERLAYS */}
      <div role="group" aria-label="Toggle vector overlays">
        <p className="label-ui mb-2">Overlays</p>
        <button
          role="switch"
          aria-checked={showCurrents}
          onClick={toggleCurrents}
          className={`
            relative w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs
            border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-biolume/40
            ${showCurrents
              ? 'bg-deep-panel border-biolume/50 text-biolume shadow-[inset_2px_0_0_var(--biolume)]'
              : 'bg-transparent border-thermocline/20 text-foam-dim hover:text-foam hover:border-thermocline/40'
            }
          `}
        >
          {/* LED Indicator */}
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${showCurrents ? 'bg-biolume shadow-[0_0_8px_var(--biolume)]' : 'bg-deep-panel border border-thermocline/50'}`} />

          <span className={showCurrents ? 'text-biolume' : 'text-foam-dim'} aria-hidden="true">
            <Wind size={12} />
          </span>
          <span className="font-ui tracking-wide">Currents</span>
          <span className="ml-auto font-mono text-[0.55rem] text-foam-dim/50">Flow</span>
        </button>
      </div>
    </div>
  );
}
