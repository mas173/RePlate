import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Navigation2, ExternalLink, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const createDonationPinIcon = () => {
  return L.divIcon({
    className: 'donation-track-pin-icon',
    html: `
      <div style="position:relative;width:34px;height:44px;">
        <div style="
          position:absolute;bottom:0;left:50%;
          width:34px;height:34px;
          background:linear-gradient(135deg,#10b981 0%,#047857 100%);
          border-radius:50% 50% 50% 0;
          transform:translateX(-50%) rotate(-45deg);
          box-shadow:0 3px 8px rgba(16,185,129,0.4),0 0 0 2px white;
        "></div>
        <div style="
          position:absolute;bottom:8px;left:50%;transform:translateX(-50%);
          width:12px;height:12px;
          background:white;
          border-radius:50%;
        "></div>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44]
  });
};

const createTruckMarkerIcon = () => {
  return L.divIcon({
    className: 'truck-marker-icon',
    html: `
      <div style="position:relative;width:38px;height:38px;
        background:linear-gradient(135deg,#4f46e5 0%,#3730a3 100%);
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 10px rgba(79,70,229,0.55),0 0 0 3px white;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // km
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

function AutoFitMap({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, bounds]);
  return null;
}

export default function ClaimTrackingMap({
  donationLat,
  donationLng,
  foodName = 'Food Pickup',
  pickupAddress = '',
}) {
  const [gpsLocation, setGpsLocation] = useState(null);
  const [loadingGps, setLoadingGps] = useState(true);
  const [gpsError, setGpsError] = useState(false);
  const watchIdRef = useRef(null);

  const donationCoords = useMemo(() => {
    if (donationLat && donationLng && !isNaN(donationLat) && !isNaN(donationLng)) {
      return [parseFloat(donationLat), parseFloat(donationLng)];
    }
    return null;
  }, [donationLat, donationLng]);

  const donationCoordsTuple = useMemo(() => {
    return donationCoords ? [parseFloat(donationLat), parseFloat(donationLng)] : null;
  }, [donationCoords, donationLat, donationLng]);

  // Track current location live
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError(true);
      setLoadingGps(false);
      return;
    }

    setLoadingGps(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoadingGps(false);
        setGpsError(false);
      },
      (err) => {
        console.warn('Geolocation tracking failed:', err);
        setGpsError(true);
        setLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const truckIcon = useMemo(() => createTruckMarkerIcon(), []);
  const donationIcon = useMemo(() => createDonationPinIcon(), []);

  // Distance calculation
  const distance = useMemo(() => {
    if (gpsLocation && donationCoordsTuple) {
      return haversineDistance(
        gpsLocation.latitude,
        gpsLocation.longitude,
        donationCoordsTuple[0],
        donationCoordsTuple[1]
      );
    }
    return null;
  }, [gpsLocation, donationCoordsTuple]);

  const routePositions = useMemo(() => {
    if (gpsLocation && donationCoordsTuple) {
      return [
        [gpsLocation.latitude, gpsLocation.longitude],
        donationCoordsTuple,
      ];
    }
    return null;
  }, [gpsLocation, donationCoordsTuple]);

  const mapBounds = useMemo(() => {
    if (routePositions) return routePositions;
    if (donationCoordsTuple) return [donationCoordsTuple];
    return null;
  }, [routePositions, donationCoordsTuple]);

  const googleMapsUrl = donationCoordsTuple
    ? `https://www.google.com/maps/dir/?api=1&destination=${donationCoordsTuple[0]},${donationCoordsTuple[1]}`
    : null;

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const isArrived = distance !== null && distance <= 0.05; // 50 meters

  if (!donationCoordsTuple) {
    return (
      <div className="p-5 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
        Coordinates are not configured for this donation location.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Visual Header / Distance Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/80 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-extrabold text-slate-450 uppercase block">Transit Status</span>
          {loadingGps ? (
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              Obtaining GPS signal…
            </span>
          ) : gpsError ? (
            <span className="text-xs text-amber-500 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              GPS not enabled. Showing destination location.
            </span>
          ) : isArrived ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 mt-1 animate-pulse">
              <CheckCircle className="w-4 h-4 shrink-0" />
              You have arrived! Ready for pickup.
            </span>
          ) : (
            <span className="text-xs text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 mt-1">
              <Navigation2 className="w-3.5 h-3.5 text-indigo-500 rotate-45" />
              In Transit to Donor
            </span>
          )}
        </div>

        {/* Live Distance badge */}
        {distance !== null && (
          <div className="px-3.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-center shrink-0">
            <span className="text-[10px] font-bold block uppercase tracking-wider">Distance</span>
            <span className="text-sm font-black">
              {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(2)} km`}
            </span>
          </div>
        )}
      </div>

      {/* Map view */}
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0 h-[220px]">
        <MapContainer
          center={donationCoordsTuple}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer url={tileUrl} attribution={attribution} />

          {mapBounds && <AutoFitMap bounds={mapBounds} />}

          {/* Donation Pickup Point Pin */}
          <Marker position={donationCoordsTuple} icon={donationIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-extrabold text-xs text-slate-800">{foodName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{pickupAddress}</p>
              </div>
            </Popup>
          </Marker>

          {/* User live location Truck Marker */}
          {gpsLocation && (
            <Marker position={[gpsLocation.latitude, gpsLocation.longitude]} icon={truckIcon}>
              <Popup>
                <p className="font-bold text-xs text-indigo-600 text-center">Your Current GPS Spot</p>
              </Popup>
            </Marker>
          )}

          {/* Dotted Route line linking markers */}
          {routePositions && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#6366f1',
                weight: 3,
                opacity: 0.75,
                dashArray: '8, 8',
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* External navigation button */}
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary py-2 px-4 text-xs font-bold w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-primary-500" />
          Navigate in Google Maps
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      )}
    </div>
  );
}
