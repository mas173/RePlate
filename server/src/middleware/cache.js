import redisClient, { getRedisStatus } from '../config/redis.js';

/**
 * Cache Middleware
 * Caches successful JSON responses in Redis. Falls back to DB query if Redis is offline.
 * 
 * @param {string} keyPrefix - Namespace for the cache (e.g. 'donations')
 * @param {number} ttlSeconds - Time-To-Live in seconds
 */
export const cacheMiddleware = (keyPrefix, ttlSeconds = 60) => {
  return async (req, res, next) => {
    // Graceful fallback if Redis is offline
    if (!getRedisStatus()) {
      return next();
    }

    // Identify user context so users don't see each other's private caches
    const userScope = req.auth?.userId || 'public';
    // Generate clean unique key based on URL and query params
    const cacheKey = `replate:cache:${keyPrefix}:${userScope}:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        // Cache hit! Return immediately
        const parsed = JSON.parse(cachedData);
        // Add headers for cache insight
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', `${ttlSeconds}s`);
        return res.status(200).json(parsed);
      }
    } catch (err) {
      console.warn(`⚠️ Redis read failed for key "${cacheKey}" (degrading to DB):`, err.message);
      // Fallback: proceed to DB query
      return next();
    }

    // Intercept res.json to capture response payload
    const originalJson = res.json;
    res.json = function (body) {
      // Restore original res.json function immediately to avoid recursion
      res.json = originalJson;

      // Only cache successful status codes
      if (res.statusCode === 200 && getRedisStatus()) {
        try {
          redisClient.set(cacheKey, JSON.stringify(body), {
            EX: ttlSeconds
          }).catch((setErr) => {
            console.warn(`⚠️ Redis set failed for key "${cacheKey}":`, setErr.message);
          });
        } catch (serErr) {
          console.warn('⚠️ Failed to serialize response for caching:', serErr.message);
        }
      }

      res.setHeader('X-Cache', 'MISS');
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Invalidate Cache Pattern
 * Production-safe cache deletion using SCAN instead of KEYS to prevent blocking.
 * 
 * @param {string} pattern - Wildcard pattern (e.g. 'donations:*' or 'analytics:*')
 */
export const invalidateCachePattern = async (pattern) => {
  if (!getRedisStatus()) {
    return;
  }

  const fullPattern = `replate:cache:${pattern}`;
  try {
    let cursor = 0;
    let deletedCount = 0;
    
    console.log(`🧹 Scanning for keys matching: ${fullPattern}`);
    
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: fullPattern,
        COUNT: 100
      });
      
      cursor = reply.cursor;
      const keys = reply.keys;
      
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
        deletedCount += keys.length;
      }
    } while (cursor !== 0);

    if (deletedCount > 0) {
      console.log(`✨ Successfully invalidated ${deletedCount} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    console.warn(`⚠️ Redis cache invalidation error for pattern "${pattern}":`, err.message);
  }
};
