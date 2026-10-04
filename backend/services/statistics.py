from typing import List, Dict, Any
import numpy as np
import pandas as pd

def calculate_metric_stats(values: List[float], metric_name: str, unit: str) -> Dict[str, Any]:
    """
    Computes statistical indicators for an array of values using NumPy and Pandas.
    """
    if not values:
        return {
            "name": metric_name,
            "unit": unit,
            "average": 0.0,
            "min": 0.0,
            "max": 0.0,
            "median": 0.0,
            "std": 0.0,
            "trend": {
                "direction": "Stable",
                "slope": 0.0,
                "change_percent": 0.0
            }
        }

    arr = np.array(values, dtype=float)
    mean_val = float(np.mean(arr))
    min_val = float(np.min(arr))
    max_val = float(np.max(arr))
    median_val = float(np.median(arr))
    std_val = float(np.std(arr))

    # Trend computation via linear regression slope
    n = len(arr)
    if n > 1:
        x = np.arange(n)
        slope, _ = np.polyfit(x, arr, 1)
        slope_val = float(slope)
        
        # Percentage change from start period to end period
        first_segment_mean = np.mean(arr[:max(1, n // 3)])
        last_segment_mean = np.mean(arr[-max(1, n // 3):])
        if abs(first_segment_mean) > 1e-4:
            change_pct = float(((last_segment_mean - first_segment_mean) / abs(first_segment_mean)) * 100)
        else:
            change_pct = float((last_segment_mean - first_segment_mean) * 100)

        # Classify trend direction
        norm_std = std_val if std_val > 0.01 else 1.0
        relative_slope = slope_val * n / norm_std
        if relative_slope > 0.5:
            direction = "Rising"
        elif relative_slope < -0.5:
            direction = "Falling"
        else:
            direction = "Stable"
    else:
        slope_val = 0.0
        change_pct = 0.0
        direction = "Stable"

    return {
        "name": metric_name,
        "unit": unit,
        "average": round(mean_val, 2),
        "min": round(min_val, 2),
        "max": round(max_val, 2),
        "median": round(median_val, 2),
        "std": round(std_val, 2),
        "trend": {
            "direction": direction,
            "slope": round(slope_val, 4),
            "change_percent": round(change_pct, 1)
        }
    }

def compute_dataset_statistics(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes summary statistics for all 5 core NASA Earth observation parameters.
    """
    if not records:
        return {}

    df = pd.DataFrame(records)

    temps = df["temperature"].tolist() if "temperature" in df else []
    winds = df["wind_speed"].tolist() if "wind_speed" in df else []
    precips = df["precipitation"].tolist() if "precipitation" in df else []
    solars = df["solar_radiation"].tolist() if "solar_radiation" in df else []
    humids = df["humidity"].tolist() if "humidity" in df else []

    return {
        "temperature": calculate_metric_stats(temps, "Temperature", "°C"),
        "wind_speed": calculate_metric_stats(winds, "Wind Speed", "m/s"),
        "precipitation": calculate_metric_stats(precips, "Precipitation", "mm"),
        "solar_radiation": calculate_metric_stats(solars, "Solar Radiation", "kWh/m²/day"),
        "humidity": calculate_metric_stats(humids, "Relative Humidity", "%"),
        "observations_count": len(records)
    }
