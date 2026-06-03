/**
 * Geocoding Service
 * Converts addresses to latitude and longitude coordinates using MapTiler Geocoding API.
 * Features in-memory caching and throttling.
 */

// In-memory cache for geocoded coordinates: address -> { latitude, longitude }
const geocodeCache = new Map();

// Throttling helper to ensure we respect MapTiler rate limits
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 250; // Max 4 requests per second

/**
 * Normalizes address strings for consistent caching
 */
function normalizeAddress(addressStr) {
  if (!addressStr) return '';
  return addressStr.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Geocodes an address string to coordinates
 * @param {string} address - Full address to geocode
 * @returns {Promise<{latitude: number, longitude: number}|null>} Resolved coordinates or null
 */
export async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || !address.trim()) {
    console.warn('[Geocoding] Empty or invalid address provided');
    return null;
  }

  const normalized = normalizeAddress(address);

  // Check cache first
  if (geocodeCache.has(normalized)) {
    console.log(`[Geocoding] Cache hit for address: "${address}"`);
    return geocodeCache.get(normalized);
  }

  const apiKey = process.env.MAPTILER_API_KEY;
  if (!apiKey || apiKey === 'your_maptiler_api_key_here') {
    console.warn('[Geocoding] MapTiler API key not configured on backend');
    return null;
  }

  // Enforce request cooldown/throttling
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    const delay = MIN_REQUEST_INTERVAL_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  try {
    console.log(`[Geocoding] Fetching coordinates for: "${address}"`);
    lastRequestTime = Date.now();

    // MapTiler Geocoding API Endpoint
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${apiKey}&limit=1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MapTiler API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // MapTiler returns a GeoJSON FeatureCollection
    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0];
      // GeoJSON coordinates are [longitude, latitude]
      const [longitude, latitude] = feature.geometry.coordinates;

      const result = {
        latitude: parseFloat(latitude.toFixed(8)),
        longitude: parseFloat(longitude.toFixed(8)),
      };

      // Store in cache
      geocodeCache.set(normalized, result);
      return result;
    }

    console.warn(`[Geocoding] No coordinates found for address: "${address}"`);
    // Cache negative results too (to prevent hitting API repeatedly for bad addresses)
    geocodeCache.set(normalized, null);
    return null;
  } catch (error) {
    console.error(`[Geocoding] Request failed for "${address}":`, error.message);
    return null;
  }
}

export default {
  geocodeAddress,
};
