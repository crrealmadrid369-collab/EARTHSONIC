import time
from datetime import datetime, date
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from utils.validation import validate_coordinates, validate_date_range
from services.nasa_power import fetch_nasa_earth_data
from services.statistics import compute_dataset_statistics
from services.sonification import get_sonification_configuration
from cache.cache_manager import cache_manager

app = FastAPI(
    title="EARTHSONIC API",
    description="Backend services for NASA Space Apps Challenge: The Earth Information Jukebox. Sonifying NASA Earth science data.",
    version="1.0.0"
)

# CORS configuration for Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Predefined benchmark locations specified in hackathon challenge
LOCATIONS: List[Dict[str, Any]] = [
    {
        "id": "tashkent",
        "name": "Tashkent",
        "country": "Uzbekistan",
        "latitude": 41.2995,
        "longitude": 69.2401,
        "region_type": "Continental Oasis / Steppe",
        "description": "Heart of Central Asia featuring high seasonal thermal amplitudes and dry continental breezes."
    },
    {
        "id": "new_york",
        "name": "New York",
        "country": "United States",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "region_type": "Coastal Metropolis",
        "description": "Atlantic coastal climate experiencing dynamic oceanic storm fronts and urban heat island effects."
    },
    {
        "id": "tokyo",
        "name": "Tokyo",
        "country": "Japan",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "region_type": "Pacific Coastal / Humid Subtropical",
        "description": "High humidity, monsoonal precipitations, and intense Pacific seasonal maritime transitions."
    },
    {
        "id": "london",
        "name": "London",
        "country": "United Kingdom",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "region_type": "Temperate Oceanic",
        "description": "Maritime climate characterized by pervasive cloud cover, frequent gentle rain, and moderate thermal swings."
    },
    {
        "id": "sahara",
        "name": "Sahara",
        "country": "Algeria / North Africa",
        "latitude": 23.8061,
        "longitude": 11.2885,
        "region_type": "Hyper-Arid Desert",
        "description": "Extreme solar irradiance, near-zero precipitation, low humidity, and high daytime thermal peaks."
    },
    {
        "id": "amazon",
        "name": "Amazon",
        "country": "Brazil / South America",
        "latitude": -3.4653,
        "longitude": -62.2159,
        "region_type": "Tropical Rainforest Basin",
        "description": "Earth's green lung featuring perpetual high humidity, heavy convective showers, and dense acoustic atmosphere."
    },
    {
        "id": "arctic",
        "name": "Arctic (Svalbard)",
        "country": "Norway / Arctic Ocean",
        "latitude": 78.2232,
        "longitude": 15.6267,
        "region_type": "High Polar Tundra",
        "description": "Sub-zero acoustic frequencies, extreme polar day/night solar variations, and rapid climate sensitivity."
    }
]

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status_code": 500,
            "message": f"Unexpected internal server error: {str(exc)}"
        }
    )

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint reporting API status, system timestamp, and cache stats.
    """
    return {
        "status": "online",
        "service": "EARTHSONIC API",
        "tagline": "Hear the planet change.",
        "scientific_source": "NASA POWER (Prediction of Worldwide Energy Resources)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cache": cache_manager.stats()
    }

@app.get("/api/locations")
async def get_locations():
    """
    Returns curated benchmark locations representing diverse planetary climate zones.
    """
    return {
        "status": "success",
        "count": len(LOCATIONS),
        "locations": LOCATIONS
    }

@app.get("/api/earth-data")
async def get_earth_data(
    latitude: float = Query(..., description="Latitude coordinate between -90 and 90"),
    longitude: float = Query(..., description="Longitude coordinate between -180 and 180"),
    start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD or YYYYMMDD)"),
    end: Optional[str] = Query(None, description="End date (YYYY-MM-DD or YYYYMMDD)")
):
    """
    Fetches, cleans, normalizes, and sonifies NASA POWER Earth science daily data.
    """
    # 1. Validation
    validate_coordinates(latitude, longitude)
    nasa_start, nasa_end, start_date, end_date = validate_date_range(start, end)

    # 2. Fetch from NASA POWER API (or cached / safe fallback)
    dataset = fetch_nasa_earth_data(
        latitude=latitude,
        longitude=longitude,
        start_str=nasa_start,
        end_str=nasa_end
    )

    # Match predefined location name if applicable
    matched_name = "Custom Coordinate"
    for loc in LOCATIONS:
        if abs(loc["latitude"] - latitude) < 0.1 and abs(loc["longitude"] - longitude) < 0.1:
            matched_name = loc["name"]
            break

    dataset["location"]["name"] = matched_name

    # 3. Compute statistics
    stats = compute_dataset_statistics(dataset.get("data", []))
    dataset["statistics"] = stats

    return dataset

@app.get("/api/statistics")
async def get_statistics(
    latitude: float = Query(...),
    longitude: float = Query(...),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None)
):
    """
    Returns comprehensive statistical indicators and climate trends for the requested coordinate and period.
    """
    validate_coordinates(latitude, longitude)
    nasa_start, nasa_end, _, _ = validate_date_range(start, end)

    dataset = fetch_nasa_earth_data(
        latitude=latitude,
        longitude=longitude,
        start_str=nasa_start,
        end_str=nasa_end
    )

    stats = compute_dataset_statistics(dataset.get("data", []))
    return {
        "source": dataset.get("source"),
        "is_demo_data": dataset.get("is_demo_data", False),
        "location": dataset.get("location"),
        "date_range": dataset.get("date_range"),
        "statistics": stats
    }

@app.get("/api/sonification-config")
async def get_sonification_specs():
    """
    Returns the acoustic mapping formulas and parameters for converting NASA data into audio.
    """
    return get_sonification_configuration()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
