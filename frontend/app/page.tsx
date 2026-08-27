'use client';

import dynamic from 'next/dynamic';

// CesiumJS and all visualization must be client-only (uses window, WebGL)
const OceanConsole = dynamic(
  () => import('@/components/console/OceanConsole'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-abyss flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-0.5 bg-biolume/30 relative overflow-hidden rounded">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-biolume animate-pulse rounded" />
          </div>
          <p className="font-mono text-xs text-foam-dim tracking-widest uppercase">
            Initializing Console
          </p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return <OceanConsole />;
}
