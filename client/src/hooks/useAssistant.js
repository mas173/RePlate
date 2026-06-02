import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '@/hooks/useAppAuth';
import { assistantAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export function useAssistant() {
  const { getAuthToken, user, isSignedIn } = useAppAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.firstName || 'there'}! I am your RePlate AI Assistant. You can speak to me in any regional language to list a donation, view your analytics, check recent donations, get help, or navigate pages. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const currentAudioRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const silenceStartRef = useRef(null);
  const analyserRef = useRef(null);

  // Stop any playing audio when modal closes
  useEffect(() => {
    if (!isOpen && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, [isOpen]);

  // Clean up recording animation and audio context on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        cancelAnimationFrame(silenceTimerRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  // Play base64 audio response from server
  const playAudioResponse = (base64Audio) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.play().catch((err) => console.warn('[useAssistant] Audio autoplay failed:', err));
    } catch (err) {
      console.error('[useAssistant] Audio playback error:', err);
    }
  };

  // Start microphone recording with Silence Auto-Cut (VAD)
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine best mimetype supported
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all track nodes
        stream.getTracks().forEach((track) => track.stop());

        // Create the audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: options.mimeType || 'audio/webm',
        });

        if (audioBlob.size > 1000) {
          await sendVoicePayload(audioBlob);
        } else {
          toast.error('No audio captured. Please try speaking again.');
        }
      };

      // Set up Audio Analyser for Silence Detection (Auto-Cut)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkSilence = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Silence threshold: average level < 10 is considered silent
        const SILENCE_THRESHOLD = 8; 
        const SILENCE_DURATION = 3000; // 3 seconds of silence to auto-cut

        if (average < SILENCE_THRESHOLD) {
          if (!silenceStartRef.current) {
            silenceStartRef.current = Date.now();
          } else if (Date.now() - silenceStartRef.current > SILENCE_DURATION) {
            console.log('[useAssistant] Auto-cutting recording due to silence.');
            stopRecording();
            return;
          }
        } else {
          // User is speaking, reset silence start
          silenceStartRef.current = null;
        }

        // Loop the check if recording is still active
        silenceTimerRef.current = requestAnimationFrame(checkSilence);
      };

      silenceStartRef.current = null;
      mediaRecorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);
      
      // Delay silence checking slightly to bypass initial mic click sound
      setTimeout(() => {
        silenceTimerRef.current = requestAnimationFrame(checkSilence);
      }, 500);

    } catch (err) {
      console.error('[useAssistant] Mic access error:', err);
      toast.error('Could not access microphone. Please check system permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (silenceTimerRef.current) {
      cancelAnimationFrame(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Helper to format conversation history for Gemini context window
  const getHistoryForPayload = () => {
    return messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
  };

  // Send audio file payload to voice endpoint
  const sendVoicePayload = async (audioBlob) => {
    setIsProcessing(true);
    const tempUserMsgId = Date.now();

    // Show temporary typing bubble
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: '🎙️ Processing voice message...',
        id: tempUserMsgId,
        timestamp: new Date(),
      },
    ]);

    try {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice_input.webm');
      formData.append('conversationHistory', JSON.stringify(getHistoryForPayload()));

      const data = await assistantAPI.sendVoice(token, formData);

      // Replace processing message with actual transcribed user input
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempUserMsgId
            ? { ...msg, content: data.transcript || '🎙️ (Audio message)' }
            : msg
        )
      );

      // Handle server assistant response
      handleAssistantResponse(data);
    } catch (err) {
      console.error('[useAssistant] Voice submit error:', err);
      toast.error('AI assistant processing failed. Please try again.');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsgId));
    } finally {
      setIsProcessing(false);
    }
  };

  // Send text message payload
  const sendTextMessage = async (text) => {
    if (!text || text.trim().length === 0) return;

    setIsProcessing(true);
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const token = await getAuthToken();
      const payload = {
        message: text,
        conversationHistory: getHistoryForPayload(),
      };

      const data = await assistantAPI.sendText(token, payload);
      handleAssistantResponse(data);
    } catch (err) {
      console.error('[useAssistant] Text submit error:', err);
      toast.error('AI assistant processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Response Actions (navigation, autofill, data mapping)
  const handleAssistantResponse = (data) => {
    const extracted = data.extractedData ? { ...data.extractedData } : null;
    if (extracted && extracted.foodName && !extracted.name) {
      extracted.name = extracted.foodName;
    }

    const newMsg = {
      role: 'assistant',
      content: data.response || 'I am ready to help you.',
      timestamp: new Date(),
      intent: data.intent,
      extractedData: extracted,
      contextData: data.contextData,
      navigationPath: data.navigationPath,
      audioResponse: data.audioResponse,
    };

    // If we got extracted data, merge/update it
    if (extracted) {
      setExtractedData((prev) => {
        const merged = { ...(prev || {}), ...extracted };
        return Object.keys(merged).length > 0 ? merged : null;
      });
    }

    setMessages((prev) => [...prev, newMsg]);

    // Autoplay response speech if voice response exists
    if (data.audioResponse) {
      playAudioResponse(data.audioResponse);
    }

    // Trigger auto-routing or form auto-filling if applicable
    if (data.navigationPath) {
      setTimeout(() => {
        navigate(data.navigationPath);
        setIsOpen(false);
        toast.success(`Opening ${data.navigationPath.split('/').pop() || 'page'}...`);
      }, 2000);
    } else if (data.intent === 'create_donation' && extracted) {
      // Store in session storage so the food upload form picks it up
      const currentStored = JSON.parse(sessionStorage.getItem('assistant-donation-data') || '{}');
      const merged = { ...currentStored, ...extracted };
      sessionStorage.setItem('assistant-donation-data', JSON.stringify(merged));
      
      setTimeout(() => {
        navigate('/donate');
        setIsOpen(false);
        toast.success('Opening donation form with pre-filled details...');
      }, 2000);
    }
  };

  // Function to commit auto-filled data and navigate to the upload form
  const fillDonationForm = () => {
    if (extractedData) {
      const extracted = { ...extractedData };
      if (extracted.foodName && !extracted.name) {
        extracted.name = extracted.foodName;
      }
      sessionStorage.setItem('assistant-donation-data', JSON.stringify(extracted));
    }
    navigate('/donate');
    setIsOpen(false);
    toast.success('Form details auto-populated by AI!');
  };

  // Clear conversation state
  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi ${user?.firstName || 'there'}! I am RePlate AI. How can I help you with your dashboard, stats, or donations today?`,
        timestamp: new Date(),
      },
    ]);
    setExtractedData(null);
    sessionStorage.removeItem('assistant-donation-data');
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
  };

  return {
    isOpen,
    toggleOpen,
    messages,
    isRecording,
    isProcessing,
    extractedData,
    startRecording,
    stopRecording,
    sendTextMessage,
    fillDonationForm,
    clearConversation,
    playAudioResponse,
    isSignedIn,
  };
}
