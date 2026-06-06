import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Navigation, ArrowRight, Loader2 } from 'lucide-react';

const createNgoHomeIcon = () => {
  return L.divIcon({
    className: 'ngo-home-marker-icon',
    html: `
      <div style="position:relative;width:40px;height:40px;
        background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
        border-radius:50%;display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px rgba(99,102,241,0.5),0 0 0 3px rgba(255,255,255,0.9);
        animation: pulseNGO 2.5s infinite;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
      <style>
        @keyframes pulseNGO {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.6), 0 0 0 3px white; }
          70% { box-shadow: 0 0 0 10px rgba(99,102,241,0), 0 0 0 3px white; }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0), 0 0 0 3px white; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const createDonationUrgencyIcon = (urgency) => {
  let mainColor = '#10b981'; // low/medium (green)
  let gradColor = '#059669';
  let pulseColor = 'rgba(16,185,129,0.3)';

  if (urgency === 'critical') {
    mainColor = '#ef4444'; // critical (red)
    gradColor = '#dc2626';
    pulseColor = 'rgba(239,68,68,0.4)';
  } else if (urgency === 'high') {
    mainColor = '#f97316'; // high (orange)
    gradColor = '#ea580c';
    pulseColor = 'rgba(249,115,22,0.35)';
  }

  return L.divIcon({
    className: `donation-urgency-${urgency}`,
    html: `
      <div style="position:relative;width:34px;height:44px;">
        <div style="
          position:absolute;bottom:0;left:50%;
          width:34px;height:34px;
          background:linear-gradient(135deg, ${mainColor} 0%, ${gradColor} 100%);
          border-radius:50% 50% 50% 0;
          transform:translateX(-50%) rotate(-45deg);
          box-shadow:0 3px 8px rgba(0,0,0,0.25), 0 0 0 2px white;
        "></div>
        <div style="
          position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
          width:10px;height:10px;
          background:white;
          border-radius:50%;
        "></div>
        <div style="
          position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);
          width:12px;height:12px;
          background: ${pulseColor};
          border-radius:50%;
          animation: markerPulse 2s ease-in-out infinite;
        "></div>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44]
  });
};

function ChangeMapBounds({ donations, userLocation }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (userLocation?.latitude && userLocation?.longitude) {
      points.push([userLocation.latitude, userLocation.longitude]);
    }
    donations.forEach((d) => {
      if (d.latitude && d.longitude && !isNaN(d.latitude) && !isNaN(d.longitude)) {
        points.push([parseFloat(d.latitude), parseFloat(d.longitude)]);
      }
    });

    if (points.length > 0) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, donations, userLocation]);
  return null;
}

export default function NGODashboardMap({ donations, userLocation, loadingLocation }) {
  const navigate = useNavigate();
  const [mapError, setMapError] = useState(false);

  const defaultCenter = [19.0760, 72.8777]; // Mumbai
  const centerPoint = useMemo(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return [userLocation.latitude, userLocation.longitude];
    }
    return defaultCenter;
  }, [userLocation]);

  const ngoIcon = useMemo(() => createNgoHomeIcon(), []);
  const criticalIcon = useMemo(() => createDonationUrgencyIcon('critical'), []);
  const highIcon = useMemo(() => createDonationUrgencyIcon('high'), []);
  const mediumIcon = useMemo(() => createDonationUrgencyIcon('medium'), []);

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'critical') return criticalIcon;
    if (urgency === 'high') return highIcon;
    return mediumIcon;
  };

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const validDonations = donations.filter(
    (d) => d.latitude != null && d.longitude != null && !isNaN(d.latitude) && !isNaN(d.longitude)
  );

  if (mapError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-center min-h-[300px]">
        <ShieldAlert className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-xs text-slate-400 max-w-xs">
          The interactive map failed to load. Please verify your connection or try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Pulse animation keyframes style */}
      <style>{`
        @keyframes markerPulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
          50% { transform: translateX(-50%) scale(2.2); opacity: 0; }
        }
      `}</style>

      <MapContainer
        center={centerPoint}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenReady={() => setMapError(false)}
      >
        <TileLayer url={tileUrl} attribution={attribution} />

        {/* Fit bounds dynamically */}
        <ChangeMapBounds donations={validDonations} userLocation={userLocation} />

        {/* NGO Home location marker */}
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]} icon={ngoIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-bold text-xs text-indigo-600">Your Base Location</p>
                <p className="text-[10px] text-slate-500 mt-0.5">NGO Headquarters</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Donation markers */}
        {validDonations.map((donation) => {
          const lat = parseFloat(donation.latitude);
          const lng = parseFloat(donation.longitude);

          return (
            <Marker key={donation.id} position={[lat, lng]} icon={getUrgencyIcon(donation.urgency)}>
              <Popup>
                <div className="p-1 max-w-[200px] text-slate-800">
                  <h4 className="font-extrabold text-xs leading-snug">{donation.food_name}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 truncate">{donation.pickup_address}</p>
                  
                  <div className="flex items-center justify-between gap-3 mt-2.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-700">{donation.quantity}</span>
                    <button
                      onClick={() => navigate(`/donations/${donation.id}`)}
                      className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 hover:underline"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Geolocation Loading Indicator */}
      {loadingLocation && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-350">
            Locating device…
          </span>
        </div>
      )}
    </div>
  );
}
