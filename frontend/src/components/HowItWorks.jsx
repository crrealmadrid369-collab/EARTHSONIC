import React from 'react';
import { Satellite, Cpu, Music, Radio, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'NASA DATA',
    desc: 'Direct retrieval of daily meteorological parameters from NASA POWER satellite assimilation and reanalysis models.',
    icon: Satellite,
    color: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  {
    step: '02',
    title: 'DATA ANALYSIS',
    desc: 'Python analytics normalize observations, compute climate slopes, variances, and calibrate physical ranges.',
    icon: Cpu,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  {
    step: '03',
    title: 'SONIFICATION',
    desc: 'Acoustic mapping algorithm translates physical planetary dynamics into pitch, rhythm, harmonics, and filter resonances.',
    icon: Music,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  {
    step: '04',
    title: 'REAL-TIME SOUND',
    desc: 'Client-side Web Audio API generates live hybrid polyphony rendered simultaneously with responsive spectrogram visualizer.',
    icon: Radio,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-8">
      <div className="text-center mb-8">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800">
          METHODOLOGY PIPELINE
        </span>
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-3 font-sans">
          HOW EARTH BECOMES SOUND
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
          From orbital remote sensing to browser psychoacoustics — experience the deterministic transformation of planetary telemetry into music.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`glass-panel p-5 rounded-xl border ${s.border} relative flex flex-col justify-between group hover:border-cyan-400 transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-slate-600 group-hover:text-cyan-400 transition-colors">
                    {s.step}
                  </span>
                  <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-100 tracking-wider font-mono mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {s.desc}
                </p>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ArrowRight className="w-6 h-6 text-slate-700 bg-slate-950 rounded-full p-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
