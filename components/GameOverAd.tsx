"use client";

import { useEffect, useRef, useState } from "react";

interface GameOverAdProps {
  adSlot: string;
  className?: string;
}

/**
 * Game Over Ad Component - Reloads on every game over
 * Each time the game ends, this component re-mounts and loads a fresh ad
 * Auto-hides if ad fails to load or is blocked
 */
export default function GameOverAd({ adSlot, className = "" }: GameOverAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const adLoadedRef = useRef(false);

  useEffect(() => {
    // Reset loaded flag when component mounts
    adLoadedRef.current = false;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (adRef.current && !adLoadedRef.current) {
        try {
          // Initialize the ad
          const adsbygoogle = (window as any).adsbygoogle || [];
          adsbygoogle.push({});
          adLoadedRef.current = true;
        } catch (err) {
          console.error("GameOver ad error:", err);
          // Hide container on error
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        }
      }
    }, 100);

    // Check if ad loaded successfully after a short delay
    const checkAdLoaded = setTimeout(() => {
      if (adRef.current) {
        const status = adRef.current.getAttribute('data-adsbygoogle-status');
        const hasContent = adRef.current.innerHTML.trim().length > 0;
        
        // If ad failed to load or was blocked - hide container
        if (status !== 'done' || !hasContent) {
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
        }
      }
    }, 1000); // Check after 1 second

    return () => {
      clearTimeout(timer);
      clearTimeout(checkAdLoaded);
    };
  }, []); // Empty deps - runs once per mount (each game over)

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
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
