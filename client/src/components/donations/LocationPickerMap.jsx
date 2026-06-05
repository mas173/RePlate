import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Search, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

// Custom red pin marker for picking donation spot
const createPickerMarkerIcon = () => {
  return L.divIcon({
    className: 'picker-marker-icon',
    html: `
      <div style="position:relative;width:38px;height:48px;">
        <div style="
          position:absolute;bottom:0;left:50%;transform:translateX(-50%);
          width:38px;height:38px;
          background:linear-gradient(135deg,#f43f5e 0%,#e11d48 100%);
          border-radius:50% 50% 50% 0;
          transform:translateX(-50%) rotate(-45deg);
          box-shadow:0 4px 12px rgba(225,29,72,0.45),0 0 0 3px rgba(255,255,255,0.9);
        "></div>
        <div style="
          position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
          width:18px;height:18px;
          background:white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="width:8px;height:8px;border-radius:50%;background:#e11d48;"></div>
        </div>
        <div style="
          position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);
          width:10px;height:10px;
          background:rgba(225,29,72,0.3);
          border-radius:50%;
        "></div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -48],
  });
};

// Component to handle map centering and flyTo animations
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [map, center]);
  return null;
}

// Handle map click events to place the marker
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
  addressFields = {},
  onAddressAutoFill = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  // Default coordinate (e.g., Mumbai, India if no coordinates)
  const defaultCenter = [19.0760, 72.8777];
  const mapCenter = useMemo(() => {
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      return [parseFloat(latitude), parseFloat(longitude)];
    }
    return null;
  }, [latitude, longitude]);

  const pickerMarkerIcon = useMemo(() => createPickerMarkerIcon(), []);
  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // Handle marker dragging
  const handleDragEnd = (e) => {
    const marker = e.target;
    if (marker != null) {
      const position = marker.getLatLng();
      updateCoordinates(position.lat, position.lng, true); // Reverse geocode on drag end
    }
  };

  // Perform geocoding based on manual search query or full address fields
  const handleSearch = async (queryText = searchQuery) => {
    const query = queryText || searchQuery;
    if (!query.trim()) {
      toast.error('Please enter a location or address to search');
      return;
    }

    if (!MAPTILER_KEY) {
      toast.error('MapTiler key is missing. Geocoding disabled.');
      return;
    }

    setSearching(true);
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&limit=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        updateCoordinates(lat, lng, false); // Don't reverse geocode what we just searched
        toast.success(`Centered map on: ${feature.place_name}`);
      } else {
        toast.error('Could not find that location on the map');
      }
    } catch (err) {
      console.error('Geocoding search failed:', err);
      toast.error('Search request failed');
    } finally {
      setSearching(false);
    }
  };

  // Geocode address when user clicks "Locate Address" button
  const locateAddressFields = () => {
    const { address, city, state, pincode } = addressFields;
    const fullQuery = [address, city, state, pincode].filter(Boolean).join(', ');
    if (!fullQuery.trim()) {
      toast.error('Please fill in some address details first');
      return;
    }
    handleSearch(fullQuery);
  };

  // Get coordinates using browser Geolocation
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: gpsLat, longitude: gpsLng } = pos.coords;
        updateCoordinates(gpsLat, gpsLng, true); // Reverse geocode to fill address fields
        toast.success('Successfully detected your current GPS location!');
        setLocating(false);
      },
      (err) => {
        console.warn('GPS location request failed:', err);
        toast.error('Failed to get GPS location. Please select manually on map.');
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Update selected coordinates, optionally trigger reverse geocoding
  const updateCoordinates = async (lat, lng, runReverseGeocode = false) => {
    const parsedLat = parseFloat(lat.toFixed(6));
    const parsedLng = parseFloat(lng.toFixed(6));
    onLocationSelect(parsedLat, parsedLng);

    if (runReverseGeocode && MAPTILER_KEY && onAddressAutoFill) {
      try {
        const url = `https://api.maptiler.com/geocoding/${parsedLng},${parsedLat}.json?key=${MAPTILER_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Reverse geocode failed');
        const data = await res.json();

        if (data && data.features && data.features.length > 0) {
          const autofill = parseGeocodingFeatures(data.features);
          onAddressAutoFill(autofill);
          toast.success('Address fields auto-updated from selected pin!');
        }
      } catch (err) {
        console.warn('Reverse geocoding failed:', err);
      }
    }
  };

  // Parse MapTiler features list to extract address parts
  const parseGeocodingFeatures = (features) => {
    const result = {
      address: '',
      city: '',
      state: '',
      pincode: '',
    };

    // Find direct address or street feature
    const addressFeature = features.find(f => f.place_type.includes('address') || f.place_type.includes('street'));
    if (addressFeature) {
      result.address = addressFeature.place_name.split(',')[0];
    } else if (features[0]) {
      // Fallback: use first feature name
      result.address = features[0].text;
    }

    // Traverse features or their contexts to locate City, State, Pincode
    features.forEach((feature) => {
      if (feature.place_type.includes('municipality') || feature.place_type.includes('place')) {
        if (!result.city) result.city = feature.text;
      }
      if (feature.place_type.includes('region')) {
        if (!result.state) result.state = feature.text;
      }
      if (feature.place_type.includes('postal_code')) {
        if (!result.pincode) result.pincode = feature.text;
      }

      // Check context array in feature
      if (feature.context) {
        feature.context.forEach((ctx) => {
          if (ctx.id.startsWith('municipality') || ctx.id.startsWith('place')) {
            if (!result.city) result.city = ctx.text;
          }
          if (ctx.id.startsWith('region')) {
            if (!result.state) result.state = ctx.text;
          }
          if (ctx.id.startsWith('postal_code')) {
            if (!result.pincode) result.pincode = ctx.text;
          }
        });
      }
    });

    return result;
  };

  return (
    <div className="space-y-4">
      {/* Geocoding Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search address or landmark..."
            className="input pr-10 w-full text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          />
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={searching}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={locateAddressFields}
            disabled={searching}
            className="btn-secondary py-2 px-3 text-xs font-bold shrink-0 flex items-center gap-1.5"
            title="Locate coordinates based on address fields"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            Locate Address
          </button>

          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={locating}
            className="btn-secondary py-2 px-3 text-xs font-bold shrink-0 flex items-center gap-1.5"
            title="Use current device GPS location"
          >
            {locating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-indigo-500" />
            )}
            Use My GPS
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-sm relative z-0 h-[280px]">
        <MapContainer
          center={mapCenter || defaultCenter}
          zoom={mapCenter ? 15 : 12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer url={tileUrl} attribution={attribution} />

          {/* Centering map viewport when coordinates update */}
          {mapCenter && <ChangeMapView center={mapCenter} />}

          {/* Handler to register map clicks */}
          <MapEventsHandler onMapClick={(lat, lng) => updateCoordinates(lat, lng, true)} />

          {/* Dragable Marker representing the pinned location */}
          {mapCenter && (
            <Marker
              position={mapCenter}
              draggable={true}
              eventHandlers={{ dragend: handleDragEnd }}
              icon={pickerMarkerIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Location Details Info */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 flex items-start gap-2.5 text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          {mapCenter ? (
            <p>
              Selected Location: <span className="font-bold text-slate-700 dark:text-slate-200">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>.
              You can drag the red marker or click anywhere on the map to refine the pickup coordinates.
            </p>
          ) : (
            <p>
              No map location pinned yet. Click **"Locate Address"** to center on your entered address,
              or click **"Use My GPS"** to locate using browser GPS. You can also click anywhere on the map to pin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
