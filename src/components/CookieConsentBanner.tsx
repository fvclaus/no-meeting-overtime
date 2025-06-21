"use client";
import dynamic from "next/dynamic";

import { useEffect } from "react";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";
import getConfig from "./CookieConsentConfig";

const ResetCookieConsent = () => {
  CookieConsent.reset(true);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  CookieConsent.run(getConfig());
};

const CookieConsentBanner = () => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    CookieConsent.run(getConfig());
  }, []);

  return (
    <div>
      <button type="button" onClick={CookieConsent.showPreferences}>
        Manage cookie preferences
      </button>
      <button type="button" onClick={ResetCookieConsent}>
        Reset cookie consent
      </button>
    </div>
  );
};

export default CookieConsentBanner;
