import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { analyzeFreshness, categorizeFood } from '../services/ai.service.js';

const router = Router();

/**
 * POST /api/ai/analyze-freshness
 * AI-powered food freshness analysis
 * Accepts food image and metadata, returns freshness score and urgency
 */
router.post('/analyze-freshness', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No food image uploaded' });
    }

    const metadata = {
      name: req.body.name || req.body.food_name || 'Unknown',
      category: req.body.category || 'Unknown',
      preparedDate: req.body.preparedDate || req.body.prepared_at || 'Unknown',
      storageCondition: req.body.storageCondition || req.body.storage_condition || 'Unknown',
      quantity: req.body.quantity || 'Unknown',
    };

    const result = await analyzeFreshness(req.file.buffer, metadata);

    res.status(200).json({
      freshnessScore: result.freshnessScore || 50,
      urgencyLevel: result.urgencyLevel || 'medium',
      estimatedShelfLife: result.estimatedShelfLife || 'unknown',
      safetyRecommendations: result.safetyRecommendations || result.recommendations || [],
      recommendations: result.safetyRecommendations || result.recommendations || [],
      distributionMethod: result.distributionMethod || '',
      analysis: result.analysis || '',
    });
  } catch (error) {
    console.error('API Freshness Analysis Route Error:', error.message);
    next(error);
  }
});

/**
 * POST /api/ai/categorize
 * AI-powered food categorization
 * Automatically categorize food items from image or description
 */
router.post('/categorize', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description && !req.file) {
      return res.status(400).json({ error: 'Please provide either a food description or an image' });
    }

    const result = await categorizeFood(description || '', req.file ? req.file.buffer : null);

    res.status(200).json({
      category: result.category || 'other',
      subcategory: result.subcategory || 'unknown',
      suggestedName: result.suggestedName || '',
      estimatedServings: result.estimatedServings || 0,
      approximateWeight: result.approximateWeight || 0,
      nutritionalEstimate: result.nutritionalEstimate || {},
    });
  } catch (error) {
    console.error('API Food Categorization Route Error:', error.message);
    next(error);
  }
});

export default router;
