import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import assistantService from '../services/assistant.service.js';

const router = Router();

// Memory storage for temporary audio file buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max audio size
  },
});

/**
 * POST /api/assistant/voice
 * Processes voice audio input, transcribes, handles intent, fetches data, synthesizes TTS response
 */
router.post('/voice', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Parse conversation history from body (sent as JSON string due to multipart form-data)
    let conversationHistory = [];
    if (req.body.conversationHistory) {
      try {
        conversationHistory = JSON.parse(req.body.conversationHistory);
      } catch (err) {
        console.warn('[Assistant Route] Failed to parse conversationHistory:', err.message);
      }
    }

    // 1. Transcribe audio via Sarvam STT
    console.log(`[Assistant Route] Transcribing audio file: ${req.file.originalname} (${req.file.size} bytes)`);
    const { transcript, languageCode } = await assistantService.transcribeAudio(
      req.file.buffer,
      req.file.originalname
    );

    if (!transcript || transcript.trim().length === 0) {
      // Speech couldn't be recognized
      const fallbackMsg = "I couldn't hear or understand that clearly. Please try speaking again.";
      const audioResponse = await assistantService.synthesizeSpeech(fallbackMsg, languageCode);
      return res.status(200).json({
        transcript: '',
        detectedLanguage: languageCode,
        intent: 'greeting',
        response: fallbackMsg,
        extractedData: null,
        contextData: null,
        navigationPath: null,
        audioResponse,
        isComplete: false,
      });
    }

    console.log(`[Assistant Route] Transcript: "${transcript}" (Language: ${languageCode})`);

    // 2. Classify intent and generate response via Gemini
    const userData = {
      role: req.auth.role,
      name: req.auth.firstName || 'User',
    };
    
    let geminiResponse = await assistantService.generateResponse(
      conversationHistory,
      transcript,
      userData
    );

    // 3. Fetch context data from Supabase if needed
    let contextData = null;
    if (['check_donations', 'view_analytics', 'check_claims', 'check_notifications'].includes(geminiResponse.intent)) {
      console.log(`[Assistant Route] Fetching DB context data for intent: ${geminiResponse.intent}`);
      contextData = await assistantService.fetchIntentData(
        geminiResponse.intent,
        req.auth.userId,
        req.auth.role
      );

      // 4. Enrich Gemini's text response with real database stats
      if (contextData) {
        geminiResponse = await assistantService.enrichResponseWithData(geminiResponse, contextData);
      }
    }

    // 5. Synthesize final response to speech via Sarvam TTS
    console.log(`[Assistant Route] Synthesizing speech for response: "${geminiResponse.message?.substring(0, 50)}..."`);
    const audioResponse = await assistantService.synthesizeSpeech(
      geminiResponse.message,
      languageCode
    );

    // 6. Return response
    return res.status(200).json({
      transcript,
      detectedLanguage: languageCode,
      intent: geminiResponse.intent,
      response: geminiResponse.message,
      extractedData: geminiResponse.extractedData,
      contextData,
      navigationPath: geminiResponse.navigationPath,
      audioResponse,
      isComplete: geminiResponse.isComplete || false,
    });
  } catch (error) {
    console.error('[Assistant Route] Voice error:', error);
    next(error);
  }
});

/**
 * POST /api/assistant/text
 * Processes text input fallback, handles intent, fetches data, returns structured response
 */
router.post('/text', requireAuth, async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const userData = {
      role: req.auth.role,
      name: req.auth.firstName || 'User',
    };

    // 1. Classify intent and generate response via Gemini
    console.log(`[Assistant Route] Processing text message: "${message}"`);
    let geminiResponse = await assistantService.generateResponse(
      conversationHistory || [],
      message,
      userData
    );

    // 2. Fetch context data from Supabase if needed
    let contextData = null;
    if (['check_donations', 'view_analytics', 'check_claims', 'check_notifications'].includes(geminiResponse.intent)) {
      console.log(`[Assistant Route] Fetching DB context data for intent: ${geminiResponse.intent}`);
      contextData = await assistantService.fetchIntentData(
        geminiResponse.intent,
        req.auth.userId,
        req.auth.role
      );

      // 3. Enrich Gemini's response with database stats
      if (contextData) {
        geminiResponse = await assistantService.enrichResponseWithData(geminiResponse, contextData);
      }
    }

    // 4. Synthesize speech as fallback TTS (using default English speaker 'arvind')
    const audioResponse = await assistantService.synthesizeSpeech(
      geminiResponse.message,
      'en-IN'
    );

    return res.status(200).json({
      transcript: message,
      detectedLanguage: 'en-IN',
      intent: geminiResponse.intent,
      response: geminiResponse.message,
      extractedData: geminiResponse.extractedData,
      contextData,
      navigationPath: geminiResponse.navigationPath,
      audioResponse,
      isComplete: geminiResponse.isComplete || false,
    });
  } catch (error) {
    console.error('[Assistant Route] Text error:', error);
    next(error);
  }
});

export default router;
