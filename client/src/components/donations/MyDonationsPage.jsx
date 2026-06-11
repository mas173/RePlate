import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Calendar, Clock, MapPin, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI } from '@/services/api';
import { getStatusColor, getUrgencyColor, getRelativeTime } from '@/utils/helpers';
import { FOOD_CATEGORIES } from '@/utils/constants';

function getCategoryIcon(value) {
    const cat = FOOD_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.icon : '🍴';
}

function getCategoryLabel(value) {
    const cat = FOOD_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
}

const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

export default function MyDonationsPage() {
    const { getAuthToken } = useAppAuth();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchDonations = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) setRefreshing(true);
        else setLoading(true);
        try {
            const token = await getAuthToken();
            if (token) {
                const res = await donationsAPI.getAll(token);
                setDonations(res.donations || []);
            }
        } catch (err) {
            console.error('Failed to load donations:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // FIXED: Changed dependency array to an empty array [] so it runs once on mount
    useEffect(() => {
        fetchDonations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filtering logic
    const filteredDonations = donations.filter((donation) => {
        const matchesSearch =
            donation.food_name.toLowerCase().includes(search.toLowerCase()) ||
            (donation.description && donation.description.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || donation.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        My Donations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage, track, and edit your active and historical food donations.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => fetchDonations(true)}
                        disabled={loading || refreshing}
                        className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        title="Refresh List"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <Link
                        to="/donate"
                        className="btn-primary flex items-center gap-2 py-2.5 px-4 shadow-glow-green"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Donate Food</span>
                    </Link>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="card p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                    {/* Search */}
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search donations by name or details..."
                            className="input pl-10 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="md:col-span-3">
                        <select
                            className="input w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="claimed">Claimed</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="delivered">Delivered</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    {/* Category Filter */}
                    <div className="md:col-span-4">
                        <select
                            className="input w-full"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {FOOD_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Donations List / Grid */}
            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card h-[220px] animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
                    ))}
                </div>
            ) : filteredDonations.length > 0 ? (
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredDonations.map((donation) => {
                            const categoryDetails = FOOD_CATEGORIES.find((c) => c.value === donation.category);
                            const formattedDate = new Date(donation.expires_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                            });
                            return (
                                <motion.div
                                    key={donation.id}
                                    variants={cardVariants}
                                    layout
                                    onClick={() => navigate(`/donations/${donation.id}`)}
                                    className="card group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer relative bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[220px]"
                                >
                                    <div className="h-28 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                        {donation.images && donation.images.length > 0 ? (
                                            <img
                                                src={donation.images[0]}
                                                alt={donation.food_name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary-500/10 to-teal-500/10 flex items-center justify-center">
                                                <span className="text-4xl filter saturate-75">{categoryDetails?.icon || '🍴'}</span>
                                            </div>
                                        )}
                                        {donation.images && donation.images.length > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md text-xs font-semibold text-white flex items-center gap-1">
                                                <span>{categoryDetails?.icon}</span>
                                                <span>{categoryDetails?.label}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div className="flex gap-14">
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                    {donation.food_name}
                                                </h3>
                                                {donation.description && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                                                        {donation.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div >
                                                <span className={`badge shadow-sm ${getStatusColor(donation.status)}`}>
                                                    {donation.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                <span className="truncate">Expires {formattedDate}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 min-w-0 justify-end">
                                                <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                <span className="truncate">{getRelativeTime(donation.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-5 py-3.5 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getUrgencyColor(donation.urgency)}`}>
                                                {donation.urgency}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                {donation.quantity}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform duration-200" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <div className="card py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-lg mx-auto rounded-3xl">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                        No Donations Found
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {search || statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'We couldn\'t find any match with your current search parameters. Try adjusting your filters.'
                            : 'You haven\'t posted any food donations yet. Share your surplus food today and help save the community!'}
                    </p>
                    {(search || statusFilter !== 'all' || categoryFilter !== 'all') ? (
                        <button
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('all');
                                setCategoryFilter('all');
                            }}
                            className="btn-secondary px-5 py-2 mt-5 text-sm"
                        >
                            Clear Filters
                        </button>
                    ) : (
                        <Link to="/donate" className="btn-primary py-2.5 px-6 mt-6 inline-block shadow-glow-green">
                            Donate Food
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}