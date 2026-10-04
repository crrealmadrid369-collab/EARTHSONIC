import React from 'react';
import { Globe, Radio, Sparkles } from 'lucide-react';

export function LoadingState({ step = 'CONNECTING TO NASA DATA...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel-glow p-8 rounded-2xl border border-cyan-500/40 max-w-md w-full mx-4 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Animated Earth Pulse Visual */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping opacity-50" />
          <div className="absolute -inset-2 rounded-full border border-cyan-400/30 animate-spin-slow" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-800 flex items-center justify-center shadow-glow-cyan">
            <Globe className="w-10 h-10 text-cyan-100 animate-pulse" />
          </div>
        </div>

        {/* Step Indicator */}
        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800 mb-3">
          NASA EARTH TELEMETRY PIPELINE
        </span>

        <h3 className="text-lg font-bold text-white font-mono tracking-wider mb-2">
          {step}
        </h3>

        <p className="text-xs text-slate-400 font-sans max-w-xs">
          Accessing orbital assimilation arrays, extracting climate parameters, and synthesizing harmonic frequency spectra.
        </p>

        {/* Progress Bar Animation */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 mt-6 overflow-hidden border border-slate-800">
          <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-300 h-full w-2/3 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
