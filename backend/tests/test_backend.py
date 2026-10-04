import pytest
from datetime import date, timedelta
from fastapi import HTTPException
from fastapi.testclient import TestClient

from main import app
from utils.validation import validate_coordinates, validate_date_range, parse_date
from services.nasa_power import clean_nasa_value, generate_fallback_demo_dataset
from services.statistics import compute_dataset_statistics, calculate_metric_stats
from services.sonification import get_sonification_configuration

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "NASA POWER" in data["scientific_source"]
    assert "cache" in data

def test_locations_endpoint():
    response = client.get("/api/locations")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 7
    loc_names = [l["name"] for l in data["locations"]]
    assert "Tashkent" in loc_names
    assert "New York" in loc_names
    assert "Tokyo" in loc_names
    assert "London" in loc_names
    assert "Sahara" in loc_names
    assert "Amazon" in loc_names
    assert "Arctic (Svalbard)" in loc_names

def test_sonification_config_endpoint():
    response = client.get("/api/sonification-config")
    assert response.status_code == 200
    data = response.json()
    assert "parameters" in data
    params = data["parameters"]
    assert "temperature" in params
    assert "wind_speed" in params
    assert "solar_radiation" in params
    assert "precipitation" in params
    assert "humidity" in params
    assert params["temperature"]["mapping_target"] == "Pitch / Fundamental Frequency"

def test_coordinate_validation():
    # Valid coordinates
    validate_coordinates(41.2995, 69.2401)
    validate_coordinates(-90.0, 180.0)
    validate_coordinates(90.0, -180.0)

    # Invalid latitude
    with pytest.raises(HTTPException) as exc_info:
        validate_coordinates(95.0, 10.0)
    assert exc_info.value.status_code == 400

    # Invalid longitude
    with pytest.raises(HTTPException) as exc_info:
        validate_coordinates(10.0, 200.0)
    assert exc_info.value.status_code == 400

def test_date_validation():
    today = date.today()
    past_10 = (today - timedelta(days=10)).strftime("%Y-%m-%d")
    past_20 = (today - timedelta(days=20)).strftime("%Y-%m-%d")
    future = (today + timedelta(days=5)).strftime("%Y-%m-%d")

    # Valid range
    s_nasa, e_nasa, _, _ = validate_date_range(past_20, past_10)
    assert len(s_nasa) == 8
    assert len(e_nasa) == 8

    # Start after End
    with pytest.raises(HTTPException) as exc_info:
        validate_date_range(past_10, past_20)
    assert exc_info.value.status_code == 400

    # Future date
    with pytest.raises(HTTPException) as exc_info:
        validate_date_range(past_20, future)
    assert exc_info.value.status_code == 400

    # Invalid format
    with pytest.raises(HTTPException) as exc_info:
        parse_date("not-a-date")
    assert exc_info.value.status_code == 400

def test_clean_nasa_value():
    assert clean_nasa_value(23.45) == 23.45
    assert clean_nasa_value("-999.0") == 0.0
    assert clean_nasa_value(-999, default_val=15.0) == 15.0
    assert clean_nasa_value(None, default_val=5.0) == 5.0

def test_statistics_calculation():
    sample_records = [
        {"temperature": 10.0, "wind_speed": 2.0, "precipitation": 0.0, "solar_radiation": 4.0, "humidity": 50.0},
        {"temperature": 15.0, "wind_speed": 3.0, "precipitation": 5.0, "solar_radiation": 5.0, "humidity": 60.0},
        {"temperature": 20.0, "wind_speed": 4.0, "precipitation": 0.0, "solar_radiation": 6.0, "humidity": 45.0},
    ]
    stats = compute_dataset_statistics(sample_records)
    assert stats["temperature"]["average"] == 15.0
    assert stats["temperature"]["min"] == 10.0
    assert stats["temperature"]["max"] == 20.0
    assert stats["temperature"]["trend"]["direction"] == "Rising"

def test_fallback_demo_dataset():
    fallback = generate_fallback_demo_dataset(41.2995, 69.2401, "20240101", "20240110")
    assert fallback["is_demo_data"] is True
    assert "DEMO DATA" in fallback["source"]
    assert len(fallback["data"]) == 10
    record = fallback["data"][0]
    assert "normalized" in record
    assert 0.0 <= record["normalized"]["temperature"] <= 1.0
    assert 0.0 <= record["normalized"]["wind"] <= 1.0

def test_earth_data_endpoint_validation():
    # Missing coordinates -> 422 Unprocessable Entity
    resp = client.get("/api/earth-data")
    assert resp.status_code == 422

    # Invalid latitude -> 400
    resp = client.get("/api/earth-data?latitude=150&longitude=50")
    assert resp.status_code == 400
    assert "out of bounds" in resp.json()["message"]
