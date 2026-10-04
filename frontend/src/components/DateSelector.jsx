import React, { useState } from 'react';
import { Calendar, Search, RefreshCw, AlertCircle } from 'lucide-react';

export function DateSelector({
  dateRange,
  onUpdateDateRange,
  onFetchData,
  loading,
}) {
  const [start, setStart] = useState(dateRange.start);
  const [end, setEnd] = useState(dateRange.end);
  const [validationError, setValidationError] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!start || !end) {
      setValidationError('Start date and end date are both required.');
      return;
    }

    if (start > end) {
      setValidationError('Start date cannot be after end date.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (end > todayStr) {
      setValidationError('End date cannot be in the future.');
      return;
    }

    onUpdateDateRange(start, end);
    onFetchData(undefined, undefined, start, end);
  };

  const setPreset = (daysBack) => {
    setValidationError('');
    const today = new Date();
    const e = new Date(today);
    e.setDate(today.getDate() - 5); // 5 days latency safety
    const s = new Date(e);
    s.setDate(e.getDate() - daysBack);

    const sStr = s.toISOString().split('T')[0];
    const eStr = e.toISOString().split('T')[0];

    setStart(sStr);
    setEnd(eStr);
    onUpdateDateRange(sStr, eStr);
    onFetchData(undefined, undefined, sStr, eStr);
  };

  return (
    <div className="w-full glass-card p-4 rounded-xl border border-slate-800">
      <form onSubmit={handleApply} className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        {/* Date Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">START OBSERVATION</label>
            <div className="relative">
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          <span className="text-slate-500 text-sm hidden md:inline mt-4">→</span>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">END OBSERVATION</label>
            <div className="relative">
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 mt-2 md:mt-4">
            <button
              type="button"
              onClick={() => setPreset(30)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700 transition-colors"
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setPreset(90)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700 transition-colors"
            >
              90 Days
            </button>
            <button
              type="button"
              onClick={() => setPreset(180)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700 transition-colors"
            >
              6 Months
            </button>
          </div>
        </div>

        {/* Action Button: GET EARTH DATA */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all shadow-glow-cyan cursor-pointer ${
              loading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold border border-cyan-300'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>QUERYING NASA...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>GET EARTH DATA</span>
              </>
            )}
          </button>
        </div>
      </form>

      {validationError && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-400 font-mono bg-rose-950/40 p-2 rounded border border-rose-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
