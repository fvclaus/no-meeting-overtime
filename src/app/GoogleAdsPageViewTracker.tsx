"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Define gtag function type for TypeScript if not already globally defined
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: { [key: string]: unknown },
    ) => void;
  }
}

interface GoogleAdsPageViewTrackerProps {
  googleAdsId: string;
  conversionLabel: string;
}

const GoogleAdsPageViewTracker: React.FC<GoogleAdsPageViewTrackerProps> = ({
  googleAdsId,
  conversionLabel,
}) => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: `${googleAdsId}/${conversionLabel}`,
        value: 0.005,
        currency: "EUR",
      });
    }
  }, [pathname, googleAdsId, conversionLabel]);

  return null;
};

export default GoogleAdsPageViewTracker;
