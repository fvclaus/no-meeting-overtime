"use client";

import { useEffect} from "react";
import { CookieValue } from "vanilla-cookieconsent";
import { CONSENT_CATEGORY_ADVERTISEMENT, CONSENT_SERVICE_AD_USER_DATA } from "@/shared/constants";

interface GoogleAdsPageViewTrackerProps {
  googleAdsId: string;
  conversionLabel: string;
}

const GoogleAdsPageViewTracker: React.FC<GoogleAdsPageViewTrackerProps> = ({
  googleAdsId,
  conversionLabel,
}) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {

      let recordedConversion = false;

      const recordConversion = ({detail: {cookie}}: {detail: {cookie: CookieValue}}) => {
          if (cookie.services[CONSENT_CATEGORY_ADVERTISEMENT].includes(CONSENT_SERVICE_AD_USER_DATA) && !recordedConversion) {
            window.gtag("event", "conversion", {
              send_to: `${googleAdsId}/${conversionLabel}`,
              value: 0.005,
              currency: "EUR",
            });
            recordedConversion = true;
          }
      }

      (window.addEventListener as any)('cc:onConsent', recordConversion);
      (window.addEventListener as any)('cc:onChange', recordConversion);
    }
  }, []);

  return null;
};

export default GoogleAdsPageViewTracker;
