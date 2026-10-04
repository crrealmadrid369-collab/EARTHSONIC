import React, { useEffect, useRef, useState } from 'react';
import { Activity, Radio, Sparkles } from 'lucide-react';

export function AudioVisualizer({
  analyserNode,
  isPlaying,
  currentRecord,
  selectedLocation,
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [visualMode, setVisualMode] = useState('bars'); // 'bars' | 'wave' | 'hybrid'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Buffer arrays for Analyser
    let dataArray = null;
    let timeArray = null;
    let bufferLength = 0;

    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      timeArray = new Uint8Array(bufferLength);
    }

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      // Handle canvas resolution
      const width = canvas.width;
      const height = canvas.height;

      // Dark background with slight decay trail for fluid motion blur
      ctx.fillStyle = 'rgba(7, 11, 25, 0.28)';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines for Scientific Instrumentation Look
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSteps = 6;
      for (let i = 1; i < gridSteps; i++) {
        const y = (height / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!analyserNode || !isPlaying || !dataArray) {
        // Subtle ambient idle breathing sine wave when paused
        const idleTime = performance.now() * 0.002;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.02 + idleTime) * 8 * Math.cos(x * 0.005);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        return;
      }

      // Fetch live Web Audio API data
      analyserNode.getByteFrequencyData(dataArray);
      analyserNode.getByteTimeDomainData(timeArray);

      // 1. Draw Frequency Spectrum Bars
      if (visualMode === 'bars' || visualMode === 'hybrid') {
        const barsCount = 48;
        const barWidth = (width / barsCount) * 0.75;
        const spacing = (width / barsCount) * 0.25;

        for (let i = 0; i < barsCount; i++) {
          const sampleIndex = Math.floor(Math.pow(i / barsCount, 1.4) * (bufferLength * 0.65));
          const value = dataArray[sampleIndex] || 0;
          const barHeight = (value / 255) * (height * 0.85);

          const x = i * (barWidth + spacing) + spacing / 2;
          const y = height - barHeight;

          // Gradient color from deep cyan to neon blue to warm gold at peak
          const gradient = ctx.createLinearGradient(0, height, 0, y);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
          gradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.75)');
          gradient.addColorStop(1, 'rgba(251, 191, 36, 0.95)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          // Peak caps
          if (barHeight > 6) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y - 2, barWidth, 2);
          }
        }
      }

      // 2. Draw Oscilloscope Waveform Overlay
      if (visualMode === 'wave' || visualMode === 'hybrid') {
        ctx.lineWidth = visualMode === 'hybrid' ? 2 : 3;
        ctx.strokeStyle = visualMode === 'hybrid' ? 'rgba(79, 172, 254, 0.85)' : '#00f2fe';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isPlaying, visualMode]);

  return (
    <div className="relative w-full h-[360px] lg:h-[420px] rounded-xl overflow-hidden border border-cyan-500/25 glass-panel-glow flex flex-col justify-between">
      {/* Top Visualizer HUD Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <Radio className={`w-4 h-4 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-200">
                REAL-TIME SPECTROGRAM
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-mono">
                WEB AUDIO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {selectedLocation?.name} • {currentRecord?.date || 'Standby'}
            </p>
          </div>
        </div>

        {/* Visualizer Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setVisualMode('bars')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              visualMode === 'bars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            BARS
          </button>
          <button
            onClick={() => setVisualMode('wave')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              visualMode === 'wave' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            WAVE
          </button>
          <button
            onClick={() => setVisualMode('hybrid')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              visualMode === 'hybrid' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            HYBRID
          </button>
        </div>
      </div>

      {/* Canvas Element */}
      <div className="relative w-full flex-1 flex items-center justify-center bg-slate-950">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-full object-cover block"
        />

        {/* Overlay Message when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[2px] pointer-events-none p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center mb-3 shadow-glow-cyan">
              <Activity className="w-6 h-6 text-cyan-300" />
            </div>
            <h4 className="text-sm font-semibold tracking-wide text-white">
              ACOUSTIC ENGINE STANDBY
            </h4>
            <p className="text-xs text-cyan-300 font-mono mt-1 animate-pulse">
              CLICK PLAY TO HEAR EARTH
            </p>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="px-3.5 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>PITCH: <span className="text-cyan-300 font-bold">
            {currentRecord?.temperature ? `${(130.81 * Math.pow(659.25/130.81, currentRecord.normalized?.temperature ?? 0.5)).toFixed(1)} Hz` : '--'}
          </span></span>
          <span>FILTER: <span className="text-emerald-400 font-bold">
            {currentRecord?.humidity ? `${Math.round(4800 - (currentRecord.normalized?.humidity ?? 0.5) * 4300)} Hz` : '--'}
          </span></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>HARMONIC SYNTHESIS</span>
        </div>
      </div>
    </div>
  );
}
