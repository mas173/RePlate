/**
 * Assistant Service — AI Voice Assistant Orchestration
 *
 * Responsibilities:
 * - Speech-to-Text via Sarvam AI (Saaras v3)
 * - Intent classification + response generation via Gemini
 * - Real-time data fetching from Supabase for contextual answers
 * - Text-to-Speech via Sarvam AI (Bulbul v3)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '../config/supabase.js';

// ─── Configuration ────────────────────────────────────────────

const SARVAM_API_KEY = process.env.SARVAM_API;
const SARVAM_BASE = 'https://api.sarvam.ai';

// Separate Gemini instance for the assistant to avoid quota conflicts
const assistantGenAI = new GoogleGenerativeAI(
  process.env.GEMINI_ASSISTANT_KEY || process.env.GEMINI_API_KEY
);
const assistantModel = assistantGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// TTS speaker mapping by language
const SPEAKERS = {
  'hi-IN': 'meera',
  'en-IN': 'aditya',
  'ta-IN': 'meera',
  'te-IN': 'meera',
  'kn-IN': 'meera',
  'bn-IN': 'meera',
  'mr-IN': 'meera',
  'gu-IN': 'meera',
  'ml-IN': 'meera',
  'pa-IN': 'meera',
  'od-IN': 'meera',
};

// ─── System Prompt ────────────────────────────────────────────

const SYSTEM_PROMPT = `You are "RePlate AI Assistant", a friendly multilingual voice assistant for the RePlate food donation platform.

YOUR CAPABILITIES:
1. HELP users create food donations by extracting structured data from natural speech
2. ANSWER questions about their donations, claims, analytics, and notifications
3. NAVIGATE users to different pages on the platform
4. PROVIDE help and guidance about using the platform

INTENT CLASSIFICATION — classify every user message into exactly ONE intent:
- "create_donation" — user wants to donate food (extract fields)
- "check_donations" — user asks about their donation history or status
- "view_analytics" — user asks about their stats, impact, meals saved
- "check_claims" — user asks about claims on their donations or their NGO claims
- "check_notifications" — user asks about alerts or notifications
- "navigate" — user wants to go to a specific page
- "help" — user asks how to use the platform or general questions
- "follow_up" — user modifies previously extracted donation data
- "greeting" — user says hello or thanks

NAVIGATION PATHS:
- Dashboard: /dashboard
- Donate Food: /donate
- My Donations: /donations
- Available Food (NGO): /available
- My Claims (NGO): /claims
- Analytics: /analytics
- Notifications: /notifications
- Settings: /settings

FOR "create_donation" INTENT, extract these fields when mentioned:
- name (string)
- quantity (number)
- unit (string: meals, kg, items, packs, litres, servings)
- category (string: cooked_meals, raw_produce, bakery, dairy, beverages, packaged, fruits, grains, meat, other)
- expiryDate (string: YYYY-MM-DD format, calculate from relative times like "till 9 PM today")
- expiryTime (string: HH:MM 24h format)
- storageCondition (string: room_temp, refrigerated, frozen, heated)
- address (string)
- city (string)
- state (string)
- pincode (string)

IMPORTANT RULES:
- NEVER suggest or perform delete, cancel, or destructive operations
- Be conversational and warm, not robotic
- If information is incomplete for a donation, ask follow-up questions
- When context data is provided, summarize it naturally
- Keep responses concise (2-3 sentences max) for voice readability
- For dates, today is ${new Date().toISOString().split('T')[0]}

RESPONSE FORMAT — respond ONLY with valid JSON (no markdown fences):
{
  "intent": "one of the intents above",
  "message": "your natural language response to the user",
  "extractedData": { ... } or null,
  "navigationPath": "/path" or null,
  "isComplete": true/false (for create_donation: true when all required fields are filled),
  "followUpQuestion": "question to ask if more info needed" or null
}`;

// ─── Sarvam STT ───────────────────────────────────────────────

/**
 * Transcribe audio using Sarvam Speech-to-Text-Translate API
 * @param {Buffer} audioBuffer - Audio file buffer
 * @param {string} filename - Original filename
 * @returns {{ transcript: string, languageCode: string }}
 */
export async function transcribeAudio(audioBuffer, filename = 'audio.webm') {
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: 'audio/webm' });
  formData.append('file', blob, filename);
  formData.append('model', 'saaras:v3');

  const response = await fetch(`${SARVAM_BASE}/speech-to-text-translate`, {
    method: 'POST',
    headers: {
      'api-subscription-key': SARVAM_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Sarvam STT error (${response.status}):`, errText);
    throw new Error(`Speech-to-text failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    transcript: data.transcript || '',
    languageCode: data.language_code || 'en-IN',
  };
}

// ─── Gemini Intent & Response ─────────────────────────────────

/**
 * Generate assistant response with intent classification via Gemini
 * @param {Array} conversationHistory - Previous messages
 * @param {string} userMessage - Current user message (English transcript)
 * @param {Object} userData - User profile info (role, name)
 * @returns {Object} Parsed response with intent, message, extractedData, etc.
 */
export async function generateResponse(conversationHistory, userMessage, userData = {}) {
  // Build conversation context
  const historyContext = conversationHistory
    .slice(-10) // Keep last 10 messages for context window
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `${SYSTEM_PROMPT}

USER INFO:
- Role: ${userData.role || 'donor'}
- Name: ${userData.name || 'User'}

CONVERSATION HISTORY:
${historyContext || '(new conversation)'}

CURRENT USER MESSAGE: "${userMessage}"

Respond with JSON only:`;

  try {
    const result = await assistantModel.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`[Assistant] Intent: ${parsed.intent} | Message: ${parsed.message?.substring(0, 80)}...`);
      return parsed;
    }

    // Fallback if JSON parsing fails
    return {
      intent: 'help',
      message: text.replace(/```json|```/g, '').trim(),
      extractedData: null,
      navigationPath: null,
      isComplete: false,
      followUpQuestion: null,
    };
  } catch (error) {
    console.error('[Assistant] Gemini error:', error.message);
    return {
      intent: 'help',
      message: 'I apologize, I had trouble understanding that. Could you please rephrase?',
      extractedData: null,
      navigationPath: null,
      isComplete: false,
      followUpQuestion: null,
    };
  }
}

// ─── Data Fetching by Intent ──────────────────────────────────

/**
 * Fetch real-time data from Supabase based on classified intent
 * @param {string} intent - Classified intent
 * @param {string} clerkId - Clerk user ID
 * @param {string} role - User role
 * @returns {Object|null} Fetched data or null
 */
export async function fetchIntentData(intent, clerkId, role) {
  try {
    // Get user profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, first_name, last_name')
      .eq('clerk_id', clerkId)
      .single();

    if (profileErr || !profile) {
      console.error('[Assistant] Profile fetch error:', profileErr?.message);
      return null;
    }

    switch (intent) {
      case 'check_donations': {
        let query = supabaseAdmin
          .from('donations')
          .select('id, food_name, quantity, unit, status, category, created_at, pickup_city')
          .order('created_at', { ascending: false })
          .limit(5);

        if (role === 'donor') {
          query = query.eq('donor_id', profile.id);
        } else if (role === 'ngo') {
          query = query.eq('status', 'available');
        }

        const { data, error } = await query;
        if (error) throw error;
        return { donations: data || [] };
      }

      case 'view_analytics': {
        const { data, error } = await supabaseAdmin.rpc('get_user_impact', {
          p_user_id: profile.id,
        });
        if (error) throw error;
        return {
          analytics: {
            totalDonations: data?.total_donations || 0,
            activeDonations: data?.active_donations || 0,
            mealsSaved: data?.meals_saved || 0,
            wasteReduced: data?.weight_saved || 0,
            co2Reduced: data?.co2_reduced || 0,
            claimsReceived: data?.claims_received || 0,
          },
        };
      }

      case 'check_claims': {
        const { data, error } = await supabaseAdmin
          .from('claims')
          .select('id, status, created_at, donations(food_name, quantity, unit, pickup_city)')
          .eq('claimer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) throw error;
        return { claims: data || [] };
      }

      case 'check_notifications': {
        const { data, error } = await supabaseAdmin
          .from('notifications')
          .select('id, title, message, type, is_read, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) throw error;

        const unreadCount = (data || []).filter((n) => !n.is_read).length;
        return { notifications: data || [], unreadCount };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error(`[Assistant] Data fetch error (${intent}):`, error.message);
    return null;
  }
}

/**
 * Enrich Gemini's response with fetched context data
 * @param {Object} geminiResponse - Initial Gemini response
 * @param {Object} contextData - Data fetched from Supabase
 * @returns {Object} Enriched response
 */
export async function enrichResponseWithData(geminiResponse, contextData) {
  if (!contextData) return geminiResponse;

  // Build a data summary and ask Gemini to produce a natural response
  const dataSummary = JSON.stringify(contextData, null, 2);

  const prompt = `You are the RePlate AI Assistant. The user asked about their data and you classified the intent as "${geminiResponse.intent}".

Here is the real data from the database:
${dataSummary}

Write a SHORT, friendly, conversational summary of this data (2-3 sentences max). Be specific with numbers and names. Do not use markdown formatting — this will be spoken aloud.

Respond with ONLY the summary text, nothing else.`;

  try {
    const result = await assistantModel.generateContent(prompt);
    const enrichedMessage = result.response.text().trim();

    return {
      ...geminiResponse,
      message: enrichedMessage,
      contextData,
    };
  } catch (error) {
    console.error('[Assistant] Enrichment error:', error.message);
    return {
      ...geminiResponse,
      contextData,
    };
  }
}

// ─── Sarvam TTS ───────────────────────────────────────────────

/**
 * Synthesize speech using Sarvam Text-to-Speech API
 * @param {string} text - Text to synthesize
 * @param {string} langCode - Language code (e.g., 'en-IN', 'hi-IN')
 * @returns {string} Base64-encoded audio
 */
export async function synthesizeSpeech(text, langCode = 'en-IN') {
  // Truncate to Bulbul limit
  const truncated = text.substring(0, 2400);
  const speaker = SPEAKERS[langCode] || 'meera';

  try {
    const response = await fetch(`${SARVAM_BASE}/text-to-speech`, {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [truncated],
        target_language_code: langCode === 'en-IN' ? 'en-IN' : langCode,
        speaker,
        model: 'bulbul:v3',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Sarvam TTS error (${response.status}):`, errText);
      return null;
    }

    const data = await response.json();
    return data.audios?.[0] || null;
  } catch (error) {
    console.error('[Assistant] TTS error:', error.message);
    return null;
  }
}

export default {
  transcribeAudio,
  generateResponse,
  fetchIntentData,
  enrichResponseWithData,
  synthesizeSpeech,
};
