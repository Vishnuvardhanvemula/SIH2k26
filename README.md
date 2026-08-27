# INCOIS Ocean Digital Twin & Observation Explorer (SIH PS 26067)

> **Google Maps for the ocean** — surface, cutaway, and dive through depth to compare what the model predicts with what instruments actually observed.

## Overview
This repository contains the frontend implementation for the INCOIS Ocean Digital Twin. It is an operational console built for oceanographic researchers, forecasters, and marine analysts.

Unlike generic web dashboards, this application is designed around the concept of a **Precision Instrument HUD**. The interface mimics a submarine console or ROV pilot display, prioritizing deep-sea aesthetics, scientific colormaps, and spatial context over the globe.

Two rules drive the design:
1. **The 3D ocean is the interface, not a widget inside the interface.** Every panel floats over it as frosted glass; nothing boxes it in.
2. **Depth is the story.** The core UX revolves around navigating the vertical water column (Surface → Cutaway → Dive) to investigate anomalies.

## Core Features
- **Full-Bleed 3D Ocean:** Powered by CesiumJS, integrating real-world coordinates and geospatial mapping natively.
- **The Depth Rail:** A signature altimeter UI element that controls vertical depth slicing and tracks modes (Surface/Cutaway/Dive).
- **Procedural Vector Flow:** Custom shader/primitive logic to render ocean currents (U/V) dynamically over the globe.
- **Instrument HUD Aesthetics:** A custom Tailwind token system (`abyss`, `biolume`, `thermocline`) combined with `IBM Plex Mono` typography for precision data readouts.

## Tech Stack
| Technology | Role |
|---|---|
| **Next.js 14 (App Router)** | Framework & Routing |
| **TypeScript** | Type safety and API contracts |
| **CesiumJS (resium)** | Core 3D engine, globe navigation, spatial math |
| **Tailwind CSS** | Styling engine with custom HUD design tokens |
| **Zustand** | Global console state management (time, depth, active variable) |
| **TanStack Query** | Data fetching, caching, and state synchronization |
| **Recharts** | Depth profiles and analytical graphing |

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data Integration
The frontend expects static fixtures or REST endpoints for:
- 3D Grid Field Data (Temperature, Salinity, Currents)
- Observation points (Argo Floats)
- Vertical Profiles (Depth vs Variable graphs)
- Model vs Observation Matchup Tables
