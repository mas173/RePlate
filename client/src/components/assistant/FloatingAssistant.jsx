import React from 'react';
import { Sparkles, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '@/hooks/useAssistant';
import VoiceAssistantModal from './VoiceAssistantModal';
import { useAppAuth } from '@/hooks/useAppAuth';

export default function FloatingAssistant() {
  const navigate = useNavigate();
  const { user, isSignedIn } = useAppAuth();
  
  const {
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
  } = useAssistant();

  // Hide assistant floating widget if not logged in
  if (!isSignedIn) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] bg-slate-800 rounded-full flex flex-col items-end gap-2">
        {/* Floating Sparkle/Mic Button */}
        <button
          onClick={toggleOpen}
          aria-label="Toggle RePlate AI Voice Assistant"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none transition-all duration-300 relative group pointer-events-auto"
          style={{
            animation: isOpen ? 'none' : 'assistant-pulse 2s infinite',
          }}
        >
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-[8px] font-extrabold text-white px-1.5 py-0.5 rounded-full border border-white dark:border-slate-800 shadow-sm uppercase tracking-wider scale-90">
            AI
          </span>
          {isRecording ? (
            <span className="w-5 h-5 rounded-full bg-red-500 animate-ping absolute" />
          ) : null}
          
          {isOpen ? (
            <Sparkles className="w-6 h-6 animate-pulse" />
          ) : (
            <Mic className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Slide up Voice Assistant chat modal */}
      <VoiceAssistantModal
        isOpen={isOpen}
        onClose={toggleOpen}
        messages={messages}
        isRecording={isRecording}
        isProcessing={isProcessing}
        extractedData={extractedData}
        startRecording={startRecording}
        stopRecording={stopRecording}
        sendTextMessage={sendTextMessage}
        fillDonationForm={fillDonationForm}
        clearConversation={clearConversation}
        playAudioResponse={playAudioResponse}
        onNavigate={(path) => {
          navigate(path);
          toggleOpen();
        }}
      />
    </>
  );
}
