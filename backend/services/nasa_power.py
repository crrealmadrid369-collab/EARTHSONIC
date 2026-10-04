import logging
import requests
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from fastapi import HTTPException

from cache.cache_manager import cache_manager

logger = logging.getLogger("earthsonic.nasa")
logging.basicConfig(level=logging.INFO)

NASA_POWER_API_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
NASA_PARAMETERS = [
    "T2M",
    "T2M_MAX",
    "T2M_MIN",
    "WS10M",
    "PRECTOTCORR",
    "RH2M",
    "ALLSKY_SFC_SW_DWN"
]

def clean_nasa_value(val: Any, default_val: float = 0.0) -> float:
    """
    Cleans NASA missing value indicators (-999, -999.0, -99.0).
    """
    if val is None:
        return default_val
    try:
        fval = float(val)
        if fval <= -900.0:
            return default_val
        return round(fval, 2)
    except (ValueError, TypeError):
        return default_val

def generate_fallback_demo_dataset(latitude: float, longitude: float, start_str: str, end_str: str) -> Dict[str, Any]:
    """
    Deterministic offline fallback dataset strictly used ONLY when NASA API is unreachable.
    Clearly marked as DEMO DATA.
    """
    try:
        s_date = datetime.strptime(start_str, "%Y%m%d").date()
        e_date = datetime.strptime(end_str, "%Y%m%d").date()
    except Exception:
        s_date = date.today() - timedelta(days=35)
        e_date = date.today() - timedelta(days=5)

    delta_days = (e_date - s_date).days + 1
    if delta_days <= 0:
        delta_days = 30

    records = []
    import math
    for i in range(delta_days):
        day = s_date + timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        # Generate physically plausible smooth variations based on location & seasonal cycle
        seasonal_phase = (day.timetuple().tm_yday / 365.25) * 2 * math.pi
        lat_rad = math.radians(latitude)
        
        base_temp = 18.0 * math.cos(lat_rad) + 10.0 * math.sin(seasonal_phase)
        daily_fluct = 3.5 * math.sin(i * 0.45)
        temp = round(base_temp + daily_fluct, 2)
        temp_max = round(temp + 4.5 + abs(math.sin(i * 0.3)), 2)
        temp_min = round(temp - 4.5 - abs(math.cos(i * 0.3)), 2)
        
        wind = round(max(0.5, 3.2 + 2.1 * math.sin(i * 0.6) + 1.2 * math.cos(i * 0.2)), 2)
        precip = round(max(0.0, 5.0 * math.sin(i * 0.35) - 2.0 if math.sin(i * 0.35) > 0.4 else 0.0), 2)
        humid = round(min(98.0, max(20.0, 55.0 + 25.0 * math.cos(i * 0.4) + precip * 3)), 1)
        solar = round(max(0.5, 5.8 * math.cos(lat_rad * 0.7) + 2.2 * math.sin(seasonal_phase) - (precip * 0.3)), 2)

        norm_temp = round(max(0.0, min(1.0, (temp - (-20.0)) / 65.0)), 3)
        norm_wind = round(max(0.0, min(1.0, wind / 20.0)), 3)
        norm_solar = round(max(0.0, min(1.0, solar / 10.0)), 3)
        norm_precip = round(max(0.0, min(1.0, precip / 30.0)), 3)
        norm_humid = round(max(0.0, min(1.0, humid / 100.0)), 3)

        records.append({
            "date": day_str,
            "raw_date": day.strftime("%Y%m%d"),
            "temperature": temp,
            "temp_max": temp_max,
            "temp_min": temp_min,
            "wind_speed": wind,
            "precipitation": precip,
            "humidity": humid,
            "solar_radiation": solar,
            "normalized": {
                "temperature": norm_temp,
                "wind": norm_wind,
                "solar": norm_solar,
                "precipitation": norm_precip,
                "humidity": norm_humid
            }
        })

    return {
        "source": "DEMO DATA (NASA API Offline Fallback)",
        "is_demo_data": True,
        "location": {
            "latitude": round(latitude, 4),
            "longitude": round(longitude, 4),
        },
        "date_range": {
            "start": s_date.strftime("%Y-%m-%d"),
            "end": e_date.strftime("%Y-%m-%d")
        },
        "total_days": len(records),
        "data": records
    }

def fetch_nasa_earth_data(latitude: float, longitude: float, start_str: str, end_str: str) -> Dict[str, Any]:
    """
    Fetches daily Earth science parameters from NASA POWER API, normalizes and cleans the response.
    Implements in-memory caching and strict fallback handling.
    """
    # 1. Check in-memory cache
    cached = cache_manager.get(latitude, longitude, start_str, end_str)
    if cached:
        logger.info(f"Returning cached NASA data for lat={latitude}, lon={longitude}, range={start_str}-{end_str}")
        return cached

    # 2. Prepare API call
    params = {
        "parameters": ",".join(NASA_PARAMETERS),
        "community": "RE",
        "longitude": round(longitude, 4),
        "latitude": round(latitude, 4),
        "start": start_str,
        "end": end_str,
        "format": "JSON"
    }

    try:
        logger.info(f"Querying NASA POWER API: {params}")
        response = requests.get(NASA_POWER_API_URL, params=params, timeout=25)
        
        if response.status_code == 400:
            err_msg = "NASA POWER API rejected the parameters or date range."
            try:
                nasa_json = response.json()
                if "messages" in nasa_json:
                    err_msg += f" Details: {nasa_json['messages']}"
            except Exception:
                pass
            raise HTTPException(status_code=400, detail=err_msg)
        
        if response.status_code >= 500:
            logger.warning(f"NASA POWER API returned server error status {response.status_code}. Using fallback demo dataset.")
            fallback = generate_fallback_demo_dataset(latitude, longitude, start_str, end_str)
            return fallback

        response.raise_for_status()
        raw_data = response.json()

    except requests.exceptions.Timeout:
        logger.warning("NASA POWER API timed out after 25s. Providing demo fallback data with explicit DEMO DATA label.")
        return generate_fallback_demo_dataset(latitude, longitude, start_str, end_str)
    except requests.exceptions.ConnectionError:
        logger.warning("NASA POWER API connection failed. Providing demo fallback data with explicit DEMO DATA label.")
        return generate_fallback_demo_dataset(latitude, longitude, start_str, end_str)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error communicating with NASA: {e}")
        return generate_fallback_demo_dataset(latitude, longitude, start_str, end_str)

    # 3. Parse and normalize NASA response
    try:
        parameter_dict = raw_data.get("properties", {}).get("parameter", {})
        if not parameter_dict:
            raise ValueError("NASA POWER API returned empty parameter property.")

        t2m_dict = parameter_dict.get("T2M", {})
        t2m_max_dict = parameter_dict.get("T2M_MAX", {})
        t2m_min_dict = parameter_dict.get("T2M_MIN", {})
        ws10m_dict = parameter_dict.get("WS10M", {})
        prectot_dict = parameter_dict.get("PRECTOTCORR", {})
        rh2m_dict = parameter_dict.get("RH2M", {})
        allsky_dict = parameter_dict.get("ALLSKY_SFC_SW_DWN", {})

        # Collect sorted unique date keys
        all_dates = sorted(list(t2m_dict.keys()))
        if not all_dates:
            logger.warning("No dates found in NASA parameter dictionary. Using fallback dataset.")
            return generate_fallback_demo_dataset(latitude, longitude, start_str, end_str)

        records: List[Dict[str, Any]] = []

        # Find min and max observed for adaptive normalization
        valid_temps = [clean_nasa_value(t2m_dict.get(d)) for d in all_dates if t2m_dict.get(d) is not None and float(t2m_dict.get(d, -999)) > -900]
        min_temp_obs = min(valid_temps) if valid_temps else -10.0
        max_temp_obs = max(valid_temps) if valid_temps else 35.0
        temp_span = max(1.0, max_temp_obs - min_temp_obs)

        for d_str in all_dates:
            try:
                date_formatted = datetime.strptime(d_str, "%Y%m%d").strftime("%Y-%m-%d")
            except Exception:
                date_formatted = d_str

            t = clean_nasa_value(t2m_dict.get(d_str), default_val=min_temp_obs)
            t_max = clean_nasa_value(t2m_max_dict.get(d_str), default_val=t + 3.0)
            t_min = clean_nasa_value(t2m_min_dict.get(d_str), default_val=t - 3.0)
            w = clean_nasa_value(ws10m_dict.get(d_str), default_val=2.5)
            p = max(0.0, clean_nasa_value(prectot_dict.get(d_str), default_val=0.0))
            h = min(100.0, max(0.0, clean_nasa_value(rh2m_dict.get(d_str), default_val=50.0)))
            s = max(0.0, clean_nasa_value(allsky_dict.get(d_str), default_val=4.5))

            # Scientific normalization into [0.0, 1.0] for audio synthesis
            norm_temp = round(max(0.0, min(1.0, (t - min_temp_obs) / temp_span)), 3)
            norm_wind = round(max(0.0, min(1.0, w / 20.0)), 3)
            norm_solar = round(max(0.0, min(1.0, s / 10.0)), 3)
            norm_precip = round(max(0.0, min(1.0, p / 35.0)), 3)
            norm_humid = round(max(0.0, min(1.0, h / 100.0)), 3)

            records.append({
                "date": date_formatted,
                "raw_date": d_str,
                "temperature": t,
                "temp_max": t_max,
                "temp_min": t_min,
                "wind_speed": w,
                "precipitation": p,
                "humidity": h,
                "solar_radiation": s,
                "normalized": {
                    "temperature": norm_temp,
                    "wind": norm_wind,
                    "solar": norm_solar,
                    "precipitation": norm_precip,
                    "humidity": norm_humid
                }
            })

        parsed_start = datetime.strptime(start_str, "%Y%m%d").strftime("%Y-%m-%d")
        parsed_end = datetime.strptime(end_str, "%Y%m%d").strftime("%Y-%m-%d")

        result = {
            "source": "NASA POWER",
            "is_demo_data": False,
            "location": {
                "latitude": round(latitude, 4),
                "longitude": round(longitude, 4),
            },
            "date_range": {
                "start": parsed_start,
                "end": parsed_end
            },
            "total_days": len(records),
            "data": records
        }

        # Cache for 1 hour
        cache_manager.set(latitude, longitude, start_str, end_str, result, ttl=3600)
        return result

    except Exception as e:
        logger.error(f"Error parsing NASA POWER payload: {e}")
        return generate_fallback_demo_dataset(latitude, longitude, start_str, end_str)
