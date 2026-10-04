from typing import Dict, Any, List

def get_sonification_configuration() -> Dict[str, Any]:
    """
    Returns the comprehensive NASA data-to-sound scientific mapping specifications
    used both by backend analysis and Web Audio API synthesis engine.
    """
    return {
        "engine": "Web Audio API Hybrid Synthesizer",
        "parameters": {
            "temperature": {
                "name": "Temperature (T2M)",
                "unit": "°C",
                "mapping_target": "Pitch / Fundamental Frequency",
                "min_freq_hz": 130.81,  # C3
                "max_freq_hz": 659.25,  # E5
                "scale_type": "Minor Pentatonic / Microtonal Scientific",
                "notes": ["C3", "Eb3", "F3", "G3", "Bb3", "C4", "Eb4", "F4", "G4", "Bb4", "C5", "Eb5", "E5"],
                "formula": "freq = min_freq * pow(max_freq / min_freq, normalized_temp)",
                "description": "Temperature determines the central melodic pitch. Warming trends elevate the acoustic pitch higher into the audible spectrum, while cold spells descend into deep bass registers."
            },
            "wind_speed": {
                "name": "Wind Speed (WS10M)",
                "unit": "m/s",
                "mapping_target": "Rhythm / Pulse Speed & Tremolo",
                "min_bpm": 50,
                "max_bpm": 220,
                "lfo_min_rate_hz": 0.5,
                "lfo_max_rate_hz": 8.0,
                "formula": "bpm = 50 + (normalized_wind * 170)",
                "description": "Wind kinetic energy controls the playback cadence, arp subdivision, and LFO amplitude modulation. Calmer winds produce gentle pulses; violent gale speeds accelerate into rapid percussive flutter."
            },
            "solar_radiation": {
                "name": "Solar Radiation (ALLSKY_SFC_SW_DWN)",
                "unit": "kWh/m²/day",
                "mapping_target": "Brightness / Harmonic Richness & Amplitude",
                "min_gain": 0.15,
                "max_gain": 0.95,
                "harmonic_index_min": 1,
                "harmonic_index_max": 7,
                "formula": "harmonics = 1 + floor(normalized_solar * 6); gain = 0.15 + (normalized_solar * 0.8)",
                "description": "Solar downward shortwave irradiance introduces shimmering harmonic overtones via FM synthesis index and oscillator wave-shaping, illuminating the audio texture."
            },
            "precipitation": {
                "name": "Precipitation (PRECTOTCORR)",
                "unit": "mm/day",
                "mapping_target": "Percussive Rain Granular Density",
                "drop_density_min": 0,
                "drop_density_max": 40,
                "filter_q": 4.5,
                "formula": "drops_per_sec = normalized_precip * 40",
                "description": "Precipitation triggers an acoustic water drop and band-passed noise burst layer. Dry periods are silent; heavier rain showers generate rapid granular droplet textures."
            },
            "humidity": {
                "name": "Relative Humidity (RH2M)",
                "unit": "%",
                "mapping_target": "Acoustic Atmosphere / Low-pass Filter Cutoff",
                "min_cutoff_hz": 350,   # High humidity = dense, muffled, sub-aquatic dampness
                "max_cutoff_hz": 4800,  # Low humidity = crisp, resonant, open air
                "resonance_q": 2.2,
                "formula": "cutoff_hz = 4800 - (normalized_humidity * 4450)",
                "description": "Moisture in the atmosphere creates acoustic absorption. Dry air yields sharp, crisp high frequencies, whereas dense tropical humidity absorbs high frequencies, muffling the spectrum into a submerged ambient drone."
            }
        },
        "presets": {
            "default": {
                "active_layers": {
                    "temperature": True,
                    "wind": True,
                    "solar": True,
                    "precipitation": True,
                    "humidity": True
                },
                "speed": 1.0,
                "master_volume": 0.8
            }
        }
    }
