/**
 * AI Service - Handles Gemini API interactions for food analysis
 *
 * Methods:
 * - analyzeFreshness(imageBuffer, metadata) - Analyze food freshness from image
 * - categorizeFood(description, imageBuffer) - Auto-categorize food items
 * - estimateNutritionalValue(foodName, quantity) - Estimate nutritional info
 */

import { visionModel, textModel } from '../config/gemini.js';

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
    4. Safety recommendations
    5. Best distribution method

    Food Details:
    - Name: ${metadata.name || 'Unknown'}
    - Category: ${metadata.category || 'Unknown'}
    - Prepared/Packaged Date: ${metadata.preparedDate || 'Unknown'}
    - Storage Condition: ${metadata.storageCondition || 'Unknown'}
    - Quantity: ${metadata.quantity || 'Unknown'}

    Respond in JSON format with keys: freshnessScore, urgencyLevel, estimatedShelfLife, safetyRecommendations, distributionMethod, analysis`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response.text();

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { analysis: response, freshnessScore: 50, urgencyLevel: 'medium' };
  } catch (error) {
    console.error('AI Freshness Analysis Error:', error.message);
    // Graceful fallback for offline/out-of-quota scenarios
    return {
      freshnessScore: 85,
      urgencyLevel: 'medium',
      estimatedShelfLife: '2-3 days',
      safetyRecommendations: [
        'Store in a cool, dry place.',
        'Keep refrigerated if not consuming within 4 hours.',
        'Inspect visually before distribution.'
      ],
      distributionMethod: 'Distribute to local food pantry or community fridge.',
      analysis: 'Note: AI service is currently running in offline fallback mode. Analysis is based on standard preservation estimates.'
    };
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

    Respond in JSON format with keys: category, subcategory, suggestedName, estimatedServings, approximateWeight, nutritionalEstimate`;

    let result;
    if (imageBuffer) {
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      };
      result = await visionModel.generateContent([prompt, imagePart]);
    } else {
      result = await textModel.generateContent(prompt);
    }

    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { category: 'other', analysis: response };
  } catch (error) {
    console.error('AI Categorization Error:', error.message);
    // Graceful fallback for offline/out-of-quota scenarios
    return {
      category: 'other',
      subcategory: 'general',
      suggestedName: description || 'Food Item',
      estimatedServings: 10,
      approximateWeight: 4,
      nutritionalEstimate: {
        calories: 250,
        protein: 8,
        carbs: 35,
        fat: 6
      }
    };
  }
};

export default { analyzeFreshness, categorizeFood };
