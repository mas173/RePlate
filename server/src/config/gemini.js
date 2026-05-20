import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model for text-based analysis
const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Model for multimodal (image + text) analysis
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export { genAI, textModel, visionModel };
