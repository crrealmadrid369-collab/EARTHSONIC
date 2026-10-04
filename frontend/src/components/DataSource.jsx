import React from 'react';
import { ExternalLink, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function DataSource({
  selectedLocation,
  dateRange,
  metadata,
  dataSource = 'NASA POWER',
  isDemoData = false,
}) {
  const parameters = [
    { code: 'T2M', name: 'Temperature at 2 Meters', unit: '°C' },
    { code: 'T2M_MAX', name: 'Maximum Temperature at 2 Meters', unit: '°C' },
    { code: 'T2M_MIN', name: 'Minimum Temperature at 2 Meters', unit: '°C' },
    { code: 'WS10M', name: 'Wind Speed at 10 Meters', unit: 'm/s' },
    { code: 'PRECTOTCORR', name: 'Precipitation Corrected', unit: 'mm/day' },
    { code: 'RH2M', name: 'Relative Humidity at 2 Meters', unit: '%' },
    { code: 'ALLSKY_SFC_SW_DWN', name: 'All Sky Surface Shortwave Downward Irradiance', unit: 'kWh/m²/day' },
  ];

  return (
    <section id="source" className="w-full py-8">
      <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-cyan-500/20 shadow-glass">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                SCIENTIFIC TRANSPARENCY & PROVENANCE
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white font-sans">
              DATA SOURCE: NASA POWER
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Prediction of Worldwide Energy Resources (POWER) project managed by NASA Langley Research Center.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <a
              href="https://power.larc.nasa.gov/docs/services/api/temporal/daily/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
            >
              <span>Official NASA POWER API Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>NASA data is used as the scientific data source.</span>
            </div>
          </div>
        </div>

        {/* Telemetry Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-400 block mb-1">GEOGRAPHIC TARGET</span>
            <span className="text-slate-100 font-bold block">{selectedLocation?.name}</span>
            <span className="text-cyan-400 text-[11px]">
              {selectedLocation?.latitude.toFixed(4)}° N, {selectedLocation?.longitude.toFixed(4)}° E
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-400 block mb-1">TEMPORAL WINDOW</span>
            <span className="text-slate-100 font-bold block">
              {metadata?.dateRange?.start || dateRange.start}
            </span>
            <span className="text-slate-400 text-[11px]">
              through {metadata?.dateRange?.end || dateRange.end}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-400 block mb-1">DATA STREAM STATUS</span>
            <span className={`font-bold block ${isDemoData ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isDemoData ? 'DEMO DATA (NASA API Fallback)' : 'VERIFIED LIVE NASA TELEMETRY'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {isDemoData ? 'Offline Simulation Mode' : 'Daily Point Satellite Assimilation'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
            <span className="text-[10px] text-slate-400 block mb-1">SAMPLE RESOLUTION</span>
            <span className="text-slate-100 font-bold block">Daily Point Observations</span>
            <span className="text-slate-400 text-[11px]">Community: Renewable Energy (RE)</span>
          </div>
        </div>

        {/* Observed Parameter Definitions */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-3">
            NASA ASSIMILATED PARAMETERS
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {parameters.map((p) => (
              <div
                key={p.code}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold text-[10px]">
                    {p.code}
                  </span>
                  <span className="text-slate-300 text-[11px] truncate">{p.name}</span>
                </div>
                <span className="text-slate-400 text-[10px] shrink-0 ml-2">{p.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scientific Citation Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono leading-relaxed">
          <p>
            <span className="font-semibold text-slate-300">Citation Notice:</span> These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program. EarthSonic strictly preserves the integrity of empirical meteorological records.
          </p>
        </div>
      </div>
    </section>
  );
}
