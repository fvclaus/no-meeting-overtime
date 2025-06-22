import { loadUserInfo } from "./loadUserInfo";
import GoogleLoginButton from "./GoogleLoginButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, LucideMessageCircleQuestion } from "lucide-react";
import FAQSection from "./FAQSection";
import { Title } from "@/components/ui/title";
import Link from "./Link";
import {
  GOOGLE_ADS_CONVERSION_LABEL,
  GOOGLE_ADS_ID,
  START_MEETING_PATH,
} from "@/shared/constants";
import { YouTubeEmbed } from "@next/third-parties/google";
import GoogleAdsPageViewTracker from "./GoogleAdsPageViewTracker";

export default async function Page() {
  const userInfo = await loadUserInfo();

  return (
    <>
      <div className="flex flex-col items-center justify-center mb-10">
        <Title
          title={
            <>
              Take Control of Your Time
              <span className="block text-blue-600">
                End Meetings On Schedule
              </span>
            </>
          }
        />

        <div className="w-full bg-blue-50 py-16">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <p className="text-xl text-gray-600 mb-8">
                Avoid meetings that go overtime. This app allows you to set an
                end time for your Google Meet meetings, ensuring they end on
                time.
              </p>
              {!userInfo.authenticated && (
                <>
                  <GoogleLoginButton
                    hasAcceptedPrivacyPolicyInSession={
                      userInfo.hasAcceptedPrivacyPolicy
                    }
                  />
                </>
              )}
              {userInfo.authenticated && userInfo.missingScopes.length > 0 && (
                <>
                  <Alert>
                    <AlertTitle>Missing permission</AlertTitle>
                    <AlertDescription>
                      This app is missing the permission to create new Google
                      Meet meetings. This permissions is required for the
                      functionality of this app. Please click on the Sign in
                      with Google Button and grant this permission.
                    </AlertDescription>
                  </Alert>

                  <GoogleLoginButton
                    hasAcceptedPrivacyPolicyInSession={
                      userInfo.hasAcceptedPrivacyPolicy
                    }
                  />
                </>
              )}
              {userInfo.authenticated &&
                userInfo.missingScopes.length === 0 && (
                  <Link
                    href={START_MEETING_PATH}
                    role="button"
                    variant="button"
                  >
                    Get Started
                    <ArrowRight className="inline ml-2 h-5 w-5" />
                  </Link>
                )}
            </div>
            <div className="md:w-1/2 max-w-sm w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-white opacity-80 blur-md rounded-lg"></div>
                <div className="relative bg-white p-8 rounded-lg shadow-lg blur-[1px] pointer-events-none">
                  <div className="mb-4">
                    <span className="block text-sm font-medium text-blue-700 mb-1">
                      When should the meeting end?
                    </span>
                    <div
                      className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-400 flex items-center"
                      aria-label="End time display"
                      id="end-time-display"
                    >
                      12:00 PM
                    </div>
                  </div>
                  <div
                    className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-center font-medium border border-gray-300"
                    aria-label="Schedule Meeting button display"
                  >
                    Create Meeting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="container w-full max-w-4xl text-center my-8">
          <h2 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center text-gray-800">
            <LucideMessageCircleQuestion className="w-6 h-6 mr-2 text-blue-600" />
            See How It works
          </h2>

          <YouTubeEmbed videoid="If6fpgfMNls" style="margin: auto" />
        </section>
        <div className="w-full max-w-4xl text-center">
          <FAQSection />
        </div>
      </div>
      <GoogleAdsPageViewTracker
        googleAdsId={GOOGLE_ADS_ID}
        conversionLabel={GOOGLE_ADS_CONVERSION_LABEL}
      />
    </>
  );
}
