import React from 'react';
import { Layers, Thermometer, Wind, Sun, CloudRain, Droplets } from 'lucide-react';

const LAYER_CONFIG = [
  { id: 'temperature', name: 'Temperature', icon: Thermometer, color: 'text-amber-400', activeBg: 'bg-amber-950/60 border-amber-500/50' },
  { id: 'wind', name: 'Wind Rhythm', icon: Wind, color: 'text-cyan-400', activeBg: 'bg-cyan-950/60 border-cyan-500/50' },
  { id: 'solar', name: 'Solar Shimmer', icon: Sun, color: 'text-yellow-300', activeBg: 'bg-yellow-950/60 border-yellow-500/50' },
  { id: 'rain', name: 'Rain Percussion', icon: CloudRain, color: 'text-blue-400', activeBg: 'bg-blue-950/60 border-blue-500/50' },
  { id: 'humidity', name: 'Humidity Filter', icon: Droplets, color: 'text-emerald-400', activeBg: 'bg-emerald-950/60 border-emerald-500/50' },
];

export function LayerControls({ layers = {}, onToggleLayer }) {
  return (
    <div className="w-full glass-card p-3 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Acoustic Layers (Toggle On/Off)</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {Object.values(layers).filter(Boolean).length}/5 ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {LAYER_CONFIG.map(({ id, name, icon: Icon, color, activeBg }) => {
          const isActive = layers[id];
          return (
            <button
              key={id}
              onClick={() => onToggleLayer(id)}
              aria-label={`Toggle ${name} audio layer`}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? `${activeBg} text-white shadow-sm`
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? color : 'text-slate-600'}`} />
                <span className="truncate">{name}</span>
              </div>
              <span className={`text-[10px] ml-1 px-1 rounded font-bold ${
                isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'
              }`}>
                {isActive ? 'ON' : 'OFF'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
