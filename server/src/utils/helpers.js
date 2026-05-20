/**
 * Utility helpers for the RePlate API
 */

/**
 * Create a standardized API response
 */
export const apiResponse = (res, statusCode, data, message = 'Success') => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Calculate environmental impact metrics
 * Based on industry averages:
 * - 1 kg food waste = ~2.5 kg CO₂ equivalent
 * - 1 meal ≈ 0.5 kg food
 */
export const calculateImpact = (weightInKg) => {
  return {
    mealsSaved: Math.round(weightInKg / 0.5),
    co2Reduced: Math.round(weightInKg * 2.5 * 100) / 100, // in kg
    waterSaved: Math.round(weightInKg * 1000), // liters (avg)
    landSaved: Math.round(weightInKg * 3.5 * 100) / 100, // sq meters
  };
};

/**
 * Parse pagination query parameters
 */
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Format date to ISO string
 */
export const formatDate = (date) => {
  return new Date(date).toISOString();
};
