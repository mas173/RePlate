import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Clock, MapPin, Package, Heart, ShieldAlert, Navigation, ArrowRight, CheckCircle, Truck, RefreshCw, ChevronRight } from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { claimsAPI, donationsAPI } from '@/services/api';
import { getUrgencyColor } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function NGODashboard() {
  const { fullName, getAuthToken } = useAppAuth();
  const firstName = fullName ? fullName.split(' ')[0] : 'there';
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [availableFood, setAvailableFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Map state
  const [hoveredPin, setHoveredPin] = useState(null);

  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    try {
      const token = await getAuthToken();
      if (token) {
        // Fetch NGO claims
        const claimsRes = await claimsAPI.getAll(token);
        setClaims(claimsRes.claims || []);

        // Fetch available food listings
        const donationsRes = await donationsAPI.getAll(token);
        const availableOnly = (donationsRes.donations || []).filter(d => d.status === 'available');
        setAvailableFood(availableOnly);
      }
    } catch (err) {
      console.error('Failed to load NGO dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (claimId, nextStatus) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const loadingToast = toast.loading('Updating pickup status...');
      await claimsAPI.updateStatus(token, claimId, nextStatus);
      toast.dismiss(loadingToast);
      
      toast.success('Pickup status updated');
      fetchDashboardData(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  // Metrics calculation
  const activeClaims = claims.filter(c => c.status === 'confirmed' || c.status === 'picked_up');
  const deliveredClaims = claims.filter(c => c.status === 'delivered');
  
  let totalWeightKg = 0;
  let totalMeals = 0;
  deliveredClaims.forEach(c => {
    const wt = parseFloat(c.donation?.weight_kg) || 0;
    totalWeightKg += wt;
    totalMeals += Math.round(wt / 0.5) || parseInt(c.donation?.servings) || 0;
  });
  
  const co2ReducedKg = totalWeightKg * 2.5;
  const waterSavedLiters = totalWeightKg * 1000;

  // Active scheduled pickups
  const upcomingPickups = activeClaims.slice(0, 3);

  // Generate simulated pins on map for available food
  const mapPins = availableFood.map((donation, idx) => {
    // Generate pseudo-random coordinates within our container bounds
    const hash = donation.food_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const x = 15 + ((hash * (idx + 1)) % 70); // 15% to 85% width
    const y = 20 + ((hash * (idx + 2)) % 60); // 20% to 80% height
    return {
      id: donation.id,
      name: donation.food_name,
      urgency: donation.urgency,
      quantity: donation.quantity,
      address: donation.pickup_address,
      x: `${x}%`,
      y: `${y}%`
    };
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Let's rescue surplus food and feed the community today.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card p-4.5 bg-gradient-to-br from-primary-500/10 to-emerald-500/5 border-primary-500/20 dark:border-primary-500/15 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-primary-500/25 shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Meals Delivered</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{totalMeals}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card p-4.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20 dark:border-indigo-500/15 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weight Rescued</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{totalWeightKg.toFixed(1)} kg</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card p-4.5 bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border-teal-500/20 dark:border-teal-500/15 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">CO2 Reduced</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{co2ReducedKg.toFixed(1)} kg</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="card p-4.5 bg-gradient-to-br from-rose-500/10 to-amber-500/5 border-rose-500/20 dark:border-rose-500/15 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Claims</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-0.5">{activeClaims.length}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (Radar Map + Active Pickups list) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Geolocation Radar Map */}
          <div className="card overflow-hidden bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-[360px] relative">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 bg-white/80 dark:bg-slate-850/80 backdrop-blur-md">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5 text-sm">
                  <Navigation className="w-4 h-4 text-primary-500 animate-pulse" />
                  Nearby Available Food Radar
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Visual mapping of nearby active surplus food listings.
                </p>
              </div>
              <span className="badge bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold border-0">
                {availableFood.length} Active Pins
              </span>
            </div>

            {/* Simulated Geographic Grid Area */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
              {/* Radar circular lines */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center">
                <div className="w-[180px] h-[180px] rounded-full border border-dashed border-emerald-500/25 flex items-center justify-center">
                  <div className="w-[80px] h-[80px] rounded-full border border-emerald-500/30" />
                </div>
              </div>

              {/* Grid backdrop lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.07] pointer-events-none">
                {[...Array(36)].map((_, i) => (
                  <div key={i} className="border border-emerald-500" />
                ))}
              </div>

              {/* Center point indicator */}
              <div className="absolute w-5 h-5 rounded-full bg-primary-500/20 border border-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/50 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              </div>

              {/* Glowing radar line animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 rotate-radar origin-center pointer-events-none" />

              {/* Map Pins */}
              {mapPins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => navigate(`/donations/${pin.id}`)}
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  style={{ left: pin.x, top: pin.y }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                >
                  <span className="relative flex h-4 w-4">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      pin.urgency === 'critical' ? 'bg-red-400' :
                      pin.urgency === 'high' ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-slate-950 shadow-md ${
                      pin.urgency === 'critical' ? 'bg-red-500' :
                      pin.urgency === 'high' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}></span>
                  </span>
                </button>
              ))}

              {/* Map pin info hover card */}
              <AnimatePresence>
                {hoveredPin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-white z-20 flex justify-between items-center max-w-sm"
                  >
                    <div>
                      <h4 className="font-bold text-xs leading-snug">{hoveredPin.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{hoveredPin.address}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          hoveredPin.urgency === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          hoveredPin.urgency === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {hoveredPin.urgency}
                        </span>
                        <span className="text-[10px] text-slate-300 font-semibold">{hoveredPin.quantity}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-primary-400 flex items-center shrink-0 ml-4">
                      Claim Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Map instructions overlay if empty */}
              {availableFood.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/80 text-center">
                  <ShieldAlert className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400 max-w-xs">
                    No listings available nearby right now. Listings will appear here as donors upload food.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Active Pickups Panel */}
          <div className="card bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  Active Pickup Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage your claimed donations currently in transit.
                </p>
              </div>
              <Link to="/claims" className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center">
                All claims <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {upcomingPickups.length > 0 ? (
              <div className="space-y-3.5">
                {upcomingPickups.map((claim) => {
                  const donation = claim.donation || {};
                  const scheduledDate = claim.pickup_scheduled_at 
                    ? new Date(claim.pickup_scheduled_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Not scheduled';

                  return (
                    <div 
                      key={claim.id}
                      className="p-3.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight truncate">
                          {donation.food_name || 'Food Donation'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{donation.pickup_address || 'No address'}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{scheduledDate}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Speed status transition trigger */}
                      <div className="shrink-0 w-full sm:w-auto flex justify-end">
                        {claim.status === 'confirmed' ? (
                          <button
                            onClick={() => handleUpdateStatus(claim.id, 'picked_up')}
                            className="btn-primary py-1.5 px-3 shadow-sm text-[10px] bg-emerald-600 hover:bg-emerald-700 border-none flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Mark Picked Up</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/claims')}
                            className="btn-primary py-1.5 px-3 shadow-sm text-[10px] bg-indigo-600 hover:bg-indigo-700 border-none flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Confirm Delivery</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-550 dark:text-slate-450">
                No active pickups scheduled. Explore available food listings below to make a claim!
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Quick Actions + Recent Listings) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card p-5 border border-slate-200 dark:border-slate-700/50 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              Quick Tasks
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link 
                to="/available" 
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-850 transition-colors group"
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-800 dark:text-white block">Browse Available Food</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Find active listings nearby</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/claims" 
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-850 transition-colors group"
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-800 dark:text-white block">My Claims & History</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Track and complete pickup logs</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="card p-5 border border-slate-200 dark:border-slate-700/50 space-y-4 flex flex-col justify-between min-h-[300px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  Latest Donations
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Fresh listings uploaded by local donors.
                </p>
              </div>
            </div>

            {availableFood.length > 0 ? (
              <div className="space-y-4 pt-1 flex-1">
                {availableFood.slice(0, 3).map((donation) => {
                  return (
                    <div 
                      key={donation.id} 
                      onClick={() => navigate(`/donations/${donation.id}`)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                        {donation.images && donation.images.length > 0 ? (
                          <img 
                            src={donation.images[0]} 
                            alt={donation.food_name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-xl">🍴</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <span className="font-bold text-xs text-slate-800 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                          {donation.food_name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-extrabold uppercase ${getUrgencyColor(donation.urgency)}`}>
                            {donation.urgency}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {donation.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-550 dark:text-slate-450 flex-1 flex items-center justify-center">
                No recent listings. Uploads will appear here immediately.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
