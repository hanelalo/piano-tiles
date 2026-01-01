"use client";

import { useEffect, useRef, useState } from "react";

interface ResponsiveAdProps {
  /** AdSense ad slot ID */
  adSlot: string;
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

/**
 * Responsive Ad Component for Google AdSense
 * Automatically adapts to different screen sizes and devices
 * Reusable component that accepts different ad slot IDs
 * Hides container when ad fails to load or is blocked
 */
export default function ResponsiveAd({ 
  adSlot, 
  className = "",
  style = {}
}: ResponsiveAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    // Check if the ad element exists and hasn't been initialized yet
    if (adRef.current) {
      try {
        // Check if this specific ad has already been initialized
        const adElement = adRef.current;
        const isInitialized = adElement.getAttribute('data-adsbygoogle-status');
        
        if (!isInitialized) {
          // Initialize the ad
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
        }

        // Check if ad loaded successfully after a short delay
        const checkAdLoaded = setTimeout(() => {
          if (adRef.current) {
            const status = adRef.current.getAttribute('data-adsbygoogle-status');
            const hasContent = adRef.current.innerHTML.trim().length > 0;
            
            // If ad has status 'done' and has content, consider it loaded
            if (status === 'done' && hasContent) {
              setIsAdLoaded(true);
            } else {
              // Ad failed to load or was blocked - hide container
              setIsAdLoaded(false);
              if (containerRef.current) {
                containerRef.current.style.display = 'none';
              }
            }
          }
        }, 1000); // Check after 1 second

        return () => clearTimeout(checkAdLoaded);
      } catch (err) {
        // Silently handle initialization errors to prevent page crashes
        console.error("AdSense responsive ad error:", err);
        // Hide container on error
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
      }
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`} 
      style={{
        ...style,
        minHeight: 0, // Don't reserve space initially
        maxHeight: '100%', // Limit to container height
        overflow: 'hidden'
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9387992992867908"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
