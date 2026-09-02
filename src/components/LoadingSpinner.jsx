import React from 'react';
import { Droplet, Heart, Activity } from 'lucide-react';

export const LoadingSpinner = ({ 
  text = "Connecting life-saving network...", 
  fullScreen = false, 
  size = "md" 
}) => {
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      dropIcon: "w-4 h-4",
      pulseIcon: "w-3 h-3",
      ripple: "w-12 h-12",
      showEcg: false
    },
    md: {
      container: "w-14 h-14",
      dropIcon: "w-7 h-7",
      pulseIcon: "w-4 h-4",
      ripple: "w-20 h-20",
      showEcg: true
    },
    lg: {
      container: "w-20 h-20",
      dropIcon: "w-10 h-10",
      pulseIcon: "w-6 h-6",
      ripple: "w-32 h-32",
      showEcg: true
    }
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-5 select-none">
      {/* Blood Droplet & Heartbeat Animation Hub */}
      <div className="relative flex items-center justify-center">
        {/* Outer expanding blood ripples */}
        <div className={`absolute rounded-full bg-red-500/20 animate-blood-ripple ${cfg.ripple}`} />
        <div className={`absolute rounded-full bg-rose-500/30 animate-ping ${cfg.ripple}`} style={{ animationDuration: '2.5s' }} />

        {/* Central Blood Droplet Shield */}
        <div className={`relative flex items-center justify-center rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-xl shadow-red-600/35 animate-heartbeat ${cfg.container}`}>
          <div className="relative flex items-center justify-center">
            <Droplet className={`fill-white/90 text-white ${cfg.dropIcon}`} />
            <Heart className={`absolute fill-red-600 text-red-600 animate-pulse ${cfg.pulseIcon}`} />
          </div>
        </div>
      </div>

      {/* Lifeline ECG Trace */}
      {cfg.showEcg && (
        <div className="w-32 h-6 flex items-center justify-center relative overflow-hidden">
          <svg className="w-full h-full text-red-500" viewBox="0 0 120 24" fill="none">
            <path
              d="M0 12h25l5-8 7 16 6-12 5 7 4-3h40"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* Status Text & Brand Tag */}
      {text && (
        <div className="text-center space-y-1">
          <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>{text}</span>
          </p>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            BloodBridge Network
          </p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-300">
        <div className="bg-white/95 rounded-3xl border border-white/80 shadow-2xl p-4 max-w-xs mx-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

