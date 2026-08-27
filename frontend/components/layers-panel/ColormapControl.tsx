'use client';

import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { colormapToGradient } from '@/lib/cesium/colormaps';
import type { ColormapName } from '@/lib/cesium/colormaps';
import { MonoValue } from '@/components/shared/MonoValue';

export function ColormapControl() {
  const colormap = useConsoleStore((s) => s.colormap);
  const setColormap = useConsoleStore((s) => s.setColormap);

  const currentGradient = colormapToGradient(colormap.name as ColormapName);

  return (
    <div className="flex flex-col gap-4">
      {/* Colormap selection removed to enforce strict scientific defaults */}

      {/* Range display */}
      <div className="relative">
        <p className="label-ui mb-2 flex items-center justify-between">
          <span>Range Scale</span>
          <span className="font-mono text-2xs text-biolume/70 uppercase tracking-widest">{colormap.name}</span>
        </p>
        
        {/* Technical bracket frame around the gradient */}
        <div className="relative p-[2px] bg-deep-panel border border-thermocline/30 rounded-sm">
          <div
            className="h-2.5 w-full rounded-[1px] opacity-90"
            style={{ background: currentGradient }}
            aria-hidden="true"
          />
        </div>
        
        <div className="flex justify-between mt-1.5 px-0.5">
          <MonoValue value={colormap.min.toFixed(1)} size="xs" color="dim" />
          <MonoValue value={colormap.max.toFixed(1)} size="xs" color="dim" />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <p className="label-ui mb-2 flex items-center justify-between">
          <span>Field Opacity</span>
          <span className="text-foam font-mono text-xs">{Math.round(colormap.opacity * 100)}%</span>
        </p>
        <div className="relative flex items-center h-4">
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={colormap.opacity}
            onChange={(e) => setColormap({ opacity: parseFloat(e.target.value) })}
            className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
            aria-label={`Field opacity: ${Math.round(colormap.opacity * 100)}%`}
          />
          {/* Custom tech track */}
          <div className="w-full h-[2px] bg-thermocline/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-biolume shadow-[0_0_8px_var(--biolume)]" 
              style={{ width: `${colormap.opacity * 100}%` }}
            />
          </div>
          {/* Custom tech thumb */}
          <div 
            className="absolute h-3 w-1.5 bg-foam rounded-[1px] shadow-[0_0_5px_rgba(255,255,255,0.5)] pointer-events-none transition-all"
            style={{ left: `calc(${colormap.opacity * 100}% - 3px)` }}
          />
        </div>
      </div>
    </div>
  );
}
