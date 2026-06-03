import React from 'react';

export default function SpeechVisualizer() {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-2 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full border border-emerald-500/20">
      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mr-1 animate-pulse uppercase tracking-wider">
        Listening
      </span>
      <div className="flex items-end gap-0.5 h-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-emerald-500 rounded-full"
            style={{
              height: '100%',
              animation: `waveform 1.2s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
