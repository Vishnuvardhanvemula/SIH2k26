'use client';

import { useState } from 'react';
import { Search, RefreshCw, Waves } from 'lucide-react';
import { useConsoleStore } from '@/lib/store/useConsoleStore';
import { LiveReadout } from './LiveReadout';

const DEMO_LOCATIONS = [
  { label: 'Bay of Bengal', lat: 14, lon: 85 },
  { label: 'Arabian Sea', lat: 15, lon: 65 },
  { label: 'Equatorial Indian Ocean', lat: 0, lon: 75 },
  { label: 'Andaman Sea', lat: 10, lon: 96 },
  { label: 'Lakshadweep Sea', lat: 12, lon: 72 },
];

interface TopBarProps {
  onSearchLocation?: (lat: number, lon: number) => void;
  onReset?: () => void;
}

export function TopBar({ onSearchLocation, onReset }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const resetView = useConsoleStore((s) => s.resetView);

  const filteredLocations = DEMO_LOCATIONS.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (lat: number, lon: number, label: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    onSearchLocation?.(lat, lon);
  };

  const handleReset = () => {
    resetView();
    onReset?.();
    setSearchQuery('');
  };

  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 h-12 flex items-center px-4 gap-4
                 bg-abyss/85 backdrop-blur-md border-b border-thermocline/25"
      role="banner"
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 shrink-0" aria-label="Ocean Digital Twin">
        <Waves size={18} className="text-biolume" aria-hidden="true" />
        <span className="font-display font-semibold text-sm text-foam tracking-wide">
          OCEAN DIGITAL TWIN
        </span>
        <span className="hidden lg:block text-2xs text-foam-dim tracking-widest uppercase font-mono ml-1">
          INCOIS
        </span>
      </div>

      {/* Live readout — center */}
      <div className="flex-1 flex items-center justify-center">
        <LiveReadout />
      </div>

      {/* Region search */}
      <div className="relative shrink-0" role="search">
        <label htmlFor="region-search" className="sr-only">
          Search ocean region
        </label>
        <div className="relative flex items-center">
          <Search
            size={13}
            className="absolute left-2.5 text-foam-dim pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="region-search"
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
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
            aria-expanded={showSuggestions && filteredLocations.length > 0}
            aria-controls="search-suggestions"
          />
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredLocations.length > 0 && (
          <ul
            className="
              absolute top-full right-0 mt-1 w-52
              bg-deep-panel/95 backdrop-blur-xl
              border border-thermocline/35 rounded-md
              overflow-hidden z-50 shadow-xl
            "
            role="listbox"
            aria-label="Region suggestions"
          >
            {filteredLocations.map((loc) => (
              <li key={loc.label} role="option" aria-selected={false}>
                <button
                  className="
                    w-full text-left px-3 py-2 text-xs font-ui text-foam-dim
                    hover:bg-thermocline/20 hover:text-foam
                    focus:outline-none focus:bg-thermocline/20 focus:text-foam
                    transition-colors border-b border-thermocline/20 last:border-0
                  "
                  onClick={() => handleSelect(loc.lat, loc.lon, loc.label)}
                >
                  {loc.label}
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
