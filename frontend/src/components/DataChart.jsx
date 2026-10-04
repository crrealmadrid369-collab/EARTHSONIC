import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { 
  Thermometer, 
  Wind, 
  Sun, 
  CloudRain, 
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const CHART_TABS = [
  { id: 'temperature', name: 'Temperature', key: 'temperature', unit: '°C', color: '#f59e0b', gradientId: 'tempGrad', icon: Thermometer },
  { id: 'wind', name: 'Wind Speed', key: 'wind_speed', unit: 'm/s', color: '#06b6d4', gradientId: 'windGrad', icon: Wind },
  { id: 'solar', name: 'Solar Radiation', key: 'solar_radiation', unit: 'kWh/m²/day', color: '#eab308', gradientId: 'solarGrad', icon: Sun },
  { id: 'precipitation', name: 'Precipitation', key: 'precipitation', unit: 'mm', color: '#3b82f6', gradientId: 'precipGrad', icon: CloudRain },
  { id: 'humidity', name: 'Humidity', key: 'humidity', unit: '%', color: '#10b981', gradientId: 'humidGrad', icon: Droplets },
];

function CustomTooltip({ active, payload, label, unit }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-3 rounded-lg border border-cyan-500/40 text-xs font-mono shadow-xl backdrop-blur-md">
        <p className="text-slate-400 font-semibold mb-1">{data.date}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
          <span className="text-slate-200">{payload[0].name}:</span>
          <span className="text-white font-bold text-sm">
            {payload[0].value} {unit}
          </span>
        </div>
        {data.temp_max !== undefined && (
          <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span>High: {data.temp_max}°C | Low: {data.temp_min}°C</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function DataChart({
  earthData = [],
  statistics = {},
  currentRecord = null,
}) {
  const [activeTab, setActiveTab] = useState('temperature');

  const currentTabConfig = useMemo(() => {
    return CHART_TABS.find((t) => t.id === activeTab) || CHART_TABS[0];
  }, [activeTab]);

  const activeStats = statistics ? statistics[currentTabConfig.key] : null;

  return (
    <div id="charts" className="w-full glass-panel p-5 rounded-2xl border border-cyan-500/20 shadow-glass flex flex-col gap-4">
      {/* Chart Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <span>NASA EARTH SCIENCE OBSERVATION TIMELINE</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Daily temporal measurements normalized for acoustic sonification
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {CHART_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: tab.color }} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      {activeStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">SERIES AVERAGE</span>
            <span className="text-white font-bold text-sm">
              {activeStats.average} {currentTabConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">MINIMUM RECORDED</span>
            <span className="text-cyan-300 font-bold text-sm">
              {activeStats.min} {currentTabConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">MAXIMUM RECORDED</span>
            <span className="text-amber-400 font-bold text-sm">
              {activeStats.max} {currentTabConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">TREND DIRECTION</span>
            <span className={`font-bold text-sm flex items-center gap-1 ${
              activeStats.trend?.direction === 'Rising' ? 'text-rose-400' :
              activeStats.trend?.direction === 'Falling' ? 'text-blue-400' : 'text-slate-300'
            }`}>
              {activeStats.trend?.direction} ({activeStats.trend?.change_percent}%)
            </span>
          </div>
        </div>
      )}

      {/* Recharts Area Container */}
      <div className="w-full h-[280px] lg:h-[340px]">
        {earthData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={currentTabConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentTabConfig.color} stopOpacity={0.45} />
                  <stop offset="95%" stopColor={currentTabConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => {
                  if (!val) return '';
                  const parts = val.split('-');
                  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />

              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                unit={activeTab === 'temperature' ? '°' : ''}
              />

              <Tooltip 
                content={<CustomTooltip unit={currentTabConfig.unit} />} 
              />

              {/* Real-time playback synced reference line */}
              {currentRecord && (
                <ReferenceLine 
                  x={currentRecord.date} 
                  stroke="#00f2fe" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: "LIVE AUDIO PLAYHEAD",
                    fill: "#00f2fe",
                    fontSize: 10,
                    position: "top",
                    fontFamily: "monospace"
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey={currentTabConfig.key}
                name={currentTabConfig.name}
                stroke={currentTabConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${currentTabConfig.gradientId})`}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Awaiting Earth science timeline telemetry...
          </div>
        )}
      </div>
    </div>
  );
}
