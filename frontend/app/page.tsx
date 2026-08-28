import Link from 'next/link';
import { GlobalNav } from '@/components/shared/GlobalNav';
import { 
  Layers, Navigation, Activity, Database, Compass, Waves, 
  Map, GitCompare, Box, FileText, CheckCircle2,
  ArrowRight, SlidersHorizontal, LocateFixed
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-abyss text-foam selection:bg-biolume/30 font-ui relative overflow-x-hidden">
      <GlobalNav />

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 5. HERO SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-56 md:pb-48 px-6 flex flex-col items-center justify-center min-h-[85vh] border-b border-thermocline/20 overflow-hidden">
        
        {/* Minimalist Premium Animated Background */}
        <div className="absolute inset-0 z-0 bg-abyss pointer-events-none overflow-hidden">
          
          {/* Animated Mesh Gradients simulating deep ocean water */}
          <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] bg-thermocline/20 blur-[130px] rounded-[100%] animate-[pulse_6s_ease-in-out_infinite] mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-biolume/10 blur-[140px] rounded-[100%] animate-[pulse_8s_ease-in-out_infinite_1s] mix-blend-screen" />
          <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] bg-[#0B2A3F]/40 blur-[100px] rounded-[100%] mix-blend-screen animate-[pulse_7s_ease-in-out_infinite_2s]" />
          
          {/* Very subtle water surface lines for texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" preserveAspectRatio="none">
            <path d="M0,300 C400,250 800,350 1440,300" stroke="#4CE0D2" strokeWidth="2" fill="none" />
            <path d="M0,500 C500,400 900,600 1440,500" stroke="#1C5C6B" strokeWidth="2" fill="none" />
          </svg>
          
          {/* Vignette & Overlays for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/60 via-transparent to-abyss" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] md:text-xs font-semibold tracking-[0.2em] text-white uppercase mb-8 px-4 py-1.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-md">
            INCOIS Ocean Intelligence Platform
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
            See the ocean in 3D.
            <span className="block mt-2 md:mt-4 text-[0.65em] text-foam leading-tight font-medium">
              Understand what is happening beneath the surface.
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-foam/80 leading-relaxed mb-12 drop-shadow-md">
            Explore temperature, salinity and current structures across depth and time. Integrate numerical ocean models with Argo and glider observations in a single interactive environment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <Link 
              href="/explore" 
              className="
                group flex items-center justify-center gap-2 w-full sm:w-auto
                px-10 py-4 rounded bg-white text-abyss font-display font-bold text-base
                hover:bg-biolume transition-all duration-300 transform hover:-translate-y-0.5
                shadow-[0_0_40px_rgba(255,255,255,0.2)]
              "
            >
              Launch Ocean Explorer
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link 
              href="#capabilities" 
              className="
                flex items-center justify-center w-full sm:w-auto
                px-10 py-4 rounded border border-white/30 text-white bg-black/20 backdrop-blur-md
                font-display font-semibold text-base hover:bg-white/10 transition-all duration-300
              "
            >
              Explore Capabilities
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 6. TRUST / CREDIBILITY STRIP */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-6 px-6 border-b border-thermocline/10 bg-deep-panel/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
          <span className="font-mono text-[10px] text-foam-dim tracking-widest uppercase mb-2 md:mb-0">
            Powered by open ocean data standards
          </span>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 font-display font-semibold text-sm md:text-base text-foam/70 tracking-widest">
            <span>INCOIS</span>
            <span>ARGO</span>
            <span>NetCDF</span>
            <span>ERDDAP</span>
            <span>OGC</span>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 7. PROBLEM SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section id="platform" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ocean data is rich. <br className="md:hidden"/>Understanding it shouldn&apos;t be fragmented.
          </h2>
          <p className="text-foam-dim text-lg">
            Traditional workflows require shifting between isolated tools. We built a unified environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Fragmented */}
          <div className="bg-deep-panel/40 border border-thermocline/10 rounded-xl p-8 flex flex-col gap-4 relative">
            <div className="absolute top-4 right-4 font-mono text-[10px] text-instrument-amber uppercase tracking-widest px-2 py-1 border border-instrument-amber/30 rounded bg-instrument-amber/10">Legacy Workflow</div>
            
            <div className="flex items-center gap-4 p-3 bg-abyss rounded border border-thermocline/20"><FileText size={18} className="text-foam-dim" /> Model Output Tool</div>
            <div className="w-px h-4 bg-thermocline/20 mx-auto" />
            <div className="flex items-center gap-4 p-3 bg-abyss rounded border border-thermocline/20"><Activity size={18} className="text-foam-dim" /> Argo Data Portal</div>
            <div className="w-px h-4 bg-thermocline/20 mx-auto" />
            <div className="flex items-center gap-4 p-3 bg-abyss rounded border border-thermocline/20"><Navigation size={18} className="text-foam-dim" /> Glider Tracker</div>
            
            <div className="mt-4 pt-4 border-t border-thermocline/20 text-center font-mono text-xs text-instrument-amber">
              ↓ Slow, Manual Analysis
            </div>
          </div>

          {/* Unified */}
          <div className="bg-gradient-to-b from-thermocline/10 to-deep-panel/40 border border-thermocline/30 rounded-xl p-8 flex flex-col gap-4 relative">
             <div className="absolute top-4 right-4 font-mono text-[10px] text-biolume uppercase tracking-widest px-2 py-1 border border-biolume/30 rounded bg-biolume/10">OceanRoot Workflow</div>
             
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-abyss rounded border border-thermocline/20 text-center text-sm font-medium">Model Data</div>
               <div className="p-3 bg-abyss rounded border border-thermocline/20 text-center text-sm font-medium">Argo / Glider</div>
               <div className="p-3 bg-abyss rounded border border-thermocline/20 text-center text-sm font-medium">Depth Fields</div>
               <div className="p-3 bg-abyss rounded border border-thermocline/20 text-center text-sm font-medium">Time Series</div>
             </div>
             
             <div className="flex justify-center my-2 text-biolume">↓</div>
             
             <div className="p-4 bg-biolume/10 border border-biolume/40 rounded text-center text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(76,224,210,0.15)]">
               <Layers size={18} className="text-biolume" /> Unified 3D Analysis
             </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 8. CORE PRODUCT EXPERIENCE */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-24 px-6 border-t border-thermocline/10 bg-deep-panel/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-16">
            One ocean. Every layer. One workspace.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-abyss border border-thermocline/20 p-8 rounded-xl flex flex-col items-start gap-4 hover:border-thermocline/50 transition-colors group">
              <div className="w-12 h-12 rounded bg-deep-panel border border-thermocline/40 flex items-center justify-center text-foam group-hover:text-biolume transition-colors">
                <Layers size={22} />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">Explore the Ocean by Depth</h3>
              <p className="text-sm text-foam-dim leading-relaxed mb-6">
                Move from the surface to the deep ocean and reveal how temperature and salinity change throughout the water column.
              </p>
              {/* Mini visual */}
              <div className="w-full h-32 bg-deep-panel/50 rounded border border-thermocline/10 relative overflow-hidden flex flex-col justify-between p-4">
                 <div className="w-full h-1 bg-gradient-to-r from-red-500 to-yellow-500 rounded" />
                 <div className="w-full h-1 bg-gradient-to-r from-yellow-500 to-green-500 rounded opacity-80" />
                 <div className="w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded opacity-60" />
                 <div className="absolute right-2 top-2 font-mono text-[9px] text-foam-dim">0m</div>
                 <div className="absolute right-2 bottom-2 font-mono text-[9px] text-foam-dim">2000m</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-abyss border border-thermocline/20 p-8 rounded-xl flex flex-col items-start gap-4 hover:border-thermocline/50 transition-colors group">
              <div className="w-12 h-12 rounded bg-deep-panel border border-thermocline/40 flex items-center justify-center text-foam group-hover:text-biolume transition-colors">
                <Waves size={22} />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">See Currents Move</h3>
              <p className="text-sm text-foam-dim leading-relaxed mb-6">
                Visualize current direction and velocity through animated particles and streamlines overlaid on scalar fields.
              </p>
              {/* Mini visual */}
              <div className="w-full h-32 bg-[#020b14] rounded border border-thermocline/10 relative overflow-hidden flex items-center justify-center">
                 <div className="absolute w-[120%] h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-biolume/10 to-transparent" />
                 <div className="flex flex-col gap-4 w-full px-4">
                    <div className="text-biolume/60 text-xs tracking-[0.3em] font-mono animate-pulse delay-75">→  →  ↗  →</div>
                    <div className="text-biolume/40 text-xs tracking-[0.3em] font-mono animate-pulse delay-150 ml-4">→  ↗  ↑  ↗</div>
                 </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-abyss border border-thermocline/20 p-8 rounded-xl flex flex-col items-start gap-4 hover:border-thermocline/50 transition-colors group">
              <div className="w-12 h-12 rounded bg-deep-panel border border-thermocline/40 flex items-center justify-center text-foam group-hover:text-biolume transition-colors">
                <GitCompare size={22} />
              </div>
              <h3 className="font-display text-xl font-semibold text-white">Compare Models with Observations</h3>
              <p className="text-sm text-foam-dim leading-relaxed mb-6">
                Overlay Argo and glider measurements and inspect model-observation differences at the same location, depth and time.
              </p>
              {/* Mini visual */}
              <div className="w-full h-32 bg-deep-panel/50 rounded border border-thermocline/10 relative p-4 flex items-end">
                {/* Graph mock */}
                <div className="w-full h-full border-l border-b border-thermocline/20 relative">
                  {/* Model line */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 0,90 Q 30,80 50,50 T 100,10" fill="none" stroke="#1C5C6B" strokeWidth="3" />
                    {/* Observation line */}
                    <path d="M 0,85 Q 35,85 55,45 T 100,15" fill="none" stroke="#4CE0D2" strokeWidth="2" strokeDasharray="4" />
                  </svg>
                  <div className="absolute top-1 left-2 flex flex-col gap-1">
                    <div className="flex items-center gap-1 font-mono text-[8px] text-thermocline"><span className="w-2 h-0.5 bg-thermocline" /> Model</div>
                    <div className="flex items-center gap-1 font-mono text-[8px] text-biolume"><span className="w-2 h-0.5 bg-biolume border-dashed" /> Obs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 9. PRODUCT PREVIEW SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-16">
          A scientific workspace built for exploration
        </h2>

        {/* UI Mockup Container */}
        <div className="w-full aspect-video min-h-[500px] rounded-xl border border-thermocline/30 bg-[#020b14] shadow-2xl relative overflow-hidden flex">
          
          {/* Mock Globe Area (Center/Background) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-deep-panel to-[#020b14]">
             {/* Fake coordinates grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(28,92,107,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(28,92,107,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
             
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-biolume/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-biolume/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-biolume shadow-[0_0_10px_#4CE0D2]" />
                </div>
             </div>
          </div>

          {/* Top Bar Mock */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-[#050b14]/90 border-b border-thermocline/20 flex items-center px-4 justify-between z-20">
             <div className="flex items-center gap-2">
               <Waves size={14} className="text-biolume" />
               <span className="font-display text-xs text-white">OCEANROOT</span>
             </div>
             <div className="font-mono text-[10px] text-foam-dim">LAT 15.21° N  LON 72.41° E</div>
          </div>

          {/* Left Panel Mock */}
          <div className="hidden md:flex absolute left-4 top-14 bottom-16 w-64 bg-[#071321]/90 backdrop-blur-md border border-thermocline/30 rounded-lg p-4 flex-col gap-6 z-20">
             <div>
               <div className="font-mono text-[10px] text-foam-dim tracking-widest mb-3">VARIABLE</div>
               <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 font-ui text-sm text-white"><span className="w-3 h-3 rounded-full bg-biolume" /> Temperature</div>
                 <div className="flex items-center gap-2 font-ui text-sm text-foam-dim"><span className="w-3 h-3 rounded-full border border-thermocline" /> Salinity</div>
                 <div className="flex items-center gap-2 font-ui text-sm text-foam-dim"><span className="w-3 h-3 rounded-full border border-thermocline" /> Currents</div>
               </div>
             </div>
             <div>
               <div className="font-mono text-[10px] text-foam-dim tracking-widest mb-3">DEPTH</div>
               <div className="w-full h-1 bg-thermocline/30 rounded-full relative">
                 <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-biolume rounded-full" />
                 <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
               </div>
               <div className="text-right font-mono text-[10px] mt-1 text-white">250 m</div>
             </div>
             <div>
               <div className="font-mono text-[10px] text-foam-dim tracking-widest mb-3">LAYERS</div>
               <div className="flex flex-col gap-2 font-ui text-sm text-foam-dim">
                 <div className="flex items-center gap-2 text-white"><CheckCircle2 size={14} className="text-biolume" /> Argo Floats</div>
                 <div className="flex items-center gap-2 text-white"><CheckCircle2 size={14} className="text-biolume" /> Gliders</div>
                 <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded border border-thermocline/50" /> Currents</div>
               </div>
             </div>
          </div>

          {/* Right Panel Mock */}
          <div className="hidden lg:block absolute right-4 top-14 w-72 bg-[#071321]/90 backdrop-blur-md border border-thermocline/30 rounded-lg p-4 z-20">
             <div className="font-mono text-[10px] text-foam-dim tracking-widest mb-2">SELECTED OBSERVATION</div>
             <div className="font-display text-lg font-semibold text-white mb-4">ARGO #2901234</div>
             
             <div className="flex flex-col gap-2 mb-6">
               <div className="flex justify-between font-mono text-xs border-b border-thermocline/10 pb-1">
                 <span className="text-foam-dim">Temperature</span><span className="text-white">27.4 °C</span>
               </div>
               <div className="flex justify-between font-mono text-xs border-b border-thermocline/10 pb-1">
                 <span className="text-foam-dim">Salinity</span><span className="text-white">35.1 PSU</span>
               </div>
             </div>

             <div className="flex flex-col gap-2">
               <button className="w-full py-2 bg-deep-panel border border-thermocline/30 text-white font-ui text-xs rounded hover:bg-thermocline/20 transition-colors">
                 View Profile
               </button>
               <button className="w-full py-2 bg-biolume text-abyss font-ui font-semibold text-xs rounded">
                 Compare With Model
               </button>
             </div>
          </div>

          {/* Colorbar Mock */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-96 bg-[#071321]/90 backdrop-blur-md border border-thermocline/30 rounded-lg p-3 z-20 flex flex-col gap-1">
             <div className="w-full h-3 rounded bg-gradient-to-r from-blue-500 via-cyan-400 via-yellow-400 to-red-500" />
             <div className="flex justify-between font-mono text-[9px] text-white">
               <span>18°C</span>
               <span>22°C</span>
               <span>26°C</span>
               <span>30°C</span>
             </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 10. MODEL + OBSERVATION STORY */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-thermocline/10 bg-abyss">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
            From prediction to measurement
          </h2>
          <p className="text-foam-dim text-lg leading-relaxed mb-16 max-w-3xl mx-auto">
            The platform connects modeled ocean states with measurements from observing platforms, enabling users to inspect agreement, differences and anomalies in their geographic and vertical context.
          </p>

          <div className="flex flex-col items-center gap-4">
             <div className="px-6 py-3 border border-thermocline/30 bg-deep-panel rounded font-mono text-sm tracking-widest text-white uppercase">Numerical Model</div>
             <div className="w-px h-6 bg-thermocline" />
             <div className="text-sm font-ui text-foam-dim">Ocean Field</div>
             <div className="w-px h-6 bg-thermocline" />
             <div className="px-6 py-3 border border-thermocline/30 bg-deep-panel rounded font-mono text-sm tracking-widest text-white uppercase shadow-[0_0_15px_rgba(28,92,107,0.4)]">3D View</div>
             <div className="w-px h-6 bg-thermocline" />
             <div className="text-sm font-ui text-foam-dim">Observation (Argo / Glider)</div>
             <div className="w-px h-6 bg-thermocline" />
             <div className="px-6 py-3 border border-biolume/50 bg-biolume/10 rounded font-mono text-sm tracking-widest text-biolume uppercase shadow-[0_0_15px_rgba(76,224,210,0.2)]">Model ↔ Observation</div>
             <div className="w-px h-6 bg-thermocline" />
             <div className="text-sm font-ui text-white font-medium">Difference / Anomaly Computed</div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 11. DATA SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section id="data" className="py-24 px-6 border-t border-thermocline/10 bg-deep-panel/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white mb-12">Built for real ocean data</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* INCOIS Model */}
            <div className="bg-abyss border border-thermocline/20 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Database size={20} className="text-foam" />
                <h3 className="font-display text-lg font-semibold text-white">INCOIS Model Data</h3>
              </div>
              <ul className="font-mono text-xs text-foam-dim space-y-2">
                <li>• NetCDF Format</li>
                <li>• Temperature</li>
                <li>• Salinity</li>
                <li>• Currents</li>
                <li className="text-biolume pt-2">Depth × Time × Location</li>
              </ul>
            </div>

            {/* Argo */}
            <div className="bg-abyss border border-thermocline/20 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <LocateFixed size={20} className="text-foam" />
                <h3 className="font-display text-lg font-semibold text-white">Argo</h3>
              </div>
              <ul className="font-mono text-xs text-foam-dim space-y-2">
                <li>• Vertical Profiles</li>
                <li>• Temperature</li>
                <li>• Salinity</li>
                <li>• Pressure / Position</li>
                <li className="text-biolume pt-2">Quality Flags Included</li>
              </ul>
            </div>

            {/* Gliders */}
            <div className="bg-abyss border border-thermocline/20 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Compass size={20} className="text-foam" />
                <h3 className="font-display text-lg font-semibold text-white">Gliders</h3>
              </div>
              <ul className="font-mono text-xs text-foam-dim space-y-2">
                <li>• Trajectory Data</li>
                <li>• Depth Profiles</li>
                <li>• Temperature / Salinity</li>
                <li className="text-biolume pt-2">Additional BGC Variables</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-foam-dim/80 text-center font-ui">
            Modular architecture allows additional observation platforms and model variables to be integrated without rebuilding the visualization layer.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 12. APPLICATIONS SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section id="applications" className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-white mb-12 text-center">
          From ocean science to operational decisions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AppCard title="Ocean Forecasting" desc="Understand evolving 3D ocean conditions to improve forecasting accuracy." />
          <AppCard title="Disaster Management" desc="Support analysis around marine hazards, cyclones, and extreme conditions." />
          <AppCard title="Search & Rescue" desc="Provide current and environmental context for SAR operations." />
          <AppCard title="Fisheries" desc="Explore temperature, salinity, currents, and productivity-related conditions." />
          <AppCard title="Research & Education" desc="Transform complex ocean datasets into intuitive interactive experiences." />
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 13. SCIENTIFIC CAPABILITIES */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-b border-thermocline/10 bg-deep-panel/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CapItem icon={<Box size={20} />} title="3D DEPTH" desc="Explore water-column structure" />
            <CapItem icon={<Activity size={20} />} title="TIME" desc="Animate ocean conditions" />
            <CapItem icon={<ThermometerIcon />} title="TEMPERATURE" desc="Continuous scalar field" />
            <CapItem icon={<DropletsIcon />} title="SALINITY" desc="Depth-resolved structure" />
            <CapItem icon={<MoveIcon />} title="CURRENTS" desc="Direction + velocity" />
            <CapItem icon={<Map size={20} />} title="OBSERVATIONS" desc="Argo / Glider overlays" />
            <CapItem icon={<GitCompare size={20} />} title="MODEL MATCHUP" desc="Predicted vs observed" />
            <CapItem icon={<SlidersHorizontal size={20} />} title="CUSTOM COLORBARS" desc="Control interpretation" />
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 14. INTEROPERABILITY SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-2xl font-bold text-white mb-12">
          Designed to work with the ocean-data ecosystem
        </h2>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 font-mono text-sm tracking-widest text-foam-dim uppercase mb-12">
          <div className="bg-deep-panel/50 px-4 py-2 rounded border border-thermocline/20">NetCDF</div>
          <ArrowRight size={16} className="text-thermocline rotate-90 md:rotate-0" />
          <div className="bg-deep-panel/50 px-4 py-2 rounded border border-thermocline/20">xarray Processing</div>
          <ArrowRight size={16} className="text-thermocline rotate-90 md:rotate-0" />
          <div className="bg-deep-panel/50 px-4 py-2 rounded border border-thermocline/20">REST / ERDDAP</div>
          <ArrowRight size={16} className="text-thermocline rotate-90 md:rotate-0" />
          <div className="bg-biolume/10 text-biolume px-4 py-2 rounded border border-biolume/30">3D Visualization</div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-foam-dim/70">
          <span>CF Conventions</span> • 
          <span>OGC Standards</span> • 
          <span>NetCDF</span> • 
          <span>ERDDAP</span> • 
          <span>OPeNDAP</span>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 15. IMPACT SECTION */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-thermocline/10 bg-abyss">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">
              From raw multidimensional datasets to actionable visual insight.
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="border-l-2 border-biolume pl-6">
              <h4 className="font-mono text-sm tracking-widest text-white mb-1 uppercase">Multi-Dimensional</h4>
              <p className="text-foam-dim font-ui">Depth × Time × Space</p>
            </div>
            <div className="border-l-2 border-biolume pl-6">
              <h4 className="font-mono text-sm tracking-widest text-white mb-1 uppercase">Multi-Source</h4>
              <p className="text-foam-dim font-ui">Model + Observation Integration</p>
            </div>
            <div className="border-l-2 border-biolume pl-6">
              <h4 className="font-mono text-sm tracking-widest text-white mb-1 uppercase">Browser-Native</h4>
              <p className="text-foam-dim font-ui">No Desktop Scientific Software Required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 16. FINAL CTA */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-deep-panel text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-biolume/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            Explore what is happening beneath the surface.
          </h2>
          <p className="text-lg text-foam-dim mb-10">
            Enter the 3D ocean workspace and explore model fields, observations and depth-resolved ocean structure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/explore" 
              className="px-8 py-3.5 rounded bg-biolume text-abyss font-ui font-semibold text-sm hover:bg-white transition-colors w-full sm:w-auto"
            >
              Launch Ocean Explorer →
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-3.5 rounded border border-thermocline/40 text-white font-ui font-medium text-sm hover:bg-thermocline/20 transition-colors w-full sm:w-auto"
            >
              View Data Sources
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 17. FOOTER */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <footer className="bg-[#01060a] pt-16 pb-8 px-6 border-t border-thermocline/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Waves size={20} className="text-biolume" />
              <span className="font-display font-semibold text-lg text-white tracking-wide">OCEANROOT</span>
            </div>
            <p className="text-foam-dim text-sm max-w-xs">
              A browser-based platform for interactive 3D ocean data exploration.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs text-white tracking-widest uppercase mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-foam-dim flex flex-col">
              <Link href="#platform" className="hover:text-white transition-colors w-fit">Platform</Link>
              <Link href="#capabilities" className="hover:text-white transition-colors w-fit">Capabilities</Link>
              <Link href="#data" className="hover:text-white transition-colors w-fit">Data</Link>
              <Link href="#applications" className="hover:text-white transition-colors w-fit">Applications</Link>
              <Link href="/about" className="hover:text-white transition-colors w-fit">About</Link>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs text-white tracking-widest uppercase mb-4">Data & Standards</h4>
            <ul className="space-y-2 text-sm text-foam-dim flex flex-col">
              <span className="cursor-default">INCOIS</span>
              <span className="cursor-default">Argo</span>
              <span className="cursor-default">NetCDF</span>
              <span className="cursor-default">ERDDAP</span>
              <span className="cursor-default">OGC</span>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-thermocline/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foam-dim/60">
          <span>© 2026 OceanRoot</span>
          <span>Prototype developed for SIH Problem Statement 26067.</span>
        </div>
      </footer>
    </main>
  );
}

// ── Helpers for cleaner code ──────────────────────────────────────────

function AppCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-deep-panel/40 border border-thermocline/10 p-6 rounded hover:border-thermocline/30 transition-colors">
      <h3 className="font-ui font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-foam-dim">{desc}</p>
    </div>
  );
}

function CapItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-thermocline mb-1">{icon}</div>
      <h4 className="font-mono text-[11px] text-white tracking-widest uppercase">{title}</h4>
      <p className="text-xs text-foam-dim font-ui">{desc}</p>
    </div>
  );
}

// Minimal placeholder icons to avoid extra dependencies
function ThermometerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/><path d="M11.5 7v6"/>
    </svg>
  );
}
function DropletsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
    </svg>
  );
}
function MoveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  );
}
