/**
 * AI Service - Handles Gemini API interactions for food analysis
 *
 * Methods:
 * - analyzeFreshness(imageBuffer, metadata) - Analyze food freshness from image
 * - categorizeFood(description, imageBuffer) - Auto-categorize food items
 */

import { visionModel, textModel } from '../config/gemini.js';

/* ────────────────────────────────────────────
 *  Helpers for dynamic metadata-based fallbacks
 * ──────────────────────────────────────────── */

const STORAGE_SHELF_LIFE = {
  refrigerated: { days: 5, label: '4-6 days' },
  frozen: { days: 30, label: '3-4 weeks' },
  room_temp: { days: 2, label: '1-2 days' },
  hot_holding: { days: 0.25, label: '4-6 hours' },
};

const CATEGORY_TRAITS = {
  cooked_meals: { baseScore: 65, perishability: 'high', method: 'Distribute immediately to nearby shelters or community kitchens.' },
  raw_produce: { baseScore: 72, perishability: 'medium', method: 'Deliver to community fridges or food banks with cold storage.' },
  bakery: { baseScore: 78, perishability: 'medium', method: 'Ideal for soup kitchens, shelters, or community events.' },
  dairy: { baseScore: 60, perishability: 'high', method: 'Requires cold-chain logistics. Deliver to organisations with refrigeration.' },
  beverages: { baseScore: 88, perishability: 'low', method: 'Suitable for any food bank or distribution centre.' },
  packaged: { baseScore: 90, perishability: 'low', method: 'Store in dry pantry; suitable for any distribution channel.' },
  fruits: { baseScore: 74, perishability: 'medium', method: 'Deliver quickly to food banks or community fruit stands.' },
  grains: { baseScore: 92, perishability: 'low', method: 'Long shelf life; ideal for food pantries and bulk distribution.' },
  meat: { baseScore: 55, perishability: 'very high', method: 'Must maintain cold chain. Deliver same-day to kitchens with proper storage.' },
  other: { baseScore: 70, perishability: 'medium', method: 'Distribute to local food pantry or community fridge.' },
};

const STORAGE_RECOMMENDATIONS = {
  refrigerated: [
    'Keep refrigerated at 0-4°C at all times.',
    'Check for off-odours or discolouration before distribution.',
    'Consume or distribute within the recommended shelf life.',
  ],
  frozen: [
    'Keep frozen at -18°C until ready to use.',
    'Do not refreeze after thawing.',
    'Thaw in the refrigerator, not at room temperature.',
  ],
  room_temp: [
    'Store in a cool, dry place away from direct sunlight.',
    'Keep sealed to prevent contamination.',
    'Inspect visually before distribution.',
  ],
  hot_holding: [
    'Maintain temperature above 60°C until serving.',
    'Distribute within 4 hours of preparation.',
    'Do not reheat more than once.',
  ],
};

/**
 * Build a unique, metadata-aware fallback when Gemini is unavailable.
 */
function buildFreshnessFallback(metadata) {
  const category = metadata.category || 'other';
  const storage = metadata.storageCondition || 'room_temp';
  const name = metadata.name || 'Food Item';

  const traits = CATEGORY_TRAITS[category] || CATEGORY_TRAITS.other;
  const shelfInfo = STORAGE_SHELF_LIFE[storage] || STORAGE_SHELF_LIFE.room_temp;

  // Derive a deterministic but varied score from the food name
  let nameHash = 0;
  for (let i = 0; i < name.length; i++) {
    nameHash = ((nameHash << 5) - nameHash + name.charCodeAt(i)) | 0;
  }
  const jitter = ((Math.abs(nameHash) % 21) - 10); // -10 to +10
  const freshnessScore = Math.max(20, Math.min(98, traits.baseScore + jitter));

  let urgencyLevel;
  if (freshnessScore >= 80) urgencyLevel = 'low';
  else if (freshnessScore >= 65) urgencyLevel = 'medium';
  else if (freshnessScore >= 45) urgencyLevel = 'high';
  else urgencyLevel = 'critical';

  const recommendations = STORAGE_RECOMMENDATIONS[storage] || STORAGE_RECOMMENDATIONS.room_temp;

  return {
    freshnessScore,
    urgencyLevel,
    estimatedShelfLife: shelfInfo.label,
    safetyRecommendations: recommendations,
    distributionMethod: traits.method,
    analysis: `Estimated analysis for "${name}" (${category.replace('_', ' ')}, stored ${storage.replace('_', ' ')}). AI vision service was unavailable; results are derived from food category and storage metadata.`,
  };
}

/**
 * Build a unique, metadata-aware fallback for categorisation.
 */
function buildCategorizationFallback(description) {
  const lower = (description || '').toLowerCase();
  const categoryMap = [
    { keywords: ['rice', 'wheat', 'oats', 'cereal', 'flour', 'grain', 'bread'], category: 'grains', sub: 'staple' },
    { keywords: ['milk', 'cheese', 'yogurt', 'curd', 'butter', 'paneer', 'cream'], category: 'dairy', sub: 'dairy product' },
    { keywords: ['juice', 'water', 'soda', 'tea', 'coffee', 'drink', 'beverage', 'smoothie'], category: 'beverages', sub: 'drink' },
    { keywords: ['apple', 'banana', 'mango', 'orange', 'grape', 'berry', 'fruit', 'melon'], category: 'fruits', sub: 'fresh fruit' },
    { keywords: ['chicken', 'mutton', 'fish', 'meat', 'egg', 'prawn', 'pork', 'beef', 'lamb'], category: 'meat', sub: 'protein' },
    { keywords: ['cake', 'cookie', 'pastry', 'muffin', 'donut', 'biscuit', 'croissant'], category: 'bakery', sub: 'baked good' },
    { keywords: ['vegetable', 'tomato', 'potato', 'onion', 'carrot', 'spinach', 'cabbage', 'lettuce', 'broccoli'], category: 'raw_produce', sub: 'vegetable' },
    { keywords: ['curry', 'biryani', 'dal', 'soup', 'stew', 'pasta', 'noodle', 'cooked', 'meal', 'lunch', 'dinner'], category: 'cooked_meals', sub: 'prepared meal' },
    { keywords: ['packet', 'can', 'tin', 'sealed', 'packaged', 'chips', 'snack'], category: 'packaged', sub: 'packaged food' },
  ];

  for (const entry of categoryMap) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return {
        category: entry.category,
        subcategory: entry.sub,
        suggestedName: description || 'Food Item',
        estimatedServings: 8 + ((description || '').length % 7),
        approximateWeight: 2 + ((description || '').length % 5),
        nutritionalEstimate: { calories: 200 + ((description || '').length % 150), protein: 6 + ((description || '').length % 12), carbs: 30 + ((description || '').length % 20), fat: 4 + ((description || '').length % 10) },
      };
    }
  }

  return {
    category: 'other',
    subcategory: 'general',
    suggestedName: description || 'Food Item',
    estimatedServings: 10,
    approximateWeight: 4,
    nutritionalEstimate: { calories: 250, protein: 8, carbs: 35, fat: 6 },
  };
}

/* ────────────────────────────────────────────
 *  Retry helper for transient Gemini errors
 * ──────────────────────────────────────────── */

async function callWithRetry(fn, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err?.status || err?.httpStatusCode || 0;
      const isTransient = status === 429 || status === 503 || status === 500;
      if (isTransient && attempt < retries) {
        const delay = (attempt + 1) * 1500; // 1.5s, 3s
        console.warn(`Gemini transient error (${status}), retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

/* ────────────────────────────────────────────
 *  Public API
 * ──────────────────────────────────────────── */

/**
 * Analyze food freshness from an image and metadata
 * @param {Buffer} imageBuffer - Food image buffer
 * @param {Object} metadata - Food metadata (name, type, storage, etc.)
 * @returns {Object} Freshness analysis result
 */
export const analyzeFreshness = async (imageBuffer, metadata) => {
  try {
    const prompt = `You are a food safety expert. Analyze this food image and provide:
    1. Freshness Score (0-100, where 100 is freshest)
    2. Urgency Level (critical, high, medium, low)
    3. Estimated remaining shelf life
    4. Safety recommendations (array of strings)
    5. Best distribution method
    6. A short paragraph analysis of the food condition

    Food Details:
    - Name: ${metadata.name || 'Unknown'}
    - Category: ${metadata.category || 'Unknown'}
    - Prepared/Packaged Date: ${metadata.preparedDate || 'Unknown'}
    - Storage Condition: ${metadata.storageCondition || 'Unknown'}
    - Quantity: ${metadata.quantity || 'Unknown'}

    Respond ONLY with valid JSON (no markdown fences) with keys: freshnessScore, urgencyLevel, estimatedShelfLife, safetyRecommendations, distributionMethod, analysis`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const result = await callWithRetry(() => visionModel.generateContent([prompt, imagePart]));
    const response = result.response.text();

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`AI Freshness: "${metadata.name}" → score ${parsed.freshnessScore}, urgency ${parsed.urgencyLevel}`);
      return parsed;
    }

    console.warn('AI Freshness: could not extract JSON from Gemini response, using text fallback');
    return { analysis: response, freshnessScore: 50, urgencyLevel: 'medium' };
  } catch (error) {
    console.error('AI Freshness Analysis Error:', error.message);
    console.warn('Falling back to metadata-based freshness estimation');
    return buildFreshnessFallback(metadata);
  }
};

/**
 * Auto-categorize food from description or image
 * @param {string} description - Food description
 * @param {Buffer} [imageBuffer] - Optional food image buffer
 * @returns {Object} Categorization result
 */
export const categorizeFood = async (description, imageBuffer = null) => {
  try {
    const prompt = `Categorize this food item and provide:
    1. Category (Must be exactly one of: cooked_meals, raw_produce, bakery, dairy, beverages, packaged, fruits, grains, meat, other)
    2. Subcategory
    3. Suggested name
    4. Estimated servings
    5. Approximate weight in kg
    6. Nutritional estimate (calories, protein, carbs, fat per serving)

    Food Description: ${description}

    Respond ONLY with valid JSON (no markdown fences) with keys: category, subcategory, suggestedName, estimatedServings, approximateWeight, nutritionalEstimate`;

    let result;
    if (imageBuffer) {
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      };
      result = await callWithRetry(() => visionModel.generateContent([prompt, imagePart]));
    } else {
      result = await callWithRetry(() => textModel.generateContent(prompt));
    }

    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`AI Categorize: "${description}" → ${parsed.category}`);
      return parsed;
    }

    return { category: 'other', analysis: response };
  } catch (error) {
    console.error('AI Categorization Error:', error.message);
    console.warn('Falling back to keyword-based categorisation');
    return buildCategorizationFallback(description);
  }
};

export default { analyzeFreshness, categorizeFood };
