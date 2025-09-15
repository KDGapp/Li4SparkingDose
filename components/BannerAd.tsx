import React, { useEffect, useRef, useState } from 'react';

export const BannerAd: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adFailed, setAdFailed] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const refreshInterval = 60000; // Refresh every 60 seconds

    const loadAd = () => {
      const container = adContainerRef.current;
      if (!container) return;

      // Clear previous ad content
      container.innerHTML = '';

      const scriptOptions = document.createElement('script');
      scriptOptions.type = 'text/javascript';
      scriptOptions.innerHTML = `
        atOptions = {
          'key' : '7252e1f3df1001afa199bfeedfcfa00b',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      const scriptInvoke = document.createElement('script');
      scriptInvoke.type = 'text/javascript';
      scriptInvoke.src = '//niecesprivilegelimelight.com/7252e1f3df1001afa199bfeedfcfa00b/invoke.js';
      scriptInvoke.async = true;
      scriptInvoke.onerror = () => {
        console.warn('Banner ad script failed to load, likely due to an ad blocker.');
        setAdFailed(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };

      container.appendChild(scriptOptions);
      container.appendChild(scriptInvoke);
    };

    // Initial load
    loadAd();

    // Set up refresh timer
    intervalRef.current = window.setInterval(loadAd, refreshInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount.

  if (adFailed) {
    return null;
  }

  return (
    <div className="my-4 flex justify-center items-center w-full overflow-x-auto" style={{minHeight: '90px'}}>
      <div ref={adContainerRef}>
        {/* Ad will be injected here by the script */}
      </div>
    </div>
  );
};
