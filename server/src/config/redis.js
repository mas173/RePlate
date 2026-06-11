import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
  url: REDIS_URL,
  // Automatically attempt reconnect on disconnects
  socket: {
    reconnectStrategy: (retries) => {
      // Try reconnecting every 5 seconds, up to 5 times, then back off
      if (retries > 5) {
        console.warn('⚠️ Redis connection attempts exhausted. Proceeding with DB fallback.');
        return new Error('Redis connection failed permanently');
      }
      console.log(`🔄 Reconnecting to Redis (Attempt ${retries})...`);
      return 5000;
    }
  }
});

let isConnected = false;

redisClient.on('error', (err) => {
  console.warn('⚠️ Redis Client Error:', err.message || err);
  isConnected = false;
});

redisClient.on('connect', () => {
  console.log('✅ Redis Client connecting...');
});

redisClient.on('ready', () => {
  console.log('🚀 Redis Client is ready and connected.');
  isConnected = true;
});

redisClient.on('end', () => {
  console.log('🛑 Redis connection closed.');
  isConnected = false;
});

// Getter for connection status
export const getRedisStatus = () => isConnected;

export default redisClient;
