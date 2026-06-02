import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Send, Trash2, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechVisualizer from './SpeechVisualizer';
import AssistantMessage from './AssistantMessage';
import { cn } from '@/utils/helpers';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
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
  onNavigate,
}) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll chat window when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isProcessing]);

  if (!isOpen) return null;

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendTextMessage(inputText.trim());
    setInputText('');
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end sm:p-6 pointer-events-none">
        {/* Full screen backdrop click on mobile to close modal */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 dark:bg-slate-950/40 backdrop-blur-sm pointer-events-auto block sm:hidden"
        />

        {/* Floating Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full sm:w-[420px] h-[85vh] sm:h-[600px] bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col pointer-events-auto overflow-hidden mr-0 sm:mr-4 mb-0 sm:mb-20"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-primary-600 via-primary-550 to-teal-500 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">RePlate AI Voice Assistant</h3>
                <span className="text-[10px] text-teal-100 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full animate-ping" />
                  Online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearConversation}
                title="Clear Conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto assistant-messages-scroll p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
            {messages.map((msg, index) => (
              <AssistantMessage
                key={index}
                message={msg}
                onPlayAudio={playAudioResponse}
                onFillForm={fillDonationForm}
                onNavigate={onNavigate}
              />
            ))}

            {/* AI Processing / Typing Bubble */}
            {isProcessing && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-teal-500 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Extracted Data Status Banner */}
          {extractedData && Object.keys(extractedData).length > 0 && (
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border-t border-indigo-150 dark:border-indigo-900/30 flex items-center justify-between shrink-0 text-xs">
              <span className="text-indigo-650 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                Pending Donation Draft Ready
              </span>
              <button
                onClick={fillDonationForm}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline underline-offset-2"
              >
                Auto-Fill Form
              </button>
            </div>
          )}

          {/* Input Panel Controls */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-150 dark:border-slate-700/60 shrink-0 space-y-3 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            
            {/* Visualizer Row */}
            {isRecording && (
              <div className="flex justify-center py-1">
                <SpeechVisualizer />
              </div>
            )}

            <form onSubmit={handleSendText} className="flex items-center gap-2">
              {/* Mic trigger button */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border focus:outline-none shrink-0 relative overflow-hidden',
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse scale-105'
                    : 'bg-primary-50 hover:bg-primary-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 text-primary-650 dark:text-primary-400 border-primary-200/50 dark:border-slate-700'
                )}
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Text Input fallback */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isRecording}
                placeholder={isRecording ? 'Listening...' : 'Type or speak your request...'}
                className="flex-1 text-xs py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary-550 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/25 disabled:opacity-50 text-slate-800 dark:text-slate-100"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isRecording || isProcessing}
                className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 transition-colors flex items-center justify-center shrink-0 shadow-sm disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
