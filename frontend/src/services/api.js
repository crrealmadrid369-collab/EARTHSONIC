const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Custom API client handling queries and status code errors
 */
async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Fallback to text or status
      }
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    return await response.json();
  } catch (error) {
    if (error.status) throw error;
    // Network or offline error
    const netErr = new Error(
      error.name === 'AbortError' 
        ? 'NASA data request timed out.' 
        : 'Cannot reach EarthSonic backend server. Ensure backend is running at ' + API_BASE_URL
    );
    netErr.status = 503;
    throw netErr;
  }
}

/**
 * Health check
 */
export async function checkHealth() {
  return await fetchJson('/api/health');
}

/**
 * Curated benchmark locations
 */
export async function getLocations() {
  return await fetchJson('/api/locations');
}

/**
 * Fetch and normalize NASA POWER daily dataset
 */
export async function getEarthData(latitude, longitude, start, end) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  return await fetchJson(`/api/earth-data?${params.toString()}`);
}

/**
 * Fetch dataset statistics
 */
export async function getStatistics(latitude, longitude, start, end) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  if (start) params.append('start', start);
  if (end) params.append('end', end);

  return await fetchJson(`/api/statistics?${params.toString()}`);
}

/**
 * Fetch sonification acoustic mappings
 */
export async function getSonificationConfig() {
  return await fetchJson('/api/sonification-config');
}
