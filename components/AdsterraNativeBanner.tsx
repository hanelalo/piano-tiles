"use client";

import { useEffect, useRef } from "react";

interface AdsterraNativeBannerProps {
  className?: string;
}

/**
 * Adsterra Native Banner Ad Component
 * Place this component where you want the native banner to appear
 */
export default function AdsterraNativeBanner({ className = "" }: AdsterraNativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Prevent duplicate script loading
    if (scriptLoaded.current) return;
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="pl28926594.effectivegatecpm.com"]');
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    try {
      // Create and append the script
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = "https://pl28926594.effectivegatecpm.com/e8df8557f1f9ec4909a68cbe4e82cdef/invoke.js";
      
      script.onload = () => {
        scriptLoaded.current = true;
      };
      
      script.onerror = () => {
        console.error("Adsterra Native Banner failed to load");
      };
      
      document.head.appendChild(script);
    } catch (err) {
      console.error("Error loading Adsterra Native Banner:", err);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full flex justify-center items-center ${className}`}
    >
      <div id="container-e8df8557f1f9ec4909a68cbe4e82cdef" />
    </div>
  );
}
