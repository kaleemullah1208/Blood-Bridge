import React from 'react';
import { Heart } from 'lucide-react';

export const LoadingSpinner = ({ text = "Loading data...", fullScreen = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Pulsing blood drop indicator */}
        <div className={`rounded-full bg-red-100 animate-ping absolute ${sizeClasses[size]}`} />
        <div className={`relative flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg ${sizeClasses[size]}`}>
          <Heart className="w-1/2 h-1/2 fill-current animate-pulse" />
        </div>
      </div>
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
