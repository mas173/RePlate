import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, Truck, Package, MessageSquare, Star, X, RefreshCw, ChevronRight } from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { claimsAPI } from '@/services/api';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
};

export default function MyClaimsPage() {
  const { getAuthToken } = useAppAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchClaims = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    try {
      const token = await getAuthToken();
      if (token) {
        const res = await claimsAPI.getAll(token);
        setClaims(res.claims || []);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
      toast.error('Could not load claims');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (claimId, nextStatus) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const loadingToast = toast.loading('Updating status...');
      const res = await claimsAPI.updateStatus(token, claimId, nextStatus);
      toast.dismiss(loadingToast);
      
      toast.success(res.message || 'Status updated successfully');
      fetchClaims(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleCancelClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to cancel this claim? The donation will be made available for other NGOs.')) return;
    try {
      const token = await getAuthToken();
      if (!token) return;

      const loadingToast = toast.loading('Cancelling claim...');
      await claimsAPI.cancel(token, claimId);
      toast.dismiss(loadingToast);
      
      toast.success('Claim cancelled successfully');
      fetchClaims(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel claim');
    }
  };

  const openRatingModal = (claim) => {
    setSelectedClaim(claim);
    setRating(5);
    setFeedback('');
    setShowRatingModal(true);
  };

  const handleCompleteDelivery = async () => {
    if (!selectedClaim) return;
    setSubmittingRating(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const payload = {
        status: 'delivered',
        rating,
        feedback: feedback.trim() || undefined
      };

      await claimsAPI.updateStatus(token, selectedClaim.id, payload);
      toast.success('Donation delivery confirmed! Thank you.');
      setShowRatingModal(false);
      fetchClaims(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to confirm delivery');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Split claims
  const activeClaims = claims.filter(c => c.status === 'confirmed' || c.status === 'picked_up');
  const historyClaims = claims.filter(c => c.status === 'delivered' || c.status === 'cancelled');
  const displayedClaims = activeTab === 'active' ? activeClaims : historyClaims;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Claims
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track, coordinate, and complete your food pickup claims.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchClaims(true)}
            disabled={loading || refreshing}
            className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700/60">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-5 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'active'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Active Claims ({activeClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-5 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Claim History ({historyClaims.length})
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-[160px] animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      ) : displayedClaims.length > 0 ? (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {displayedClaims.map((claim) => {
              const donation = claim.donation || {};
              const donor = donation.donor || {};
              const scheduledDate = claim.pickup_scheduled_at 
                ? new Date(claim.pickup_scheduled_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Not scheduled';

              return (
                <motion.div
                  key={claim.id}
                  variants={cardVariants}
                  layout
                  className="card p-5 bg-white dark:bg-slate-850/80 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden"
                >
                  {/* Left Side: Info */}
                  <div className="flex-1 space-y-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                        {donation.food_name || 'Food Donation'}
                      </h3>
                      <span className={`badge ${
                        claim.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        claim.status === 'picked_up' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                        claim.status === 'delivered' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      } text-xs font-semibold capitalize px-2 py-0.5`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      Donor: <span className="font-semibold text-slate-700 dark:text-slate-300">{donor.organization_name || `${donor.first_name || ''} ${donor.last_name || ''}`}</span>
                      {donor.email && ` · ${donor.email}`} {donor.phone && ` · ${donor.phone}`}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{donation.pickup_address || 'No Address'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Pickup: {scheduledDate}</span>
                      </div>
                      {donation.quantity && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>Quantity: <span className="font-semibold">{donation.quantity}</span></span>
                        </div>
                      )}
                    </div>

                    {claim.notes && (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold block mb-0.5">My Claim Notes:</span>
                        {claim.notes}
                      </div>
                    )}

                    {/* Timeline for active claims */}
                    {(claim.status === 'confirmed' || claim.status === 'picked_up') && (
                      <div className="pt-4 flex items-center gap-2 max-w-md">
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Claim Booked</span>
                        </div>
                        <div className={`h-0.5 flex-1 ${claim.status === 'picked_up' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            claim.status === 'picked_up' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                          }`}>{claim.status === 'picked_up' ? '✓' : '2'}</div>
                          <span className={`text-[10px] font-bold ${claim.status === 'picked_up' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>Picked Up</span>
                        </div>
                        <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">3</div>
                          <span className="text-[10px] font-bold text-slate-400">Delivered</span>
                        </div>
                      </div>
                    )}

                    {/* Show rating/feedback in history */}
                    {claim.status === 'delivered' && (
                      <div className="pt-2 flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 mr-1">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${star <= (claim.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                            />
                          ))}
                        </div>
                        {claim.feedback && (
                          <div className="text-slate-500 dark:text-slate-400 flex items-start gap-1">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                            <span>"{claim.feedback}"</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex flex-row md:flex-col justify-end gap-2.5 self-end md:self-center shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/40">
                    {claim.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(claim.id, 'picked_up')}
                          className="btn-primary flex items-center justify-center gap-1.5 py-2 px-4 shadow-sm text-xs bg-emerald-600 hover:bg-emerald-700 border-none w-full md:w-auto"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Mark Picked Up</span>
                        </button>
                        <button
                          onClick={() => handleCancelClaim(claim.id)}
                          className="btn-secondary py-2 px-4 text-xs text-red-500 hover:text-red-600 border border-slate-200 dark:border-slate-700/60 hover:bg-red-50 dark:hover:bg-red-500/10 w-full md:w-auto"
                        >
                          Cancel Claim
                        </button>
                      </>
                    )}

                    {claim.status === 'picked_up' && (
                      <button
                        onClick={() => openRatingModal(claim)}
                        className="btn-primary flex items-center justify-center gap-1.5 py-2 px-4 shadow-sm text-xs bg-indigo-600 hover:bg-indigo-700 border-none w-full md:w-auto"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-lg mx-auto rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Claims Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'You don\'t have any active food claims or pick ups scheduled. Browse available food items and make a claim!'
              : 'You haven\'t completed or cancelled any claims in your history yet.'}
          </p>
        </div>
      )}

      {/* Rating & Feedback Modal */}
      {showRatingModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-850 p-6 rounded-2xl max-w-md w-full border border-slate-100 dark:border-slate-700 shadow-2xl relative"
          >
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 pr-8">
              Confirm Food Delivery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Confirm receipt of "{selectedClaim.donation?.food_name}". Share a quick rating and feedback for the donor.
            </p>

            <div className="space-y-4">
              {/* Stars */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Rate the donor experience
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-350 dark:text-slate-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Feedback Notes
                </label>
                <textarea
                  placeholder="E.g., Food packaging was perfect. Quality matches the description. Pick up was smooth and quick!"
                  className="input w-full h-24 text-xs py-2 resize-none"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="btn-secondary w-full py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteDelivery}
                  disabled={submittingRating}
                  className="btn-primary w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 border-none flex items-center justify-center gap-1.5"
                >
                  {submittingRating ? 'Confirming...' : 'Confirm Delivery'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
