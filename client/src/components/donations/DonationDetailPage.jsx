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
    ClipboardCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI, claimsAPI } from '@/services/api';
import FreshnessIndicator from './FreshnessIndicator';
import DonationLocationMap from './DonationLocationMap';
import LocationPickerMap from './LocationPickerMap';
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

    const [isClaiming, setIsClaiming] = useState(false);
    const [pickupScheduledAt, setPickupScheduledAt] = useState(() => {
        const date = new Date(Date.now() + 2 * 60 * 60 * 1000);
        return date.toISOString().slice(0, 16);
    });
    const [claimNotes, setClaimNotes] = useState('');
    const [claimingInProgress, setClaimingInProgress] = useState(false);

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
                    latitude: res.donation.latitude,
                    longitude: res.donation.longitude,
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

    const [editSaving, setEditSaving] = useState(false);

    const validateEditForm = () => {
        if (!editForm.name?.trim()) return 'Food name is required';
        if (!editForm.quantity || parseFloat(editForm.quantity) <= 0) return 'Quantity must be a positive number';
        if (!editForm.expiryDate) return 'Expiry date is required';
        const expiryStr = editForm.expiryTime
            ? `${editForm.expiryDate}T${editForm.expiryTime}:00`
            : `${editForm.expiryDate}T23:59:59`;
        if (new Date(expiryStr) <= new Date()) return 'Expiry must be in the future';
        return null;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        const validationError = validateEditForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setEditSaving(true);

        // Snapshot for rollback
        const previousDonation = { ...donation };

        // Optimistic UI update
        setDonation((prev) => ({
            ...prev,
            food_name: editForm.name,
            category: editForm.category,
            quantity: `${editForm.quantity} ${editForm.unit}`,
            storage_condition: editForm.storageCondition,
            pickup_city: editForm.city,
            pickup_instructions: editForm.instructions,
            description: editForm.notes,
            is_vegetarian: editForm.isVegetarian,
            is_vegan: editForm.isVegan,
        }));

        try {
            const token = await getAuthToken();
            if (!token) {
                setDonation(previousDonation);
                return;
            }

            await donationsAPI.patch(token, id, editForm);

            toast.success('Donation updated successfully');
            setIsEditing(false);
            await fetchDonationDetails();
        } catch (err) {
            console.error(err);
            // Rollback optimistic update
            setDonation(previousDonation);
            toast.error(
                err?.message || 'Failed to update donation'
            );
        } finally {
            setEditSaving(false);
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

    const handleClaim = async (e) => {
        e.preventDefault();
        if (!pickupScheduledAt) {
            toast.error('Please schedule a pickup time');
            return;
        }
        setClaimingInProgress(true);
        try {
            const token = await getAuthToken();
            if (!token) return;

            await claimsAPI.create(token, {
                donationId: id,
                pickupScheduledAt: new Date(pickupScheduledAt).toISOString(),
                notes: claimNotes.trim() || undefined
            });

            toast.success('Food donation claimed successfully!');
            setIsClaiming(false);
            setClaimNotes('');
            await fetchDonationDetails();
        } catch (err) {
            console.error(err);
            toast.error(err?.message || 'Failed to claim food donation');
        } finally {
            setClaimingInProgress(false);
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

    // Editing is only allowed when the donation is available
    const canEdit = canModify && donation.status === 'available';

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
                    to={role === 'ngo' ? '/available' : '/donations'}
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />

                    <span>{role === 'ngo' ? 'Back to Available Food' : 'Back to My Donations'}</span>
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

                    {donation.ai_analysis && (
                        <FreshnessIndicator
                            score={donation.ai_freshness_score}
                            urgency={typeof donation.ai_analysis === 'string' ? JSON.parse(donation.ai_analysis).urgencyLevel : donation.ai_analysis.urgencyLevel}
                            shelfLife={typeof donation.ai_analysis === 'string' ? JSON.parse(donation.ai_analysis).estimatedShelfLife : donation.ai_analysis.estimatedShelfLife}
                            recommendations={typeof donation.ai_analysis === 'string' ? JSON.parse(donation.ai_analysis).safetyRecommendations : donation.ai_analysis.safetyRecommendations}
                            distributionMethod={typeof donation.ai_analysis === 'string' ? JSON.parse(donation.ai_analysis).distributionMethod : donation.ai_analysis.distributionMethod}
                            analysis={typeof donation.ai_analysis === 'string' ? JSON.parse(donation.ai_analysis).analysis : donation.ai_analysis.analysis}
                        />
                    )}

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

                        {/* Map — visible to NGOs, admins, and donation owner */}
                        {(role === 'ngo' || role === 'admin' || isOwner) && (
                            <div className="mt-4">
                                <DonationLocationMap
                                    latitude={donation.latitude}
                                    longitude={donation.longitude}
                                    address={donation.pickup_address}
                                    foodName={donation.food_name}
                                    showRoute={role === 'ngo'}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    {canModify &&
                        !isCancelled &&
                        !isExpired && (
                            <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-4 rounded-3xl space-y-2.5">
                                {canEdit ? (
                                    <button
                                        onClick={() =>
                                            setIsEditing(true)
                                        }
                                        className="btn-secondary w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Details
                                    </button>
                                ) : (
                                    <div className="text-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            Editing disabled — status is "{donation.status.replace('_', ' ')}"
                                        </p>
                                    </div>
                                )}

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

                    {role === 'ngo' && donation.status === 'available' && (
                        <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-5 rounded-3xl space-y-4 shadow-sm">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                                <ClipboardCheck className="w-4.5 h-4.5 text-primary-500" />
                                Claim Surplus Food
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                                Schedule a pickup time to claim this donation. It will be reserved for your organization.
                            </p>
                            <button
                                onClick={() => setIsClaiming(true)}
                                className="btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-glow-green border-none"
                            >
                                Claim Food
                            </button>
                        </div>
                    )}

                    {claims && claims.length > 0 && (() => {
                        const activeClaim = claims.find(c => c.status !== 'cancelled');
                        if (!activeClaim) return null;
                        
                        return (
                            <div className="card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 p-5 rounded-3xl space-y-3 shadow-sm">
                                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                                    <ClipboardCheck className="w-4.5 h-4.5 text-emerald-500" />
                                    Active Claim Status
                                </h3>
                                <div className="text-xs space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Claim Status:</span>
                                        <span className="font-semibold text-emerald-500 capitalize">{activeClaim.status.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Scheduled:</span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                            {new Date(activeClaim.pickup_scheduled_at).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    {activeClaim.notes && (
                                        <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-750 text-[11px] text-slate-550 dark:text-slate-400">
                                            <span className="font-semibold block mb-0.5">Claim Notes:</span>
                                            {activeClaim.notes}
                                        </div>
                                    )}
                                </div>
                                {role === 'ngo' && (
                                    <Link to="/claims" className="btn-secondary w-full py-2 rounded-xl text-xs font-semibold block text-center mt-2">
                                        Manage in My Claims
                                    </Link>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>

            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-full max-w-lg border border-slate-100 dark:border-slate-700 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsEditing(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                <Edit3 className="w-5 h-5 text-primary-500" />
                                Edit Donation
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                Update your donation details. Changes will be saved immediately.
                            </p>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                {/* Food Name */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Food Name *</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        required
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="e.g. Cooked Rice & Dal"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                                    <select
                                        className="input w-full"
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    >
                                        {FOOD_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity + Unit */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Quantity *</label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            className="input w-full"
                                            required
                                            value={editForm.quantity}
                                            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit</label>
                                        <select
                                            className="input w-full"
                                            value={editForm.unit}
                                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                        >
                                            <option value="meals">Meals / Servings</option>
                                            <option value="kg">Kilograms (kg)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Expiry Date + Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry Date *</label>
                                        <input
                                            type="date"
                                            className="input w-full"
                                            required
                                            value={editForm.expiryDate}
                                            onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry Time</label>
                                        <input
                                            type="time"
                                            className="input w-full"
                                            value={editForm.expiryTime}
                                            onChange={(e) => setEditForm({ ...editForm, expiryTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Storage Condition */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Storage Condition</label>
                                    <select
                                        className="input w-full"
                                        value={editForm.storageCondition}
                                        onChange={(e) => setEditForm({ ...editForm, storageCondition: e.target.value })}
                                    >
                                        {STORAGE_CONDITIONS.map((sc) => (
                                            <option key={sc.value} value={sc.value}>
                                                {sc.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pickup Address</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        placeholder="Street address"
                                    />
                                </div>

                                {/* City, State, Pincode */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editForm.city}
                                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">State</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editForm.state}
                                            onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={editForm.pincode}
                                            onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Map Pin Selection for Donors */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Pin Pickup Location *</label>
                                    <LocationPickerMap
                                        latitude={editForm.latitude}
                                        longitude={editForm.longitude}
                                        onLocationSelect={(lat, lng) => {
                                            setEditForm(prev => ({
                                                ...prev,
                                                latitude: lat,
                                                longitude: lng
                                            }));
                                        }}
                                        addressFields={{
                                            address: editForm.address,
                                            city: editForm.city,
                                            state: editForm.state,
                                            pincode: editForm.pincode
                                        }}
                                        onAddressAutoFill={(autofill) => {
                                            setEditForm(prev => ({
                                                ...prev,
                                                address: autofill.address || prev.address,
                                                city: autofill.city || prev.city,
                                                state: autofill.state || prev.state,
                                                pincode: autofill.pincode || prev.pincode
                                            }));
                                        }}
                                    />
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Pickup Instructions</label>
                                    <textarea
                                        className="input w-full h-20 py-2 resize-none text-xs"
                                        value={editForm.instructions}
                                        onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                                        placeholder="e.g. Ring the bell at gate 2"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description / Notes</label>
                                    <textarea
                                        className="input w-full h-20 py-2 resize-none text-xs"
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        placeholder="Additional notes about the donation"
                                    />
                                </div>

                                {/* Dietary flags */}
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                                            checked={editForm.isVegetarian}
                                            onChange={(e) => setEditForm({ ...editForm, isVegetarian: e.target.checked })}
                                        />
                                        🥬 Vegetarian
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                                            checked={editForm.isVegan}
                                            onChange={(e) => setEditForm({ ...editForm, isVegan: e.target.checked })}
                                        />
                                        🌱 Vegan
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        disabled={editSaving}
                                        className="btn-secondary w-full py-2.5 text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editSaving}
                                        className="btn-primary w-full py-2.5 text-xs border-none shadow-glow-green flex items-center justify-center gap-2"
                                    >
                                        {editSaving ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

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

                {isClaiming && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 p-6 rounded-3xl w-full max-w-md border border-slate-100 dark:border-slate-700 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsClaiming(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                Claim Surplus Food
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                Select your logistics team's scheduled pick up date and time.
                            </p>

                            <form onSubmit={handleClaim} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Scheduled Pickup Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="input w-full"
                                        required
                                        value={pickupScheduledAt}
                                        onChange={(e) => setPickupScheduledAt(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Notes for the Donor (Optional)
                                    </label>
                                    <textarea
                                        placeholder="E.g., Our pickup vehicle will arrive around 2 PM. Please let us know if any special gate access is needed."
                                        className="input w-full h-24 py-2 resize-none text-xs"
                                        value={claimNotes}
                                        onChange={(e) => setClaimNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsClaiming(false)}
                                        className="btn-secondary w-full py-2.5 text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={claimingInProgress}
                                        className="btn-primary w-full py-2.5 text-xs bg-primary-600 hover:bg-primary-700 border-none shadow-glow-green animate-none"
                                    >
                                        {claimingInProgress ? 'Claiming...' : 'Confirm Claim'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}