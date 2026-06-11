import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { supabaseAdmin } from '../config/supabase.js';
import { uploadImage, deleteImage } from '../services/storage.service.js';
import { sendDonationAlert } from '../services/email.service.js';
import { geocodeAddress } from '../services/geocoding.service.js';
import { cacheMiddleware, invalidateCachePattern } from '../middleware/cache.js';

const router = Router();

/**
 * GET /api/donations
 * Get all donations (filtered by role with query parameter sanitization)
 */
router.get('/', requireAuth, cacheMiddleware('donations', 5), async (req, res, next) => {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let query = supabaseAdmin
      .from('donations')
      .select('*, profiles:donor_id(first_name, last_name, organization_name, email)');

    // Role-based filtering
    if (profile.role === 'donor') {
      query = query.eq('donor_id', profile.id);
    } else if (profile.role === 'ngo') {
      query = query.eq('status', 'available');
    }

    // Force query parameters to be strings to prevent array injection crashes
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const city = typeof req.query.city === 'string' ? req.query.city : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const limit = typeof req.query.limit === 'string' ? req.query.limit : undefined;

    if (status && (profile.role === 'donor' || profile.role === 'admin')) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (city) {
      query = query.ilike('pickup_city', `%${city}%`);
    }
    if (search) {
      query = query.or(`food_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum)) {
        query = query.limit(limitNum);
      }
    }

    const { data: donations, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    res.status(200).json({ donations: donations || [], total: donations ? donations.length : 0 });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/donations/:id
 * Get a specific donation by ID
 */
router.get('/:id', requireAuth, cacheMiddleware('donation', 10), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: donation, error: donationErr } = await supabaseAdmin
      .from('donations')
      .select('*, profiles:donor_id(*)')
      .eq('id', id)
      .single();

    if (donationErr || !donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    const { data: claims, error: claimsErr } = await supabaseAdmin
      .from('claims')
      .select('*, profiles:ngo_id(organization_name, email, phone)')
      .eq('donation_id', id);

    if (claimsErr) throw claimsErr;

    res.status(200).json({ donation, claims: claims || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/donations
 * Create a new food donation with multipart parser fallback safety
 */
router.post('/', requireAuth, requireRole('donor', 'admin'), upload.array('images', 3), async (req, res, next) => {
  const uploadedPaths = []; // Track assets for automated emergency rolling cleanups
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const {
      name,
      category,
      quantity,
      unit = 'meals',
      expiryDate,
      expiryTime,
      storageCondition = 'room_temp',
      address,
      city,
      state,
      pincode,
      instructions,
      notes,
      isVegetarian,
      isVegan,
      allergens,
      aiFreshnessScore,
      ai_freshness_score,
      aiAnalysis,
      ai_analysis,
      aiCategorySuggestion,
      ai_category_suggestion
    } = req.body;

    if (!name || !quantity || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process image uploads safely
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadRes = await uploadImage(file.buffer, file.originalname, file.mimetype);
        imageUrls.push(uploadRes.publicUrl);

        // Extract storage path from absolute URL for recovery tracking
        const pathParts = uploadRes.publicUrl.split('/donation-images/');
        if (pathParts.length > 1) uploadedPaths.push(pathParts[1]);
      }
    }

    const qtyNum = parseFloat(quantity);
    const quantityStr = `${qtyNum} ${unit}`;

    let weight_kg = 0;
    let servings = 0;
    if (unit === 'kg') {
      weight_kg = qtyNum;
      servings = Math.round(qtyNum / 0.4);
    } else {
      weight_kg = qtyNum * 0.4;
      servings = Math.round(qtyNum);
    }

    const expiryString = expiryTime ? `${expiryDate}T${expiryTime}:00` : `${expiryDate}T23:59:59`;
    const expires_at = new Date(expiryString).toISOString();

    const diffHours = (new Date(expires_at) - new Date()) / (1000 * 60 * 60);
    let urgency = 'medium';
    if (diffHours < 2) urgency = 'critical';
    else if (diffHours < 6) urgency = 'high';
    else if (diffHours < 24) urgency = 'medium';
    else urgency = 'low';

    const pickupAddressStr = `${address || ''}${state ? ', ' + state : ''}${pincode ? ' - ' + pincode : ''}`;

    // Standardize Multi-Part String/Array variations safely
    let parsedAllergens = [];
    if (allergens) {
      if (Array.isArray(allergens)) {
        parsedAllergens = allergens;
      } else if (typeof allergens === 'string') {
        if (allergens.startsWith('[') && allergens.endsWith(']')) {
          try { parsedAllergens = JSON.parse(allergens); } catch { parsedAllergens = []; }
        } else {
          parsedAllergens = allergens.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
    }

    // Safely parse AI fields
    const scoreVal = aiFreshnessScore || ai_freshness_score;
    const ai_freshness_score_num = scoreVal ? parseInt(scoreVal, 10) : null;

    let parsedAiAnalysis = null;
    const rawAnalysis = aiAnalysis || ai_analysis;
    if (rawAnalysis) {
      try {
        parsedAiAnalysis = typeof rawAnalysis === 'string'
          ? JSON.parse(rawAnalysis)
          : rawAnalysis;
      } catch (err) {
        parsedAiAnalysis = { raw: rawAnalysis };
      }
    }

    const categorySuggestion = aiCategorySuggestion || ai_category_suggestion || null;

    // Parse client-supplied coordinates, falling back to geocoding if unavailable
    let latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;

    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      const geocodeQuery = [address, city, state, pincode].filter(Boolean).join(', ');
      if (geocodeQuery.trim()) {
        try {
          const coords = await geocodeAddress(geocodeQuery);
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
          }
        } catch (geoErr) {
          console.error('Geocoding failed (non-critical):', geoErr.message);
        }
      }
    } else {
      latitude = isNaN(latitude) ? null : latitude;
      longitude = isNaN(longitude) ? null : longitude;
    }

    const donationData = {
      donor_id: profile.id,
      food_name: name,
      description: notes || '',
      category: category || 'other',
      quantity: quantityStr,
      weight_kg,
      servings,
      storage_condition: storageCondition || 'room_temp',
      expires_at,
      pickup_address: pickupAddressStr,
      pickup_city: city || '',
      pickup_instructions: instructions || '',
      latitude,
      longitude,
      images: imageUrls,
      status: 'available',
      urgency,
      is_vegetarian: isVegetarian === 'true' || isVegetarian === true,
      is_vegan: isVegan === 'true' || isVegan === true,
      allergens: parsedAllergens,
      ai_freshness_score: ai_freshness_score_num,
      ai_analysis: parsedAiAnalysis,
      ai_category_suggestion: categorySuggestion
    };

    const { data: donation, error: insertErr } = await supabaseAdmin
      .from('donations')
      .insert(donationData)
      .select()
      .single();

    if (insertErr) throw insertErr;

    // --- Notify nearby NGOs (non-blocking) ---
    try {
      // Query NGOs — prefer same city, fall back to all NGOs
      let ngoQuery = supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('role', 'ngo')
        .eq('is_active', true);

      if (city) {
        ngoQuery = ngoQuery.ilike('city', `%${city}%`);
      }

      const { data: ngos } = await ngoQuery;

      if (ngos && ngos.length > 0) {
        const donationInfo = {
          id: donation.id,
          foodName: donation.food_name,
          quantity: donation.quantity,
          expiryDate: new Date(donation.expires_at).toLocaleString(),
          location: donation.pickup_address,
          urgencyLevel: donation.urgency,
          category: donation.category,
          storageCondition: donation.storage_condition,
          aiFreshnessScore: donation.ai_freshness_score,
        };

        for (const ngo of ngos) {
          // In-app notification
          await supabaseAdmin.from('notifications').insert({
            user_id: ngo.id,
            type: 'donation_alert',
            title: 'New Food Available',
            message: `A new donation "${name}" (${quantityStr}) has been posted near your area.`,
            data: { donation_id: donation.id },
          });

          // Email notification
          if (ngo.email) {
            sendDonationAlert(ngo.email, donationInfo).catch((err) =>
              console.error('NGO alert email failed:', err.message)
            );
          }
        }
      }
    } catch (alertErr) {
      // Don't fail the donation creation if alerting fails
      console.error('NGO alerting failed (non-critical):', alertErr.message);
    }

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern('analytics:*');

    res.status(201).json({ message: 'Donation created successfully', donation });
  } catch (error) {
    // Transaction Rollback Fallback Strategy: Evict storage assets if DB layer breaks
    for (const path of uploadedPaths) {
      try { await deleteImage(path); } catch (err) { console.error('Rollback cleanup failed for path:', path, err); }
    }
    next(error);
  }
});

/**
 * PATCH /api/donations/:id
 * Edit a donation (only when status is 'available')
 * Enforces ownership + status-based edit restrictions
 */
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: existingDonation, error: fetchErr } = await supabaseAdmin
      .from('donations')
      .select('donor_id, status, quantity, expires_at, pickup_address')
      .eq('id', id)
      .single();

    if (fetchErr || !existingDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Ownership check
    if (profile.role !== 'admin' && existingDonation.donor_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied. Only the owner or an admin can edit this donation.' });
    }

    // Status-based restriction — only editable when 'available'
    if (existingDonation.status !== 'available') {
      return res.status(400).json({
        error: `Cannot edit a donation with status "${existingDonation.status}". Only donations with status "available" can be edited.`,
      });
    }

    const {
      name, category, quantity, unit, expiryDate, expiryTime,
      storageCondition, address, city, state, pincode,
      instructions, notes, isVegetarian, isVegan, allergens,
      latitude, longitude,
    } = req.body;

    const updateData = {};

    if (name) updateData.food_name = name;
    if (category) updateData.category = category;
    if (storageCondition) updateData.storage_condition = storageCondition;
    if (city) updateData.pickup_city = city;
    if (instructions !== undefined) updateData.pickup_instructions = instructions;
    if (notes !== undefined) updateData.description = notes;
    if (isVegetarian !== undefined) updateData.is_vegetarian = isVegetarian === 'true' || isVegetarian === true;
    if (isVegan !== undefined) updateData.is_vegan = isVegan === 'true' || isVegan === true;

    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

    if (allergens) {
      updateData.allergens = Array.isArray(allergens) ? allergens : allergens.split(',').map((s) => s.trim());
    }

    if (address || state || pincode) {
      updateData.pickup_address = `${address || ''}${state ? ', ' + state : ''}${pincode ? ' - ' + pincode : ''}`;

      // Re-geocode when address changes AND coordinates are not explicitly updated in the request
      if (updateData.latitude === undefined || updateData.longitude === undefined) {
        const geocodeQuery = [address, city, state, pincode].filter(Boolean).join(', ');
        if (geocodeQuery.trim()) {
          try {
            const coords = await geocodeAddress(geocodeQuery);
            if (coords) {
              updateData.latitude = coords.latitude;
              updateData.longitude = coords.longitude;
            }
          } catch (geoErr) {
            console.error('Geocoding failed during patch (non-critical):', geoErr.message);
          }
        }
      }
    }

    if (quantity || unit) {
      const existingQtyParts = existingDonation.quantity.split(' ');
      const qty = quantity || existingQtyParts[0];
      const unt = unit || existingQtyParts[1] || 'meals';
      const qtyNum = parseFloat(qty);
      updateData.quantity = `${qtyNum} ${unt}`;

      if (unt === 'kg') {
        updateData.weight_kg = qtyNum;
        updateData.servings = Math.round(qtyNum / 0.4);
      } else {
        updateData.weight_kg = qtyNum * 0.4;
        updateData.servings = Math.round(qtyNum);
      }
    }

    if (expiryDate || expiryTime) {
      const existingExpiry = new Date(existingDonation.expires_at);
      const defaultDate = existingExpiry.toISOString().split('T')[0];
      const defaultTime = existingExpiry.toISOString().split('T')[1].substring(0, 5);

      const expDate = expiryDate || defaultDate;
      const expTime = expiryTime || defaultTime;
      const expiryString = expTime ? `${expDate}T${expTime}:00` : `${expDate}T23:59:59`;
      const expires_at = new Date(expiryString).toISOString();
      updateData.expires_at = expires_at;

      const diffHours = (new Date(expires_at) - new Date()) / (1000 * 60 * 60);
      let urgency = 'medium';
      if (diffHours < 2) urgency = 'critical';
      else if (diffHours < 6) urgency = 'high';
      else if (diffHours < 24) urgency = 'medium';
      else urgency = 'low';
      updateData.urgency = urgency;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data: updatedDonation, error: updateErr } = await supabaseAdmin
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${id}*`);
    invalidateCachePattern('analytics:*');

    res.status(200).json({ message: 'Donation updated successfully', donation: updatedDonation });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/donations/:id
 * Update a donation (Donor owner or Admin only)
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: existingDonation, error: fetchErr } = await supabaseAdmin
      .from('donations')
      .select('donor_id, quantity, expires_at, pickup_address')
      .eq('id', id)
      .single();

    if (fetchErr || !existingDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (profile.role !== 'admin' && existingDonation.donor_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied. Only owner or admin can update this donation.' });
    }

    const {
      name,
      category,
      quantity,
      unit,
      expiryDate,
      expiryTime,
      storageCondition,
      address,
      city,
      state,
      pincode,
      instructions,
      notes,
      isVegetarian,
      isVegan,
      allergens,
      status,
      aiFreshnessScore,
      ai_freshness_score,
      aiAnalysis,
      ai_analysis,
      aiCategorySuggestion,
      ai_category_suggestion,
      latitude,
      longitude
    } = req.body;

    const updateData = {};
    if (name) updateData.food_name = name;
    if (category) updateData.category = category;
    if (storageCondition) updateData.storage_condition = storageCondition;
    if (city) updateData.pickup_city = city;
    if (instructions !== undefined) updateData.pickup_instructions = instructions;
    if (notes !== undefined) updateData.description = notes;
    if (status) updateData.status = status;
    if (isVegetarian !== undefined) updateData.is_vegetarian = isVegetarian === 'true' || isVegetarian === true;
    if (isVegan !== undefined) updateData.is_vegan = isVegan === 'true' || isVegan === true;

    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

    const scoreVal = aiFreshnessScore || ai_freshness_score;
    if (scoreVal !== undefined) {
      updateData.ai_freshness_score = scoreVal ? parseInt(scoreVal, 10) : null;
    }

    const rawAnalysis = aiAnalysis || ai_analysis;
    if (rawAnalysis !== undefined) {
      if (!rawAnalysis) {
        updateData.ai_analysis = null;
      } else {
        try {
          updateData.ai_analysis = typeof rawAnalysis === 'string'
            ? JSON.parse(rawAnalysis)
            : rawAnalysis;
        } catch (err) {
          updateData.ai_analysis = { raw: rawAnalysis };
        }
      }
    }

    const categorySuggestion = aiCategorySuggestion || ai_category_suggestion;
    if (categorySuggestion !== undefined) {
      updateData.ai_category_suggestion = categorySuggestion || null;
    }

    if (allergens) {
      updateData.allergens = Array.isArray(allergens) ? allergens : allergens.split(',').map(s => s.trim());
    }

    if (address || state || pincode) {
      updateData.pickup_address = `${address || ''}${state ? ', ' + state : ''}${pincode ? ' - ' + pincode : ''}`;

      // Re-geocode when address changes AND coordinates are not explicitly updated in the request
      if (updateData.latitude === undefined || updateData.longitude === undefined) {
        const geocodeQuery = [address, city, state, pincode].filter(Boolean).join(', ');
        if (geocodeQuery.trim()) {
          try {
            const coords = await geocodeAddress(geocodeQuery);
            if (coords) {
              updateData.latitude = coords.latitude;
              updateData.longitude = coords.longitude;
            }
          } catch (geoErr) {
            console.error('Geocoding failed during put (non-critical):', geoErr.message);
          }
        }
      }
    }

    if (quantity || unit) {
      const existingQtyParts = existingDonation.quantity.split(' ');
      const qty = quantity || existingQtyParts[0];
      const unt = unit || existingQtyParts[1] || 'meals';
      const qtyNum = parseFloat(qty);
      updateData.quantity = `${qtyNum} ${unt}`;

      if (unt === 'kg') {
        updateData.weight_kg = qtyNum;
        updateData.servings = Math.round(qtyNum / 0.4);
      } else {
        updateData.weight_kg = qtyNum * 0.4;
        updateData.servings = Math.round(qtyNum);
      }
    }

    if (expiryDate || expiryTime) {
      const existingExpiry = new Date(existingDonation.expires_at);
      const defaultDate = existingExpiry.toISOString().split('T')[0];
      const defaultTime = existingExpiry.toISOString().split('T')[1].substring(0, 5);

      const expDate = expiryDate || defaultDate;
      const expTime = expiryTime || defaultTime;
      const expiryString = expTime ? `${expDate}T${expTime}:00` : `${expDate}T23:59:59`;
      const expires_at = new Date(expiryString).toISOString();
      updateData.expires_at = expires_at;

      const diffHours = (new Date(expires_at) - new Date()) / (1000 * 60 * 60);
      let urgency = 'medium';
      if (diffHours < 2) urgency = 'critical';
      else if (diffHours < 6) urgency = 'high';
      else if (diffHours < 24) urgency = 'medium';
      else urgency = 'low';
      updateData.urgency = urgency;
    }

    const { data: updatedDonation, error: updateErr } = await supabaseAdmin
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${id}*`);
    invalidateCachePattern('analytics:*');

    res.status(200).json({ message: 'Donation updated successfully', donation: updatedDonation });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/donations/:id/status
 * Update donation status
 */
router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: donation, error: fetchErr } = await supabaseAdmin
      .from('donations')
      .select('donor_id')
      .eq('id', id)
      .single();

    if (fetchErr || !donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (profile.role !== 'admin' && donation.donor_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { data: updatedDonation, error: updateErr } = await supabaseAdmin
      .from('donations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${id}*`);
    invalidateCachePattern('analytics:*');

    res.status(200).json({ message: 'Status updated successfully', donation: updatedDonation });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/donations/:id
 * Delete a donation and clean storage
 */
router.delete('/:id', requireAuth, requireRole('donor', 'admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: donation, error: fetchErr } = await supabaseAdmin
      .from('donations')
      .select('donor_id, images')
      .eq('id', id)
      .single();

    if (fetchErr || !donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (profile.role !== 'admin' && donation.donor_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (donation.images && donation.images.length > 0) {
      for (const url of donation.images) {
        try {
          const parts = url.split('/donation-images/');
          if (parts.length > 1) {
            await deleteImage(parts[1]);
          }
        } catch (err) {
          console.error('Failed to delete image:', url, err.message);
        }
      }
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('donations')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${id}*`);
    invalidateCachePattern('analytics:*');

    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;