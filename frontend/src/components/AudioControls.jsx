import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Calendar,
  Sparkles
} from 'lucide-react';

export function AudioControls({
  isPlaying,
  currentIndex,
  totalDays,
  currentRecord,
  playbackSpeed,
  masterVolume,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onSetSpeed,
  onSetVolume,
}) {
  const speeds = [0.5, 1.0, 1.5, 2.0];

  return (
    <div className="w-full glass-panel-glow p-4 rounded-xl border border-cyan-500/30 shadow-glass flex flex-col gap-3.5">
      {/* Top Timeline Progress Scrubber */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">TIMELINE PROGRESS</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">
              DAY {totalDays > 0 ? currentIndex + 1 : 0} OF {totalDays}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-semibold">{currentRecord?.date || '--'}</span>
          </div>
        </div>

        {/* Range Slider for Timeline Scrubbing */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalDays - 1)}
            value={currentIndex}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            disabled={totalDays === 0}
            aria-label="Timeline scrubber"
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={onPlay}
              disabled={totalDays === 0}
              aria-label="Play sound"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-glow-cyan cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>PLAY</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              aria-label="Pause sound"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>PAUSE</span>
            </button>
          )}

          <button
            onClick={onStop}
            disabled={totalDays === 0}
            aria-label="Stop sound"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer disabled:opacity-50"
          >
            <Square className="w-3.5 h-3.5" />
            <span>STOP</span>
          </button>
        </div>

        {/* Speed Multiplier Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-1.5 font-bold">SPEED:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              aria-label={`Set speed to ${s}x`}
              className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                playbackSpeed === s
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => onSetVolume(masterVolume === 0 ? 0.8 : 0)}
            className="text-slate-400 hover:text-cyan-400 transition-colors"
            aria-label={masterVolume === 0 ? "Unmute sound" : "Mute sound"}
          >
            {masterVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={masterVolume}
            onChange={(e) => onSetVolume(parseFloat(e.target.value))}
            aria-label="Master volume"
            className="w-20 sm:w-28 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="w-8 text-right text-slate-300 font-mono text-[11px]">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
