import { loadUserInfo } from "./loadUserInfo";
import HangUpLanding from "./_landing/HangUpLanding";
import GoogleAdsPageViewTracker from "./GoogleAdsPageViewTracker";
import { GOOGLE_ADS_CONVERSION_LABEL, GOOGLE_ADS_ID } from "@/shared/constants";

export default async function Page() {
  const userInfo = await loadUserInfo();

  return (
    <>
      <HangUpLanding userInfo={userInfo} />
      <GoogleAdsPageViewTracker
        googleAdsId={GOOGLE_ADS_ID}
        conversionLabel={GOOGLE_ADS_CONVERSION_LABEL}
      />
    </>
  );
}
