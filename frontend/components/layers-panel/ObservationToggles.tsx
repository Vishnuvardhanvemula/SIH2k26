'use client';

import { useConsoleStore } from '@/lib/store/useConsoleStore';
import type { ObservationType } from '@/lib/api/types';

const OBSERVATION_TYPES: { id: ObservationType; label: string; color: string }[] = [
  { id: 'argo', label: 'Argo Floats', color: 'bg-biolume' },
  { id: 'glider', label: 'Gliders', color: 'bg-instrument-amber' },
  { id: 'buoy', label: 'Buoys', color: 'bg-foam-dim' },
];

export function ObservationToggles() {
  const activeTypes = useConsoleStore((s) => s.activeObservationTypes);
  const toggleType = useConsoleStore((s) => s.toggleObservationType);

  return (
    <div role="group" aria-label="Observation type filters">
      <p className="label-ui mb-2">Observations</p>
      <div className="flex flex-col gap-1.5">
        {OBSERVATION_TYPES.map((type) => {
          const active = activeTypes.has(type.id);
          return (
            <button
              key={type.id}
              role="checkbox"
              aria-checked={active}
              onClick={() => toggleType(type.id)}
              className={`
                flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs
                border transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-biolume/40
                ${active
                  ? 'border-thermocline/40 bg-thermocline/10 text-foam'
                  : 'border-thermocline/15 bg-transparent text-foam-dim opacity-60'
                }
              `}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                  active ? type.color : 'bg-foam-dim/30'
                }`}
                aria-hidden="true"
              />
              <span className="font-ui">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
