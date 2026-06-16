import { analyzeFreshness } from './src/services/ai.service.js';
import dotenv from 'dotenv';
dotenv.config();

// Create a simple 1x1 white JPEG image buffer in Node
const mockImageBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const buffer = Buffer.from(mockImageBase64, 'base64');

async function testFreshness() {
  console.log('Testing analyzeFreshness service with mock buffer...');
  try {
    const result = await analyzeFreshness(buffer, {
      name: 'Fresh Salad',
      category: 'cooked_meals',
      storageCondition: 'refrigerated',
      quantity: '2 servings',
    });
    console.log('Result:', result);
  } catch (err) {
    console.error('Error in analyzeFreshness:', err.message, err.stack);
  }
}

testFreshness();
