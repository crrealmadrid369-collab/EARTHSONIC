import React from 'react';
import { MapPin, Compass } from 'lucide-react';

export function LocationSelector({
  locations = [],
  selectedLocation,
  onSelectLocation,
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
        <Compass className="w-3.5 h-3.5" />
        <span>Predefined Climate Zones</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {locations.map((loc) => {
          const isSelected = selectedLocation && selectedLocation.name === loc.name;
          return (
            <button
              key={loc.id || loc.name}
              onClick={() => onSelectLocation(loc)}
              className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-glow-cyan'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span className="font-semibold text-xs truncate">{loc.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                {loc.latitude.toFixed(1)}°, {loc.longitude.toFixed(1)}°
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
