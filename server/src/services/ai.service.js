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
    throw new Error('Failed to analyze food freshness');
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
    1. Category (e.g., Cooked Meals, Raw Produce, Bakery, Dairy, Beverages, Packaged Food, Other)
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

    return { category: 'Other', analysis: response };
  } catch (error) {
    console.error('AI Categorization Error:', error.message);
    throw new Error('Failed to categorize food');
  }
};

export default { analyzeFreshness, categorizeFood };
