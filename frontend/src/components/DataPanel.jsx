import React from 'react';
import { DataCard } from './DataCard';
import { Calendar, Database } from 'lucide-react';

export function DataPanel({
  earthData = [],
  currentRecord,
  statistics,
  layers,
  dataSource,
  isDemoData,
}) {
  const latestOrCurrent = currentRecord || (earthData.length > 0 ? earthData[earthData.length - 1] : null);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Panel Sub-header */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>CURRENT DATE:</span>
          <span className="text-cyan-300 font-bold">
            {latestOrCurrent?.date || 'No Data Selected'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <Database className="w-3 h-3 text-slate-500" />
          <span>{earthData.length} OBSERVATIONS</span>
        </div>
      </div>

      {/* Grid of 5 NASA Parameter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-2.5">
        <DataCard
          type="temperature"
          label="Temperature (T2M)"
          value={latestOrCurrent?.temperature ?? '--'}
          currentValue={currentRecord?.temperature}
          unit="°C"
          stats={statistics?.temperature}
          isActiveLayer={layers?.temperature}
        />

        <DataCard
          type="wind"
          label="Wind Speed (WS10M)"
          value={latestOrCurrent?.wind_speed ?? '--'}
          currentValue={currentRecord?.wind_speed}
          unit="m/s"
          stats={statistics?.wind_speed}
          isActiveLayer={layers?.wind}
        />

        <DataCard
          type="solar"
          label="Solar Irradiance (ALLSKY)"
          value={latestOrCurrent?.solar_radiation ?? '--'}
          currentValue={currentRecord?.solar_radiation}
          unit="kWh/m²/day"
          stats={statistics?.solar_radiation}
          isActiveLayer={layers?.solar}
        />

        <DataCard
          type="precipitation"
          label="Precipitation (PRECTOT)"
          value={latestOrCurrent?.precipitation ?? '--'}
          currentValue={currentRecord?.precipitation}
          unit="mm"
          stats={statistics?.precipitation}
          isActiveLayer={layers?.rain}
        />

        <DataCard
          type="humidity"
          label="Relative Humidity (RH2M)"
          value={latestOrCurrent?.humidity ?? '--'}
          currentValue={currentRecord?.humidity}
          unit="%"
          stats={statistics?.humidity}
          isActiveLayer={layers?.humidity}
        />
      </div>
    </div>
  );
}
