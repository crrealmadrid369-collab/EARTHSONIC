import { useState, useEffect, useCallback, useRef } from 'react';
import { getEarthData, getLocations } from '../services/api';

const DEFAULT_LOCATION = {
  id: 'tashkent',
  name: 'Tashkent',
  country: 'Uzbekistan',
  latitude: 41.2995,
  longitude: 69.2401,
};

function getSafeDefaultDateRange() {
  const today = new Date();
  // Safe 30 days window lagging by 5 days for NASA daily observation latency
  const end = new Date(today);
  end.setDate(today.getDate() - 5);
  const start = new Date(end);
  start.setDate(end.getDate() - 29);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function useEarthData() {
  const [locations, setLocations] = useState([DEFAULT_LOCATION]);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [dateRange, setDateRange] = useState(getSafeDefaultDateRange);

  const [earthData, setEarthData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isDemoData, setIsDemoData] = useState(false);
  const [dataSource, setDataSource] = useState('NASA POWER');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Load predefined locations on mount
  useEffect(() => {
    let isMounted = true;
    getLocations()
      .then((res) => {
        if (isMounted && res.locations && res.locations.length > 0) {
          setLocations(res.locations);
          const tashkent = res.locations.find((l) => l.id === 'tashkent') || res.locations[0];
          setSelectedLocation(tashkent);
        }
      })
      .catch((err) => {
        console.warn("Using offline predefined locations fallback:", err.message);
      });
    return () => { isMounted = false; };
  }, []);

  // Fetch Earth science dataset
  const fetchEarthData = useCallback(async (lat, lon, start, end) => {
    const targetLat = lat !== undefined ? lat : selectedLocation.latitude;
    const targetLon = lon !== undefined ? lon : selectedLocation.longitude;
    const targetStart = start || dateRange.start;
    const targetEnd = end || dateRange.end;

    setLoading(true);
    setError(null);
    setLoadingStep('CONNECTING TO NASA DATA...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('SYNCHRONIZING EARTH DATA...');
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('CALCULATING ACOUSTIC NORMALIZATION...');
    }, 1200);

    try {
      const response = await getEarthData(targetLat, targetLon, targetStart, targetEnd);
      
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setEarthData(response.data || []);
      setStatistics(response.statistics || null);
      setIsDemoData(Boolean(response.is_demo_data));
      setDataSource(response.source || 'NASA POWER');
      setMetadata({
        location: response.location,
        dateRange: response.date_range,
        totalDays: response.total_days,
      });

      return response;
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error("Earth data fetch error:", err);
      setError(err.message || 'NASA data is temporarily unavailable.');
      throw err;
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }, [selectedLocation.latitude, selectedLocation.longitude, dateRange.start, dateRange.end]);

  // Select predefined location
  const selectLocation = useCallback((loc) => {
    setSelectedLocation(loc);
  }, []);

  // Manual map click coordinate selection
  const setCustomCoordinates = useCallback((lat, lon) => {
    setSelectedLocation({
      id: 'custom',
      name: `Custom Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      country: 'Planetary Surface',
      latitude: parseFloat(lat.toFixed(4)),
      longitude: parseFloat(lon.toFixed(4)),
    });
  }, []);

  // Change date range
  const updateDateRange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  // Trigger Hackathon Demo Mode
  const startDemoMode = useCallback(async () => {
    setIsDemoActive(true);
    const tashkent = locations.find((l) => l.name === 'Tashkent') || DEFAULT_LOCATION;
    setSelectedLocation(tashkent);

    const defaultRange = getSafeDefaultDateRange();
    setDateRange(defaultRange);

    try {
      await fetchEarthData(tashkent.latitude, tashkent.longitude, defaultRange.start, defaultRange.end);
    } catch (e) {
      // Handled in state
    }
  }, [locations, fetchEarthData]);

  // Initial load once on mount
  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchEarthData(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, dateRange.start, dateRange.end)
        .catch(() => {});
    }
  }, [fetchEarthData, dateRange.start, dateRange.end]);

  return {
    locations,
    selectedLocation,
    dateRange,
    earthData,
    metadata,
    statistics,
    isDemoData,
    dataSource,
    loading,
    loadingStep,
    error,
    isDemoActive,
    selectLocation,
    setCustomCoordinates,
    updateDateRange,
    fetchEarthData,
    startDemoMode,
  };
}
