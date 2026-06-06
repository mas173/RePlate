import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map, Users, RefreshCw } from 'lucide-react';

function AutoFitHeatmapBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      map.fitBounds(points, { padding: [50, 50], maxZoom: 12 });
    }
  }, [map, points]);
  return null;
}

export default function AdminHeatmap({ donations = [], users = [] }) {
  const [viewType, setViewType] = useState('donations'); // 'donations' or 'ngos'

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
  const tileUrl = MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  // Group coordinates to compute density clusters (approx 100m grid resolution)
  const densityClusters = useMemo(() => {
    const grid = {};
    const sourceData = viewType === 'donations' 
      ? donations.filter(d => d.latitude && d.longitude)
      : users.filter(u => u.role === 'ngo' && u.latitude && u.longitude);

    sourceData.forEach((item) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      // Group by rounding to 3 decimal places (approx 110m precision)
      const latBin = lat.toFixed(3);
      const lngBin = lng.toFixed(3);
      const key = `${latBin},${lngBin}`;

      if (!grid[key]) {
        grid[key] = {
          lat: parseFloat(latBin),
          lng: parseFloat(lngBin),
          count: 0,
          weight: 0,
          items: [],
        };
      }

      grid[key].count += 1;
      grid[key].weight += item.weight_kg ? parseFloat(item.weight_kg) : 1;
      grid[key].items.push(item);
    });

    return Object.values(grid);
  }, [donations, users, viewType]);

  // Extract all cluster centers for viewport autofit bounds
  const mapPoints = useMemo(() => {
    return densityClusters.map(c => [c.lat, c.lng]);
  }, [densityClusters]);

  const defaultCenter = [19.0760, 72.8777]; // Mumbai default

  // Helper to determine circle properties based on cluster density
  const getClusterStyle = (count) => {
    if (viewType === 'donations') {
      if (count >= 5) {
        return { radius: 24, color: '#ef4444', fillColor: '#f43f5e', fillOpacity: 0.65 }; // High density: Red
      }
      if (count >= 2) {
        return { radius: 16, color: '#f97316', fillColor: '#fb923c', fillOpacity: 0.55 }; // Medium density: Orange
      }
      return { radius: 10, color: '#eab308', fillColor: '#fef08a', fillOpacity: 0.45 }; // Low density: Yellow
    } else {
      // NGO Demand density (indigo/blue theme)
      if (count >= 3) {
        return { radius: 22, color: '#4f46e5', fillColor: '#6366f1', fillOpacity: 0.65 };
      }
      return { radius: 12, color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.5 };
    }
  };

  return (
    <div className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col h-[480px] space-y-4">
      {/* Heatmap header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-1.5">
            <Map className="w-5 h-5 text-primary-500" />
            Geographic Insights Heatmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize redistribution supply patterns versus NGO community demand hotspots.
          </p>
        </div>

        {/* View toggles */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 self-start sm:self-auto">
          <button
            onClick={() => setViewType('donations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewType === 'donations'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-555 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Donation Supply ({donations.length})
          </button>
          <button
            onClick={() => setViewType('ngos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewType === 'ngos'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-555 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-350'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            NGO Demand ({users.filter(u => u.role === 'ngo').length})
          </button>
        </div>
      </div>

      {/* Heatmap Map Container */}
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/60 shadow-sm relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer url={tileUrl} attribution={attribution} />

          {/* Center viewport onto clusters */}
          <AutoFitHeatmapBounds points={mapPoints} />

          {/* Render density CircleMarkers */}
          {densityClusters.map((cluster, index) => {
            const style = getClusterStyle(cluster.count);

            return (
              <CircleMarker
                key={index}
                center={[cluster.lat, cluster.lng]}
                radius={style.radius}
                color={style.color}
                weight={2}
                fillColor={style.fillColor}
                fillOpacity={style.fillOpacity}
              >
                <Popup>
                  <div className="p-1.5 text-slate-800">
                    <h4 className="font-extrabold text-xs">
                      {viewType === 'donations' ? 'Donation Hotspot' : 'NGO Demand Hotspot'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      Density: {cluster.count} {viewType === 'donations' ? 'donations' : 'organizations'} nearby
                    </p>
                    {viewType === 'donations' && (
                      <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">
                        Est. Weight: {cluster.weight.toFixed(1)} kg saved
                      </p>
                    )}
                    
                    {/* List items in cluster popup */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 max-h-[100px] overflow-y-auto space-y-1">
                      {cluster.items.slice(0, 3).map((item, itemIdx) => (
                        <div key={itemIdx} className="text-[9px] text-slate-600 truncate font-medium">
                          • {viewType === 'donations' 
                            ? item.food_name 
                            : (item.organization_name || `${item.first_name || ''} ${item.last_name || ''}`.trim())
                          }
                        </div>
                      ))}
                      {cluster.items.length > 3 && (
                        <div className="text-[8px] text-slate-400 italic">
                          and {cluster.items.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
