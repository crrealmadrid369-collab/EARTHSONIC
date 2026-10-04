import React from 'react';
import { Activity, Globe, Play, Sparkles } from 'lucide-react';

export function Header({ isDemoData, onStartDemo, isDemoActive }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-500/20 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 shadow-glow-cyan">
            <Globe className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent font-sans">
                EARTHSONIC
              </span>
              <span className="text-[10px] tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-mono font-semibold">
                NASA APPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
              Hear the planet change.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => scrollTo('dashboard')} 
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            EXPLORE
          </button>
          <button 
            onClick={() => scrollTo('charts')} 
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            DATA
          </button>
          <button 
            onClick={() => scrollTo('sonification')} 
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            SONIFICATION
          </button>
          <button 
            onClick={() => scrollTo('source')} 
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            ABOUT
          </button>
        </nav>

        {/* Right Side Status & Demo CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Scientific Status Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isDemoData ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isDemoData ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
            </span>
            <span className="text-slate-400">NASA DATA:</span>
            <span className={`font-semibold uppercase ${
              isDemoData ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {isDemoData ? 'DEMO DATA' : 'LIVE'}
            </span>
          </div>

          {/* START DEMO Button */}
          <button
            onClick={onStartDemo}
            className={`relative group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-glass cursor-pointer ${
              isDemoActive 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan border border-cyan-300' 
                : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
            }`}
            aria-label="Start interactive demo tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span>START DEMO</span>
          </button>
        </div>
      </div>
    </header>
  );
}
