import React from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  CloudRain, 
  Sun, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from 'lucide-react';

const ICON_MAP = {
  temperature: Thermometer,
  wind: Wind,
  humidity: Droplets,
  precipitation: CloudRain,
  solar: Sun,
};

const COLOR_MAP = {
  temperature: {
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
    bgGlow: 'from-amber-500/10',
    badge: 'bg-amber-950/70 text-amber-300 border-amber-800',
  },
  wind: {
    accent: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bgGlow: 'from-cyan-500/10',
    badge: 'bg-cyan-950/70 text-cyan-300 border-cyan-800',
  },
  solar: {
    accent: 'text-yellow-300',
    border: 'border-yellow-500/30',
    bgGlow: 'from-yellow-500/10',
    badge: 'bg-yellow-950/70 text-yellow-300 border-yellow-800',
  },
  precipitation: {
    accent: 'text-blue-400',
    border: 'border-blue-500/30',
    bgGlow: 'from-blue-500/10',
    badge: 'bg-blue-950/70 text-blue-300 border-blue-800',
  },
  humidity: {
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bgGlow: 'from-emerald-500/10',
    badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800',
  },
};

export function DataCard({
  type,
  label,
  value,
  unit,
  currentValue,
  stats,
  isActiveLayer = true,
}) {
  const Icon = ICON_MAP[type] || Thermometer;
  const colors = COLOR_MAP[type] || COLOR_MAP.temperature;

  const trendDirection = stats?.trend?.direction || 'Stable';
  const trendPercent = stats?.trend?.change_percent ?? 0;

  const renderTrendIcon = () => {
    if (trendDirection === 'Rising') {
      return <TrendingUp className="w-3.5 h-3.5 text-rose-400" />;
    } else if (trendDirection === 'Falling') {
      return <TrendingDown className="w-3.5 h-3.5 text-blue-400" />;
    }
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className={`relative p-3.5 rounded-xl border glass-card overflow-hidden flex flex-col justify-between transition-all ${
      colors.border
    } ${!isActiveLayer ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}>
      
      {/* Background gradient shine */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${colors.bgGlow} to-transparent blur-xl pointer-events-none`} />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 ${colors.accent}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase font-sans">
              {label}
            </span>
          </div>

          {/* Trend Badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800">
            {renderTrendIcon()}
            <span className="text-slate-300">
              {trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`}
            </span>
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
            {currentValue !== undefined && currentValue !== null ? currentValue : value}
          </span>
          <span className="text-xs font-mono text-slate-400">{unit}</span>
        </div>
      </div>

      {/* Mini Statistical Overview */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div>
          AVG: <span className="text-slate-200 font-semibold">{stats?.average ?? '--'}</span>
        </div>
        <div>
          MIN: <span className="text-slate-200">{stats?.min ?? '--'}</span>
        </div>
        <div>
          MAX: <span className="text-slate-200">{stats?.max ?? '--'}</span>
        </div>
      </div>
    </div>
  );
}
