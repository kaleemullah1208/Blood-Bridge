import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteLoadingIndicator — Displays an arterial blood-red progress bar at the top of the screen
 * and smoothly scrolls the window to the top on every route transition.
 */
export const RouteLoadingIndicator = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start top progress bar on route change
    setIsLoading(true);
    setProgress(30);

    // Scroll to top of the page on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 120);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 250);
    }, 280);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, location.search]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Glow shadow line */}
      <div 
        className="h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 shadow-md shadow-red-500/60 transition-all duration-200 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Leading bright blood pulse tip */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-2.5 bg-white/80 rounded-full blur-xs shadow-lg shadow-white" />
      </div>
    </div>
  );
};

export default RouteLoadingIndicator;
