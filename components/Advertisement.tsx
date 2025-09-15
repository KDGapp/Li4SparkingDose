import React, { useEffect, useState, useRef } from 'react';

export const Advertisement: React.FC = () => {
  const [adFailed, setAdFailed] = useState(false);
  const intervalRef = useRef<number | null>(null);
  // FIX: Moved containerId outside of useEffect to be accessible in the component's scope.
  const containerId = 'container-09b1a7bf3170ff8ffcb989e5bed6a1bc';

  useEffect(() => {
    const scriptId = 'ad-script-09b1a7';
    const refreshInterval = 60000; // Refresh every 60 seconds

    const loadAd = () => {
      // Clean up previous script and container content before reloading
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      
      const adContainer = document.getElementById(containerId);
      if (adContainer) {
        adContainer.innerHTML = '';
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://niecesprivilegelimelight.com/09b1a7bf3170ff8ffcb989e5bed6a1bc/invoke.js';
      script.crossOrigin = 'anonymous';

      script.onerror = () => {
        console.warn('Advertisement script failed to load. This is often caused by ad blockers and can be safely ignored.');
        setAdFailed(true);
        // If it fails, stop trying to refresh.
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
      
      document.body.appendChild(script);
    };
    
    // Initial ad load
    loadAd();

    // Set up the refresh timer
    intervalRef.current = window.setInterval(loadAd, refreshInterval);
    
    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const adScript = document.getElementById(scriptId);
      if (adScript) {
        adScript.remove();
      }
    };
  }, []); // The empty dependency array ensures this effect runs only on mount and unmount.

  // If the ad script fails to load, don't render the container.
  if (adFailed) {
    return null;
  }

  return (
    <div className="my-10 max-w-4xl mx-auto p-1 bg-black/50 backdrop-blur-sm border-2 border-[#39ff14]/50 rounded-lg shadow-lg shadow-[#39ff14]/10 relative transition-all duration-300 hover:border-[#39ff14] animate-fade-in flex justify-center items-center">
      {/* This div is the container that the ad script will target to inject the ad */}
      <div id={containerId}></div>
    </div>
  );
};