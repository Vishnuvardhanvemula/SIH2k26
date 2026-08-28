'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, RefreshCw, Waves, MapPin, ArrowLeft } from 'lucide-react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { LiveReadout } from './LiveReadout';

interface TopBarProps {
  onSearchLocation?: (lat: number, lon: number, altitudeM?: number) => void;
  onReset?: () => void;
}

// ── Indian ocean/sea region pins ──────────────────────────────────────────────
const QUICK_PINS = [
  { label: 'Bay of Bengal',          lat: 14,  lon: 85,  alt: 2_500_000 },
  { label: 'Arabian Sea',            lat: 15,  lon: 65,  alt: 2_500_000 },
  { label: 'Andaman Sea',            lat: 10,  lon: 96,  alt: 1_500_000 },
  { label: 'Lakshadweep Sea',        lat: 12,  lon: 72,  alt: 1_200_000 },
  { label: 'Gulf of Mannar',         lat: 9,   lon: 79,  alt:   900_000 },
  { label: 'Palk Strait',            lat: 9.5, lon: 79.5,alt:   500_000 },
  { label: 'Gulf of Khambhat',       lat: 21,  lon: 72,  alt:   700_000 },
  { label: 'Gulf of Kutch',          lat: 22.5,lon: 69.5,alt:   600_000 },
];

export function TopBar({ onSearchLocation, onReset }: TopBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const resetView = useConsoleStore((s) => s.resetView);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? QUICK_PINS.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : QUICK_PINS;

  const selectPin = (lat: number, lon: number, label: string, alt: number) => {
    setQuery(label);
    setOpen(false);
    onSearchLocation?.(lat, lon, alt);
  };

  const handleReset = () => {
    resetView();
    onReset?.();
    setQuery('');
  };

  const showDropdown = open && filtered.length > 0;

  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 h-12 flex items-center px-4 gap-4
                 bg-abyss/85 backdrop-blur-md border-b border-thermocline/25"
      role="banner"
    >
      {/* Home Button & Wordmark */}
      <div className="flex items-center gap-4 shrink-0" aria-label="OceanRoot">
        <Link 
          href="/"
          className="flex items-center gap-1.5 text-foam-dim hover:text-white transition-colors"
          title="Back to Home"
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-xs uppercase tracking-widest hidden sm:inline-block">Home</span>
        </Link>
        
        <div className="w-px h-5 bg-thermocline/25" />

        <div className="flex items-center gap-2">
          <Waves size={18} className="text-biolume" aria-hidden="true" />
          <span className="font-display font-semibold text-sm text-foam tracking-wide">
            OCEANROOT
          </span>
          <span className="hidden lg:block text-2xs text-foam-dim tracking-widest uppercase font-mono ml-1">
            INCOIS
          </span>
        </div>
      </div>

      {/* Live readout — center */}
      <div className="flex-1 flex items-center justify-center">
        <LiveReadout />
      </div>

      {/* Region search */}
      <div className="relative shrink-0" role="search">
        <label htmlFor="region-search" className="sr-only">Search ocean region or location</label>

        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-foam-dim pointer-events-none" aria-hidden="true" />
          <input
            ref={inputRef}
            id="region-search"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
            }}
            placeholder="Search region…"
            className="
              w-44 h-7 pl-7 pr-2 rounded text-xs font-mono
              bg-deep-panel/70 border border-thermocline/30
              text-foam placeholder:text-foam-dim/50
              focus:outline-none focus:border-biolume/50 focus:ring-1 focus:ring-biolume/25
              transition-all duration-200
            "
            aria-label="Search ocean region"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <ul
            id="search-suggestions"
            className="
              absolute top-full right-0 mt-1 w-56
              bg-[#07111f] border border-[#1a3050]
              rounded-lg overflow-y-auto z-50
              shadow-[0_8px_32px_rgba(0,0,0,0.7)]
              max-h-64
            "
            role="listbox"
            aria-label="Ocean region suggestions"
          >
            <li className="px-3 py-2 text-[10px] font-mono tracking-widest uppercase text-[#4a7090] border-b border-[#1a3050] select-none">
              Ocean Regions
            </li>
            {filtered.map((pin) => (
              <li key={pin.label} role="option" aria-selected={false}>
                <button
                  className="
                    w-full text-left px-3 py-2.5 text-xs font-ui
                    text-[#8ab4cc] hover:text-white hover:bg-[#0f2035]
                    focus:outline-none focus:bg-[#0f2035] focus:text-white
                    transition-colors duration-100
                    border-b border-[#0e1e30] last:border-0
                    flex items-center gap-2.5
                  "
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPin(pin.lat, pin.lon, pin.label, pin.alt)}
                >
                  <MapPin size={10} className="text-[#2a8fa8] shrink-0" />
                  {pin.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reset view */}
      <button
        onClick={handleReset}
        className="
          shrink-0 w-7 h-7 flex items-center justify-center rounded
          border border-thermocline/30 text-foam-dim
          hover:text-biolume hover:border-biolume/40
          focus:outline-none focus:ring-2 focus:ring-biolume/40
          transition-colors
        "
        aria-label="Reset to Indian Ocean overview"
        title="Reset view"
      >
        <RefreshCw size={12} aria-hidden="true" />
      </button>
    </header>
  );
}
