import { clerkClient } from '@clerk/express';
import dotenv from 'dotenv';
dotenv.config();

console.log('clerkClient:', clerkClient);
try {
  // Try fetching a dummy user ID to see if the client works and uses process.env.CLERK_SECRET_KEY automatically
  await clerkClient.users.getUser('user_dummy');
} catch (e) {
  console.log('getUser test error:', e.message);
}
