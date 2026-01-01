"use client";

import { useEffect, useRef } from "react";

interface InFeedAdProps {
  className?: string;
}

/**
 * InFeed Ad Component for Google AdSense
 * Displays a fluid in-feed ad unit on mobile devices only
 */
export default function InFeedAd({ className = "" }: InFeedAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    // Only push the ad once when component mounts
    if (!isAdPushed.current && adRef.current) {
      try {
        // Check if adsbygoogle is available
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isAdPushed.current = true;
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, []);

  return (
    <div className={`w-full md:hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-fs-2o-7d-33+1cg"
        data-ad-client="ca-pub-9387992992867908"
        data-ad-slot="5283873346"
      />
    </div>
  );
}
