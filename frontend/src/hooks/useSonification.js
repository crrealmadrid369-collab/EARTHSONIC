import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Advanced Web Audio API Sonification Engine for NASA Earth Science Observations.
 * Maps:
 * - Temperature -> Fundamental Pitch & Harmony
 * - Wind Speed -> Rhythm, Pulse Cadence & LFO Tremolo
 * - Solar Radiation -> Brightness, Harmonic Overtones & FM Depth
 * - Precipitation -> Granular Percussive Rain Droplet Burst Layer
 * - Humidity -> Biquad Low-pass Filter Cutoff & Acoustic Absorption
 */
export function useSonification(earthData = []) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [layers, setLayers] = useState({
    temperature: true,
    wind: true,
    solar: true,
    rain: true,
    humidity: true,
  });

  // Audio Graph References
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const analyserRef = useRef(null);
  const humidityFilterRef = useRef(null);

  // Sound generator nodes
  const tempOscRef = useRef(null);
  const tempGainRef = useRef(null);
  const solarOscRef = useRef(null);
  const solarModRef = useRef(null);
  const solarGainRef = useRef(null);
  const windLfoRef = useRef(null);
  const windGainRef = useRef(null);

  // Playback timer ref
  const timerRef = useRef(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Initialize Audio Context on demand (complies with browser autoplay policy)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported in this browser.");
      return null;
    }

    const ctx = new AudioContextClass();

    // Analyser Node for Real-Time Visualizer
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);

    // Humidity Filter (Biquad Low-pass)
    const humidityFilter = ctx.createBiquadFilter();
    humidityFilter.type = 'lowpass';
    humidityFilter.frequency.setValueAtTime(3200, ctx.currentTime);
    humidityFilter.Q.setValueAtTime(2.0, ctx.currentTime);

    // Connect Audio Flow: [Generators] -> [Humidity Filter] -> [Master Gain] -> [Analyser] -> [Destination]
    humidityFilter.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    masterGainRef.current = masterGain;
    humidityFilterRef.current = humidityFilter;

    return ctx;
  }, [masterVolume]);

  // Trigger organic percussive rain droplet bursts based on precipitation amount
  const triggerRainBurst = useCallback((normPrecip) => {
    if (!audioCtxRef.current || !layers.rain || normPrecip <= 0.02) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    const burstCount = Math.min(8, Math.max(1, Math.floor(normPrecip * 10)));
    for (let i = 0; i < burstCount; i++) {
      const dropTime = now + (i * 0.08 * (Math.random() * 0.5 + 0.5));
      const osc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      // High ping sweeping down to imitate liquid droplet impact
      const startFreq = 1200 + Math.random() * 1600;
      osc.frequency.setValueAtTime(startFreq, dropTime);
      osc.frequency.exponentialRampToValueAtTime(300, dropTime + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(startFreq * 0.8, dropTime);
      filter.Q.setValueAtTime(5.0, dropTime);

      dropGain.gain.setValueAtTime(0.001, dropTime);
      dropGain.gain.exponentialRampToValueAtTime(0.12 * normPrecip, dropTime + 0.008);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.06);

      osc.connect(filter);
      filter.connect(dropGain);
      if (humidityFilterRef.current) {
        dropGain.connect(humidityFilterRef.current);
      }

      osc.start(dropTime);
      osc.stop(dropTime + 0.07);
    }
  }, [layers.rain]);

  // Update real-time synthesizer parameters to match current day's NASA data
  const updateSynthesizerForDay = useCallback((dayRecord) => {
    if (!audioCtxRef.current || !dayRecord) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const norm = dayRecord.normalized || {};

    const normTemp = norm.temperature ?? 0.5;
    const normWind = norm.wind ?? 0.2;
    const normSolar = norm.solar ?? 0.5;
    const normPrecip = norm.precipitation ?? 0.0;
    const normHumid = norm.humidity ?? 0.5;

    // 1. Temperature -> Pitch (C3 = 130.81 Hz to E5 = 659.25 Hz)
    const baseFreq = 130.81 * Math.pow(659.25 / 130.81, normTemp);
    if (tempOscRef.current && tempGainRef.current) {
      tempOscRef.current.frequency.cancelScheduledValues(now);
      tempOscRef.current.frequency.exponentialRampToValueAtTime(Math.max(60, baseFreq), now + 0.08);

      tempGainRef.current.gain.cancelScheduledValues(now);
      const targetGain = layers.temperature ? 0.35 : 0.0;
      tempGainRef.current.gain.linearRampToValueAtTime(targetGain, now + 0.05);
    }

    // 2. Wind Speed -> LFO tremolo modulation & rhythm rate (0.5 Hz to 8.0 Hz)
    const windRate = 0.5 + (normWind * 7.5);
    if (windLfoRef.current && windGainRef.current) {
      windLfoRef.current.frequency.cancelScheduledValues(now);
      windLfoRef.current.frequency.linearRampToValueAtTime(windRate, now + 0.08);

      windGainRef.current.gain.cancelScheduledValues(now);
      const targetWindGain = layers.wind ? (0.05 + normWind * 0.25) : 0.0;
      windGainRef.current.gain.linearRampToValueAtTime(targetWindGain, now + 0.05);
    }

    // 3. Solar Radiation -> FM synthesis brightness & shimmering harmonics
    if (solarOscRef.current && solarModRef.current && solarGainRef.current) {
      const harmonicRatio = 2.0 + Math.floor(normSolar * 4.0);
      solarOscRef.current.frequency.cancelScheduledValues(now);
      solarOscRef.current.frequency.exponentialRampToValueAtTime(baseFreq * harmonicRatio, now + 0.08);

      solarModRef.current.frequency.cancelScheduledValues(now);
      solarModRef.current.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);

      solarGainRef.current.gain.cancelScheduledValues(now);
      const targetSolarGain = layers.solar ? (0.04 + normSolar * 0.22) : 0.0;
      solarGainRef.current.gain.linearRampToValueAtTime(targetSolarGain, now + 0.05);
    }

    // 4. Humidity -> Biquad Low-pass Cutoff (350 Hz muffled humid to 4800 Hz crisp dry)
    if (humidityFilterRef.current) {
      humidityFilterRef.current.frequency.cancelScheduledValues(now);
      const targetCutoff = layers.humidity 
        ? Math.max(300, 4800 - (normHumid * 4300))
        : 5000;
      humidityFilterRef.current.frequency.exponentialRampToValueAtTime(targetCutoff, now + 0.1);
    }

    // 5. Precipitation -> Rain droplets
    if (layers.rain && normPrecip > 0.02) {
      triggerRainBurst(normPrecip);
    }
  }, [layers, triggerRainBurst]);

  const stopAudioGenerators = useCallback(() => {
    try {
      if (tempOscRef.current) {
        tempOscRef.current.stop();
        tempOscRef.current.disconnect();
        tempOscRef.current = null;
      }
      if (solarOscRef.current) {
        solarOscRef.current.stop();
        solarOscRef.current.disconnect();
        solarOscRef.current = null;
      }
      if (solarModRef.current) {
        solarModRef.current.stop();
        solarModRef.current.disconnect();
        solarModRef.current = null;
      }
      if (windOscRef.current) {
        windOscRef.current.stop();
        windOscRef.current.disconnect();
        windOscRef.current = null;
      }
      if (windLfoRef.current) {
        windLfoRef.current.stop();
        windLfoRef.current.disconnect();
        windLfoRef.current = null;
      }
    } catch {
      // Node may already have stopped
    }
  }, []);

  // Start continuous oscillator nodes
  const startAudioGenerators = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Clean any prior dangling nodes
    stopAudioGenerators();

    // 1. Temperature Voice (Sine + Warm harmonics)
    const tempOsc = ctx.createOscillator();
    const tempGain = ctx.createGain();
    tempOsc.type = 'sine';
    tempOsc.frequency.setValueAtTime(220, now);
    tempGain.gain.setValueAtTime(0.001, now);
    tempOsc.connect(tempGain);
    if (humidityFilterRef.current) tempGain.connect(humidityFilterRef.current);
    tempOsc.start(now);

    tempOscRef.current = tempOsc;
    tempGainRef.current = tempGain;

    // 2. Solar Shimmer Voice (Modulated Sine)
    const solarOsc = ctx.createOscillator();
    const solarMod = ctx.createOscillator();
    const solarModGain = ctx.createGain();
    const solarGain = ctx.createGain();

    solarOsc.type = 'triangle';
    solarMod.type = 'sine';
    solarMod.frequency.setValueAtTime(330, now);
    solarModGain.gain.setValueAtTime(80, now);
    solarMod.connect(solarModGain);
    solarModGain.connect(solarOsc.frequency);

    solarGain.gain.setValueAtTime(0.001, now);
    solarOsc.connect(solarGain);
    if (humidityFilterRef.current) solarGain.connect(humidityFilterRef.current);

    solarOsc.start(now);
    solarMod.start(now);

    solarOscRef.current = solarOsc;
    solarModRef.current = solarMod;
    solarGainRef.current = solarGain;

    // 3. Wind Kinetic Voice (Filtered sub-harmonic with LFO tremolo)
    const windOsc = ctx.createOscillator();
    const windGain = ctx.createGain();
    const windLfo = ctx.createOscillator();
    const windLfoGain = ctx.createGain();

    windOsc.type = 'sawtooth';
    windOsc.frequency.setValueAtTime(85, now);

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(160, now);

    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(2.0, now);
    windLfoGain.gain.setValueAtTime(0.5, now);
    windLfo.connect(windLfoGain);

    windOsc.connect(windFilter);
    windFilter.connect(windGain);
    if (humidityFilterRef.current) windGain.connect(humidityFilterRef.current);

    windOsc.start(now);
    windLfo.start(now);

    windOscRef.current = windOsc;
    windGainRef.current = windGain;
    windLfoRef.current = windLfo;
  }, [initAudio, stopAudioGenerators]);

  // Play / Resume
  const play = useCallback(() => {
    if (!earthData || earthData.length === 0) return;
    initAudio();
    startAudioGenerators();
    setIsPlaying(true);
  }, [earthData, initAudio, startAudioGenerators]);

  // Pause
  const pause = useCallback(() => {
    setIsPlaying(false);
    stopAudioGenerators();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopAudioGenerators]);

  // Stop & Reset
  const stop = useCallback(() => {
    pause();
    setCurrentIndex(0);
  }, [pause]);

  // Timeline Stepping Interval
  useEffect(() => {
    if (!isPlaying || !earthData || earthData.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(120, Math.floor(900 / playbackSpeed));

    // Update sound immediately on play
    updateSynthesizerForDay(earthData[currentIndexRef.current]);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= earthData.length) {
          // Loop seamlessly or stop
          updateSynthesizerForDay(earthData[0]);
          return 0;
        }
        updateSynthesizerForDay(earthData[next]);
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, earthData, playbackSpeed, updateSynthesizerForDay]);

  // Update master volume when state changes
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
      masterGainRef.current.gain.linearRampToValueAtTime(
        masterVolume, 
        audioCtxRef.current.currentTime + 0.05
      );
    }
  }, [masterVolume]);

  // Toggle individual layers
  const toggleLayer = useCallback((layerName) => {
    setLayers((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  }, []);

  // Scrub timeline to specific day index
  const seekTo = useCallback((index) => {
    if (!earthData || index < 0 || index >= earthData.length) return;
    setCurrentIndex(index);
    if (isPlaying) {
      updateSynthesizerForDay(earthData[index]);
    }
  }, [earthData, isPlaying, updateSynthesizerForDay]);

  // Cleanup on unmount to prevent audio leaks
  useEffect(() => {
    return () => {
      stopAudioGenerators();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [stopAudioGenerators]);

  const currentRecord = earthData && earthData[currentIndex] ? earthData[currentIndex] : null;

  return {
    isPlaying,
    currentIndex,
    currentRecord,
    playbackSpeed,
    masterVolume,
    layers,
    analyserNode: analyserRef.current,
    play,
    pause,
    stop,
    seekTo,
    setPlaybackSpeed,
    setMasterVolume,
    toggleLayer,
  };
}
