import React from 'react';
import { Thermometer, Wind, Sun, CloudRain, Droplets } from 'lucide-react';

const MAPPINGS = [
  {
    parameter: 'TEMPERATURE',
    nasaCode: 'T2M',
    rule: 'Higher → Higher Pitch',
    acousticRole: 'Melodic Core / Pitch Frequency (130 Hz - 660 Hz)',
    icon: Thermometer,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgGlow: 'bg-amber-950/20',
    detail: 'Temperature sets the central pitch along an exponential musical frequency curve. Warm weather elevates melodies into radiant registers; freezing weather grounds the music in deep bass drones.'
  },
  {
    parameter: 'WIND SPEED',
    nasaCode: 'WS10M',
    rule: 'Faster → Faster Rhythm',
    acousticRole: 'Tempo Modulation & LFO Tremolo (0.5 Hz - 8.0 Hz)',
    icon: Wind,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgGlow: 'bg-cyan-950/20',
    detail: 'Kinetic energy from surface winds drives the pacing of acoustic events and introduces fluttering amplitude tremolo. Calm breezes breathe gently; intense storms trigger urgent, fluttering pulses.'
  },
  {
    parameter: 'SOLAR RADIATION',
    nasaCode: 'ALLSKY_SFC_SW_DWN',
    rule: 'More Energy → More Intensity & Brightness',
    acousticRole: 'FM Synthesis Harmonic Richness (Upper Partials)',
    icon: Sun,
    color: 'text-yellow-300',
    borderColor: 'border-yellow-500/30',
    bgGlow: 'bg-yellow-950/20',
    detail: 'Solar shortwave irradiance excites secondary harmonic overtones. Peak midday sunshine generates shimmering crystalline harmonics, while overcast days soften the tone into gentle warmth.'
  },
  {
    parameter: 'PRECIPITATION',
    nasaCode: 'PRECTOTCORR',
    rule: 'More Rain → More Percussion',
    acousticRole: 'Granular Noise Bursts & Droplet Density',
    icon: CloudRain,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgGlow: 'bg-blue-950/20',
    detail: 'Rainfall triggers acoustic impact transients and resonant droplet pings. Dry weather leaves this channel completely quiet; torrential downpours cascade into organic polyrhythmic percussion.'
  },
  {
    parameter: 'HUMIDITY',
    nasaCode: 'RH2M',
    rule: 'Higher → Deeper Atmosphere',
    acousticRole: 'Low-pass Biquad Filter Cutoff (350 Hz - 4800 Hz)',
    icon: Droplets,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGlow: 'bg-emerald-950/20',
    detail: 'Atmospheric moisture simulates acoustic frequency absorption. Arid desert air preserves razor-sharp high frequencies; saturated tropical rainforest humidity absorbs treble into an intimate, submerged warmth.'
  },
];

export function MappingExplanation() {
  return (
    <section id="sonification" className="w-full py-8">
      <div className="text-center mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
          ACOUSTIC DICTIONARY
        </span>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-3 font-sans">
          HOW TO HEAR EARTH
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
          Every note, pulse, and timbre in EarthSonic is an uncompromised scientific translation of NASA Earth observations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MAPPINGS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.parameter}
              className={`glass-panel p-5 rounded-xl border ${item.borderColor} ${item.bgGlow} flex flex-col justify-between hover:scale-[1.01] transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 font-mono">
                        {item.parameter}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        NASA: {item.nasaCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="my-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                  <span className={`text-xs font-bold font-mono ${item.color}`}>
                    {item.rule}
                  </span>
                </div>

                <p className="text-[11px] font-mono text-slate-300 mb-2 font-semibold">
                  {item.acousticRole}
                </p>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
