import React, { useState, useEffect } from 'react';
import { Droplet, Heart, Activity, ShieldCheck } from 'lucide-react';

export const BrandPreloader = ({ onFinish, duration = 1800 }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Increment progress bar smoothly over the duration
    const intervalTime = 25;
    const step = (100 / (duration / intervalTime));

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Start fade out slightly before unmounting
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(0, duration - 400));

    // Fully remove component when complete
    const finishTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-sm w-full px-6 space-y-8 text-center">
        
        {/* Animated BloodBridge Emblem */}
        <div className="relative flex items-center justify-center">
          {/* Multiple expanding ripple rings */}
          <div
            className="absolute rounded-full bg-red-500/15 animate-blood-ripple w-36 h-36"
            style={{ animationDuration: '2.4s' }}
          />
          <div
            className="absolute rounded-full bg-rose-500/25 animate-ping w-28 h-28"
            style={{ animationDuration: '2s' }}
          />

          {/* Central Logo Box */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 animate-heartbeat border border-white/20">
            <Droplet className="w-12 h-12 fill-white text-white drop-shadow-md" />
            <Heart className="w-5 h-5 text-white fill-white absolute bottom-3.5 right-3.5 animate-pulse" />
          </div>
        </div>

        {/* Brand Name & Typography */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Blood
            </span>
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-red-500">
              Bridge
            </span>
          </div>

          <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.25em] text-slate-400 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Emergency Transfusion Network</span>
          </p>
        </div>

        {/* ECG Lifeline Trace Animation */}
        <div className="w-48 h-6 flex items-center justify-center relative overflow-hidden text-red-500">
          <svg className="w-full h-full" viewBox="0 0 140 24" fill="none">
            <path
              d="M0 12h35l5-9 7 18 7-14 5 8 4-3h40"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Smooth Progress Indicator */}
        <div className="w-full space-y-2.5">
          <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-500 rounded-full transition-all duration-75 ease-out shadow-lg shadow-red-500/50"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-red-500 animate-pulse" />
              <span>Initializing live donor network...</span>
            </span>
            <span className="font-mono text-slate-300 font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
