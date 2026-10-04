import React, { useState } from 'react';
import { 
  Globe, 
  Play, 
  Compass, 
  Sparkles, 
  ChevronDown, 
  Radio, 
  Layers, 
  Database
} from 'lucide-react';

import { useEarthData } from '../hooks/useEarthData';
import { useSonification } from '../hooks/useSonification';

import { Header } from '../components/Header';
import { EarthMap } from '../components/EarthMap';
import { LocationSelector } from '../components/LocationSelector';
import { DateSelector } from '../components/DateSelector';
import { DataPanel } from '../components/DataPanel';
import { DataChart } from '../components/DataChart';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { AudioControls } from '../components/AudioControls';
import { LayerControls } from '../components/LayerControls';
import { HowItWorks } from '../components/HowItWorks';
import { MappingExplanation } from '../components/MappingExplanation';
import { DataSource } from '../components/DataSource';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export function Home() {
  const {
    locations,
    selectedLocation,
    dateRange,
    earthData,
    metadata,
    statistics,
    isDemoData,
    dataSource,
    loading,
    loadingStep,
    error,
    isDemoActive,
    selectLocation,
    setCustomCoordinates,
    updateDateRange,
    fetchEarthData,
    startDemoMode,
  } = useEarthData();

  const {
    isPlaying,
    currentIndex,
    currentRecord,
    playbackSpeed,
    masterVolume,
    layers,
    analyserNode,
    play,
    pause,
    stop,
    seekTo,
    setPlaybackSpeed,
    setMasterVolume,
    toggleLayer,
  } = useSonification(earthData);

  const [demoPromptVisible, setDemoPromptVisible] = useState(false);

  const handleStartDemoFlow = async () => {
    await startDemoMode();
    // Prompt judge to click play or auto-start if allowed by user
    setDemoPromptVisible(true);
    const dash = document.getElementById('dashboard');
    if (dash) {
      dash.scrollIntoView({ behavior: 'smooth' });
    }
    // Attempt play
    setTimeout(() => {
      play();
    }, 400);
  };

  const scrollToDashboard = () => {
    const dash = document.getElementById('dashboard');
    if (dash) {
      dash.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen space-bg text-slate-100 flex flex-col font-sans">
      {/* Global Header */}
      <Header
        isDemoData={isDemoData}
        onStartDemo={handleStartDemoFlow}
        isDemoActive={isDemoActive}
      />

      {/* Loading Modal */}
      {loading && <LoadingState step={loadingStep} />}

      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-20 px-4 lg:px-8 overflow-hidden border-b border-cyan-500/10">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          {/* Hero Typography */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6 shadow-glow-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NASA SPACE APPS CHALLENGE: THE EARTH INFORMATION JUKEBOX</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-sans leading-[1.08] text-white">
              HEAR <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                THE PLANET
              </span> <br />
              CHANGE.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mt-6 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Transform NASA Earth science data into sound. Explore multi-decade satellite observations converted into real-time acoustic frequencies, rhythm, and atmospheric textures.
            </p>

            {/* Hero Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8">
              <button
                onClick={() => {
                  scrollToDashboard();
                  play();
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm tracking-wide shadow-glow-cyan transition-all hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>LISTEN TO EARTH</span>
              </button>

              <button
                onClick={handleStartDemoFlow}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-semibold text-sm border border-cyan-500/40 hover:border-cyan-300 transition-all shadow-glass cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>START DEMO TOUR</span>
              </button>

              <button
                onClick={scrollToDashboard}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
              >
                <span>EXPLORE DATA</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Earth Sphere Graphic */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full flex items-center justify-center">
              {/* Atmospheric halo rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin-slow" />
              <div className="absolute -inset-4 rounded-full border border-blue-500/15" />
              <div className="absolute -inset-8 rounded-full border border-cyan-400/10" />

              {/* Glowing Earth Globe Visual */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#02182b] via-[#0b3d91] to-[#105bd8] shadow-[0_0_80px_rgba(6,182,212,0.45)] border border-cyan-400/30 overflow-hidden flex items-center justify-center">
                {/* Globe Surface Continents Map Projection Overlay */}
                <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                
                {/* Orbital Sound Waves Emitting from Earth */}
                <div className="absolute w-44 h-44 rounded-full border border-cyan-300/40 animate-ping opacity-35" />
                
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
                  <Radio className="w-10 h-10 text-cyan-300 mb-2 animate-pulse" />
                  <span className="text-xs font-mono text-cyan-200 tracking-widest uppercase">
                    LIVE PLANETARY ACOUSTICS
                  </span>
                  <span className="text-2xl font-black font-mono text-white mt-1">
                    EARTHSONIC
                  </span>
                  <span className="text-[10px] text-cyan-300/80 font-mono mt-1">
                    NASA POWER API
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Dashboard */}
      <main id="dashboard" className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-10 flex flex-col gap-6">
        
        {/* Judge Demo Banner Prompt if Demo Mode Active */}
        {demoPromptVisible && !isPlaying && (
          <div className="glass-panel-glow p-4 rounded-xl border border-cyan-400 flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500 text-slate-950 font-bold">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">
                  DEMO LOADED: TASHKENT (LAST 30 DAYS)
                </h4>
                <p className="text-xs text-cyan-300">
                  Real NASA POWER observations synchronized. Click PLAY below to begin sonification playback!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                play();
                setDemoPromptVisible(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wider font-mono shadow-glow-cyan cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>PLAY NOW</span>
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <ErrorState
            error={error}
            onRetry={() => fetchEarthData()}
            onFallbackDemo={startDemoMode}
          />
        )}

        {/* Climate Zone Presets Bar */}
        <LocationSelector
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            selectLocation(loc);
            fetchEarthData(loc.latitude, loc.longitude);
          }}
        />

        {/* Date Selector & Action Trigger */}
        <DateSelector
          dateRange={dateRange}
          onUpdateDateRange={updateDateRange}
          onFetchData={(lat, lon, start, end) => fetchEarthData(lat, lon, start, end)}
          loading={loading}
        />

        {/* Tri-Pane Main Layout: LEFT Map | CENTER Visualizer | RIGHT Data Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Interactive Leaflet Map (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <EarthMap
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => {
                selectLocation(loc);
                fetchEarthData(loc.latitude, loc.longitude);
              }}
              onSelectCoordinates={(lat, lon) => {
                setCustomCoordinates(lat, lon);
                fetchEarthData(lat, lon);
              }}
            />
          </div>

          {/* CENTER: Real-Time Audio Visualizer (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <AudioVisualizer
              analyserNode={analyserNode}
              isPlaying={isPlaying}
              currentRecord={currentRecord}
              selectedLocation={selectedLocation}
            />
          </div>

          {/* RIGHT: NASA Data Cards (3 cols on lg) */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <DataPanel
              earthData={earthData}
              currentRecord={currentRecord}
              statistics={statistics}
              layers={layers}
              dataSource={dataSource}
              isDemoData={isDemoData}
            />
          </div>
        </div>

        {/* Audio Transport Controls */}
        <AudioControls
          isPlaying={isPlaying}
          currentIndex={currentIndex}
          totalDays={earthData.length}
          currentRecord={currentRecord}
          playbackSpeed={playbackSpeed}
          masterVolume={masterVolume}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSeek={seekTo}
          onSetSpeed={setPlaybackSpeed}
          onSetVolume={setMasterVolume}
        />

        {/* Layer Controls (Toggle Channels) */}
        <LayerControls
          layers={layers}
          onToggleLayer={toggleLayer}
        />

        {/* BOTTOM: Recharts Timeline Chart */}
        <DataChart
          earthData={earthData}
          statistics={statistics}
          currentRecord={currentRecord}
        />

        {/* Explanatory Pipeline: How Earth Becomes Sound */}
        <HowItWorks />

        {/* Acoustic Dictionary / Mapping Explanation */}
        <MappingExplanation />

        {/* Scientific Transparency & Provenance */}
        <DataSource
          selectedLocation={selectedLocation}
          dateRange={dateRange}
          metadata={metadata}
          dataSource={dataSource}
          isDemoData={isDemoData}
        />

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950 py-8 px-4 lg:px-8 mt-12 text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">EARTHSONIC</span>
            <span>—</span>
            <span>NASA Space Apps Challenge 2026: The Earth Information Jukebox</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">Scientific Data: NASA POWER</span>
            <span>•</span>
            <span className="text-cyan-400">Web Audio API Synthesis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
