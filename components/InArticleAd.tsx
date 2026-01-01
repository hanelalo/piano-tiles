"use client";

import { useEffect, useRef } from "react";

interface InArticleAdProps {
  className?: string;
}

/**
 * In-Article Ad Component for Google AdSense
 * Displays a fluid in-article ad unit that blends with content
 * Shown on all devices (mobile, tablet, desktop)
 */
export default function InArticleAd({ className = "" }: InArticleAdProps) {
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
        console.error("AdSense in-article ad error:", err);
      }
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-9387992992867908"
        data-ad-slot="5375372682"
      />
    </div>
  );
}
