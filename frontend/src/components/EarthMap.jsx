import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Custom glowing pin SVG icon
const createGlowIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: ${isSelected ? '26px' : '18px'};
          height: ${isSelected ? '26px' : '18px'};
          border-radius: 50%;
          background: ${isSelected ? 'rgba(6, 182, 212, 0.45)' : 'rgba(59, 130, 246, 0.3)'};
          animation: pulse 2s infinite;
          border: 1px solid ${isSelected ? '#00f2fe' : '#38bdf8'};
        "></div>
        <div style="
          width: ${isSelected ? '12px' : '9px'};
          height: ${isSelected ? '12px' : '9px'};
          border-radius: 50%;
          background: ${isSelected ? '#00f2fe' : '#60a5fa'};
          box-shadow: 0 0 10px ${isSelected ? '#00f2fe' : '#3b82f6'};
          border: 2px solid #ffffff;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to handle map clicks for coordinate selection
function MapClickHandler({ onSelectCoordinates }) {
  useMapEvents({
    click(e) {
      onSelectCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to center map smoothly when location changes
function MapRecenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom() > 4 ? map.getZoom() : 4, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [lat, lon, map]);
  return null;
}

export function EarthMap({
  locations = [],
  selectedLocation,
  onSelectLocation,
  onSelectCoordinates,
}) {
  const currentLat = selectedLocation ? selectedLocation.latitude : 41.2995;
  const currentLon = selectedLocation ? selectedLocation.longitude : 69.2401;

  return (
    <div className="relative w-full h-[360px] lg:h-[420px] rounded-xl overflow-hidden border border-cyan-500/20 glass-panel shadow-glass flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md text-xs font-mono">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">LAT:</span>
          <span className="text-cyan-300 font-bold">{currentLat.toFixed(4)}°</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">LON:</span>
          <span className="text-cyan-300 font-bold">{currentLon.toFixed(4)}°</span>
        </div>

        <div className="pointer-events-auto px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-700/60 text-[11px] text-slate-400 font-mono">
          Click any point on Earth
        </div>
      </div>

      {/* Leaflet Container */}
      <div className="w-full flex-1">
        <MapContainer
          center={[currentLat, currentLon]}
          zoom={3}
          minZoom={2}
          maxZoom={10}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* OpenStreetMap Tile Layer with Custom Inverted Dark Filter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          <MapClickHandler onSelectCoordinates={onSelectCoordinates} />
          <MapRecenter lat={currentLat} lon={currentLon} />

          {/* Predefined Location Markers */}
          {locations.map((loc) => {
            const isSelected = selectedLocation && selectedLocation.name === loc.name;
            return (
              <Marker
                key={loc.id || loc.name}
                position={[loc.latitude, loc.longitude]}
                icon={createGlowIcon(isSelected)}
                eventHandlers={{
                  click: () => onSelectLocation(loc),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 font-sans text-slate-900">
                    <p className="font-bold text-sm text-cyan-900">{loc.name}</p>
                    <p className="text-xs text-slate-600">{loc.country}</p>
                    <p className="text-[10px] font-mono mt-1 text-slate-500">
                      {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Marker for Custom Selected Point if not in predefined */}
          {selectedLocation && selectedLocation.id === 'custom' && (
            <Marker
              position={[selectedLocation.latitude, selectedLocation.longitude]}
              icon={createGlowIcon(true)}
            >
              <Popup>
                <div className="p-1 font-sans text-slate-900">
                  <p className="font-bold text-sm">Selected Coordinate</p>
                  <p className="text-xs font-mono">
                    {selectedLocation.latitude.toFixed(4)}°, {selectedLocation.longitude.toFixed(4)}°
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Map Footer Bar */}
      <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="truncate">
          TARGET: <span className="text-slate-200 font-semibold">{selectedLocation ? selectedLocation.name : 'Unknown'}</span>
        </span>
        <span className="text-cyan-400/80">Leaflet / OpenStreetMap</span>
      </div>
    </div>
  );
}
