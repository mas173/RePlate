import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';

// ── Custom premium marker icon ──────────────────────────────────
const createDonationMarkerIcon = () => {
  return L.divIcon({
    className: 'donation-marker-icon',
    html: `
      <div style="position:relative;width:44px;height:54px;">
        <div style="
          position:absolute;bottom:0;left:50%;transform:translateX(-50%);
          width:44px;height:44px;
          background:linear-gradient(135deg,#10b981 0%,#059669 50%,#047857 100%);
          border-radius:50% 50% 50% 0;
          transform:translateX(-50%) rotate(-45deg);
          box-shadow:0 4px 14px rgba(16,185,129,0.45),0 0 0 3px rgba(255,255,255,0.9);
        "></div>
        <div style="
          position:absolute;bottom:8px;left:50%;transform:translateX(-50%);
          width:22px;height:22px;
          background:white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:inset 0 1px 3px rgba(0,0,0,0.1);
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div style="
          position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
          width:12px;height:12px;
          background:rgba(16,185,129,0.25);
          border-radius:50%;
          animation:markerPulse 2s ease-in-out infinite;
        "></div>
      </div>
    `,
    iconSize: [44, 54],
    iconAnchor: [22, 54],
    popupAnchor: [0, -54],
  });
};

// Marker icon for NGO location
const createNgoMarkerIcon = () => {
  return L.divIcon({
    className: 'ngo-marker-icon',
    html: `
      <div style="position:relative;width:36px;height:44px;">
        <div style="
          position:absolute;bottom:0;left:50%;
          width:36px;height:36px;
          background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
          border-radius:50% 50% 50% 0;
          transform:translateX(-50%) rotate(-45deg);
          box-shadow:0 3px 10px rgba(99,102,241,0.4),0 0 0 2px rgba(255,255,255,0.85);
        "></div>
        <div style="
          position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
          width:18px;height:18px;
          background:white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
        ">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

// ── Map auto-fit bounds ──────────────────────────────────────────
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, bounds]);
  return null;
}

// ── Calculate distance between two coordinates (Haversine) ──────
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * DonationLocationMap — Premium reusable map component
 * 
 * @param {Object} props
 * @param {number} props.latitude - Donation latitude
 * @param {number} props.longitude - Donation longitude
 * @param {string} props.address - Pickup address text
 * @param {string} props.foodName - Donation food name for popup
 * @param {boolean} props.showRoute - Whether to show route preview (NGO view)
 * @param {Object} props.ngoLocation - {latitude, longitude} of the NGO (optional)
 */
export default function DonationLocationMap({
  latitude,
  longitude,
  address,
  foodName = 'Pickup Location',
  showRoute = false,
  ngoLocation = null,
}) {
  const [mapError, setMapError] = useState(false);
  const [userLocation, setUserLocation] = useState(ngoLocation);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const hasValidCoords =
    latitude != null &&
    longitude != null &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  // Try to get user's current location for route preview
  useEffect(() => {
    if (showRoute && !userLocation && navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLoadingLocation(false);
        },
        () => {
          setLoadingLocation(false);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, [showRoute, userLocation]);

  const donationMarkerIcon = useMemo(() => createDonationMarkerIcon(), []);
  const ngoMarkerIcon = useMemo(() => createNgoMarkerIcon(), []);

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const distance =
    hasValidCoords && userLocation
      ? haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          latitude,
          longitude
        )
      : null;

  const routePositions =
    hasValidCoords && userLocation
      ? [
          [userLocation.latitude, userLocation.longitude],
          [latitude, longitude],
        ]
      : null;

  const bounds = routePositions || (hasValidCoords ? [[latitude, longitude]] : null);

  // Google Maps navigation URL
  const googleMapsUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : null;

  // ── Error / No-coordinates fallback ───────────────────────────
  if (!hasValidCoords || mapError) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Location not available
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {!hasValidCoords
                ? 'Coordinates could not be determined for this address.'
                : 'The map failed to load. Please try again later.'}
            </p>
          </div>
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Search on Google Maps
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map container */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm relative">
        {/* Pulse animation styles */}
        <style>{`
          @keyframes markerPulse {
            0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
            50% { transform: translateX(-50%) scale(2.2); opacity: 0; }
          }
        `}</style>

        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: '260px', width: '100%' }}
          className="z-0"
          whenReady={() => setMapError(false)}
        >
          <TileLayer url={tileUrl} attribution={attribution} />

          {/* Fit bounds when route is shown */}
          {bounds && bounds.length > 1 && <FitBounds bounds={bounds} />}

          {/* Donation marker */}
          <Marker position={[latitude, longitude]} icon={donationMarkerIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm text-slate-800">{foodName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{address}</p>
              </div>
            </Popup>
          </Marker>

          {/* NGO/User marker + Route polyline */}
          {routePositions && (
            <>
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={ngoMarkerIcon}
              >
                <Popup>
                  <p className="font-semibold text-sm text-slate-800">Your Location</p>
                </Popup>
              </Marker>

              <Polyline
                positions={routePositions}
                pathOptions={{
                  color: '#6366f1',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '8, 8',
                }}
              />
            </>
          )}
        </MapContainer>

        {/* Distance badge overlay */}
        {distance != null && (
          <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-indigo-500" />
              {distance < 1
                ? `${Math.round(distance * 1000)} m`
                : `${distance.toFixed(1)} km`}
              <span className="font-normal text-slate-400">away</span>
            </p>
          </div>
        )}

        {/* Loading location indicator */}
        {showRoute && loadingLocation && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Getting your location…
            </p>
          </div>
        )}
      </div>

      {/* Navigate button */}
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Navigation className="w-4 h-4" />
          Open in Google Maps
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      )}
    </div>
  );
}
