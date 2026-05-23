import { verifyToken } from '@clerk/express';
import dotenv from 'dotenv';
dotenv.config();

console.log('verifyToken type:', typeof verifyToken);
try {
  // Try calling verifyToken with invalid/empty to see what options it expects
  await verifyToken('', {
    secretKey: process.env.CLERK_SECRET_KEY,
  });
} catch (e) {
  console.log('verifyToken test error:', e.message);
}
