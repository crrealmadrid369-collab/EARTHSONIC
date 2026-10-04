import re
from datetime import datetime, date, timedelta
from typing import Tuple, Optional
from fastapi import HTTPException

DATE_REGEX_HYPHEN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATE_REGEX_COMPACT = re.compile(r"^\d{8}$")

def parse_date(date_str: str) -> date:
    """
    Parses a date string in YYYYMMDD or YYYY-MM-DD format.
    Raises HTTPException(400) if invalid.
    """
    if not date_str:
        raise HTTPException(status_code=400, detail="Date string cannot be empty.")
    
    clean_str = date_str.strip()
    try:
        if DATE_REGEX_HYPHEN.match(clean_str):
            return datetime.strptime(clean_str, "%Y-%m-%d").date()
        elif DATE_REGEX_COMPACT.match(clean_str):
            return datetime.strptime(clean_str, "%Y%m%d").date()
        else:
            raise ValueError()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid date format: '{date_str}'. Expected 'YYYY-MM-DD' or 'YYYYMMDD'."
        )

def validate_coordinates(latitude: float, longitude: float) -> None:
    """
    Validates latitude (-90 to 90) and longitude (-180 to 180).
    """
    if latitude is None or longitude is None:
        raise HTTPException(status_code=400, detail="Latitude and longitude are required.")
    
    try:
        lat = float(latitude)
        lon = float(longitude)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Latitude and longitude must be valid floating-point numbers.")

    if not (-90.0 <= lat <= 90.0):
        raise HTTPException(
            status_code=400,
            detail=f"Latitude {lat} is out of bounds. Valid range is -90.0 to 90.0."
        )

    if not (-180.0 <= lon <= 180.0):
        raise HTTPException(
            status_code=400,
            detail=f"Longitude {lon} is out of bounds. Valid range is -180.0 to 180.0."
        )

def validate_date_range(start_str: Optional[str], end_str: Optional[str]) -> Tuple[str, str, date, date]:
    """
    Validates date range, handles defaults (past 30 days up to 5 days ago to respect NASA observation latency).
    Returns (nasa_start, nasa_end, start_date_obj, end_date_obj).
    """
    today = date.today()
    # NASA POWER daily data typically lags 3-5 days behind today
    safe_end = today - timedelta(days=5)
    safe_start = safe_end - timedelta(days=30)

    if not start_str or not end_str:
        start_d = safe_start
        end_d = safe_end
    else:
        start_d = parse_date(start_str)
        end_d = parse_date(end_str)

    if start_d > end_d:
        raise HTTPException(
            status_code=400,
            detail=f"Start date ({start_d}) cannot be after end date ({end_d})."
        )

    if end_d > today:
        raise HTTPException(
            status_code=400,
            detail=f"End date ({end_d}) cannot be in the future. Today is {today}."
        )

    # Check maximum range limit (365 days)
    delta_days = (end_d - start_d).days
    if delta_days > 366:
        raise HTTPException(
            status_code=400,
            detail=f"Requested range of {delta_days} days is too large. Maximum supported range is 365 days."
        )

    nasa_start = start_d.strftime("%Y%m%d")
    nasa_end = end_d.strftime("%Y%m%d")

    return nasa_start, nasa_end, start_d, end_d
