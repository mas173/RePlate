import { clerkClient } from '@clerk/express';

console.log('ClerkClient keys:', Object.keys(clerkClient));
if (clerkClient.users) {
  console.log('ClerkClient.users keys:', Object.keys(clerkClient.users));
}
console.log('verifyToken exists:', typeof clerkClient.verifyToken);
// check if verifyToken is imported separately
import * as clerkExpress from '@clerk/express';
console.log('Clerk express exports:', Object.keys(clerkExpress));
