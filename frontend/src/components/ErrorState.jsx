import React from 'react';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export function ErrorState({ error, onRetry, onFallbackDemo }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 max-w-lg mx-auto text-center my-8 shadow-2xl">
      <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider mb-2">
        NASA Data Temporarily Unavailable
      </h3>

      <p className="text-xs text-slate-300 font-sans mb-4 leading-relaxed">
        {error || 'Unable to establish orbital connection to the NASA POWER API endpoint.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry NASA Connection</span>
          </button>
        )}

        {onFallbackDemo && (
          <button
            onClick={onFallbackDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs font-mono transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Offline Demo Mode</span>
          </button>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-amber-400 font-mono">
        Note: Fallback data will be explicitly marked as DEMO DATA in the interface.
      </div>
    </div>
  );
}
