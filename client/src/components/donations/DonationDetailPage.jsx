import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    MapPin,
    Trash2,
    Edit3,
    X,
    Save,
    AlertTriangle,
    Building2,
    Phone,
    Mail,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI } from '@/services/api';
import {
    getUrgencyColor,
    getRelativeTime,
} from '@/utils/helpers';

import {
    FOOD_CATEGORIES,
    STORAGE_CONDITIONS,
} from '@/utils/constants';

function getCategoryIcon(value) {
    const cat = FOOD_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.icon : '🍴';
}

function getCategoryLabel(value) {
    const cat = FOOD_CATEGORIES.find((c) => c.value === value);
    return cat ? cat.label : value;
}

export default function DonationDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { getAuthToken, role, user } = useAppAuth();

    const [donation, setDonation] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    const [isDeleting, setIsDeleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchDonationDetails = async () => {
        try {
            setLoading(true);

            const token = await getAuthToken();

            if (!token) {
                setLoading(false);
                return;
            }

            const res = await donationsAPI.getById(token, id);

            setDonation(res.donation);
            setClaims(res.claims || []);

            if (res.donation) {
                const expiry = new Date(res.donation.expires_at);

                const expDate = expiry.toISOString().split('T')[0];

                const expTime = expiry
                    .toTimeString()
                    .split(' ')[0]
                    .substring(0, 5);

                const addrParts =
                    res.donation.pickup_address?.split(', ') || [];

                const street = addrParts[0] || '';

                const stateZip = addrParts[1] || '';

                const zipParts = stateZip.split(' - ');

                const state = zipParts[0] || '';

                const pincode = zipParts[1] || '';

                const quantityParts =
                    res.donation.quantity?.split(' ') || [];

                const qtyNum = quantityParts[0] || '';

                const unit = quantityParts[1] || 'meals';

                setEditForm({
                    name: res.donation.food_name || '',
                    category: res.donation.category || '',
                    quantity: qtyNum,
                    unit,
                    expiryDate: expDate,
                    expiryTime: expTime,
                    storageCondition:
                        res.donation.storage_condition || '',
                    address: street,
                    city: res.donation.pickup_city || '',
                    state,
                    pincode,
                    instructions:
                        res.donation.pickup_instructions || '',
                    notes: res.donation.description || '',
                    isVegetarian:
                        res.donation.is_vegetarian || false,
                    isVegan: res.donation.is_vegan || false,
                });
            }
        } catch (err) {
            console.error('Failed to load donation details:', err);

            toast.error('Donation details not found');

            navigate('/donations');
        } finally {
            setLoading(false);
        }
    };

    // FIXED API LOOP ISSUE
    useEffect(() => {
        fetchDonationDetails();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const token = await getAuthToken();

            if (!token) return;

            await donationsAPI.update(token, id, editForm);

            toast.success('Donation updated successfully');

            setIsEditing(false);

            await fetchDonationDetails();
        } catch (err) {
            console.error(err);

            toast.error(
                err?.message || 'Failed to update donation'
            );
        }
    };

    const handleCancelStatus = async () => {
        try {
            const token = await getAuthToken();

            if (!token) return;

            await donationsAPI.updateStatus(
                token,
                id,
                'cancelled'
            );

            toast.success('Donation cancelled successfully');

            setIsCancelling(false);

            await fetchDonationDetails();
        } catch (err) {
            console.error(err);

            toast.error(
                err?.message || 'Failed to cancel donation'
            );
        }
    };

    const handleDelete = async () => {
        try {
            const token = await getAuthToken();

            if (!token) return;

            await donationsAPI.delete(token, id);

            toast.success('Donation deleted successfully');

            setIsDeleting(false);

            navigate('/donations');
        } catch (err) {
            console.error(err);

            toast.error(
                err?.message || 'Failed to delete donation'
            );
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto py-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 animate-pulse" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 h-[450px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />

                    <div className="h-[450px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (!donation) return null;

    const isOwner =
        donation?.profiles?.clerk_id === user?.id;

    const isAdmin = role === 'admin';

    const canModify = isOwner || isAdmin;

    const statusSteps = [
        { key: 'available', label: 'Listed' },
        { key: 'claimed', label: 'Claimed' },
        { key: 'picked_up', label: 'Picked Up' },
        { key: 'delivered', label: 'Delivered' },
    ];

    const currentStatusIdx = statusSteps.findIndex(
        (s) => s.key === donation.status
    );

    const isCancelled =
        donation.status === 'cancelled';

    const isExpired =
        donation.status === 'expired';

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <Link
                    to="/donations"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />

                    <span>Back to My Donations</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-6 rounded-3xl overflow-hidden relative">
                        <div className="flex items-center justify-between mb-5">
                            <span
                                className={`badge ${getUrgencyColor(
                                    donation.urgency
                                )}`}
                            >
                                {donation.urgency?.toUpperCase()} URGENCY
                            </span>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="w-3.5 h-3.5" />

                                <span>
                                    Posted{' '}
                                    {getRelativeTime(
                                        donation.created_at
                                    )}
                                </span>
                            </div>
                        </div>

                        {donation.images &&
                            donation.images.length > 0 ? (
                            <div className="h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 relative border border-slate-100 dark:border-slate-750">
                                <img
                                    src={donation.images[0]}
                                    alt={donation.food_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-44 bg-gradient-to-br from-primary-500/10 to-teal-500/10 rounded-2xl flex items-center justify-center mb-6 border border-primary-100/30 dark:border-primary-950/20">
                                <span className="text-6xl">
                                    {getCategoryIcon(
                                        donation.category
                                    )}
                                </span>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                    {donation.food_name}
                                </h1>

                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">
                                    {getCategoryIcon(
                                        donation.category
                                    )}

                                    {getCategoryLabel(
                                        donation.category
                                    )}
                                </span>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-xl font-black text-slate-800 dark:text-slate-200">
                                    {donation.quantity}
                                </p>

                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                    Quantity
                                </p>
                            </div>
                        </div>

                        {donation.description && (
                            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-600 dark:text-slate-300">
                                <p className="font-semibold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                                    Notes
                                </p>

                                {donation.description}
                            </div>
                        )}
                    </div>

                    <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-6 rounded-3xl space-y-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-500" />

                            Logistics & Location
                        </h3>

                        <div className="divide-y divide-slate-100 dark:divide-slate-750 text-sm text-slate-700 dark:text-slate-350">
                            <div className="py-3 flex justify-between gap-4">
                                <span className="text-slate-400">
                                    Pickup Address
                                </span>

                                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                                    {donation.pickup_address}
                                </span>
                            </div>

                            <div className="py-3 flex justify-between gap-4">
                                <span className="text-slate-400">
                                    Best Before
                                </span>

                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {new Date(
                                        donation.expires_at
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {canModify &&
                        !isCancelled &&
                        !isExpired && (
                            <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 rounded-3xl space-y-2.5">
                                <button
                                    onClick={() =>
                                        setIsEditing(true)
                                    }
                                    className="btn-secondary w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold"
                                >
                                    <Edit3 className="w-4 h-4" />

                                    Edit Details
                                </button>

                                <button
                                    onClick={() =>
                                        setIsDeleting(true)
                                    }
                                    className="btn w-full py-2.5 rounded-xl bg-red-50 border border-red-200/55 text-red-650 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 flex items-center justify-center gap-2 text-sm font-semibold"
                                >
                                    <Trash2 className="w-4 h-4" />

                                    Delete Posting
                                </button>
                            </div>
                        )}
                </div>
            </div>

            <AnimatePresence>
                {isDeleting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl"
                        >
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                Delete Donation?
                            </h3>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                This action cannot be undone.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() =>
                                        setIsDeleting(false)
                                    }
                                    className="btn-secondary px-4 py-2 text-xs"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="btn px-4 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}