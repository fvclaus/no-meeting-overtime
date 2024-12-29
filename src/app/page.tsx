import { START_MEETING_URL } from "@/shared/server_constants";
import { loadUserInfo } from "./loadUserInfo";
import GoogleLoginButton from "./GoogleLoginButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FAQSection from "./FAQSection";

export default async function Page() {
  const userInfo = await loadUserInfo();

  return (
    <>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="w-full max-w-4xl text-center px-4 mb-8 mt-10">
          <div className="flex justify-center space-x-6 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center transition-colors hover:bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center transition-colors hover:bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">
            Take Control of Your Time.
            <span className="block text-blue-600">
              End Meetings on Schedule
            </span>
          </h1>
        </div>

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
                  <GoogleLoginButton />
                </>
              )}
              {userInfo.authenticated && userInfo.missingScopes.length > 0 && (
                <>
                  <Alert
                    variant="destructive"
                    className="max-w-xl mx-auto mb-5 mt-5"
                  >
                    <AlertCircle className="h-8 w-8" />
                    <AlertTitle className="text-lg font-semibold">
                      Missing permission
                    </AlertTitle>
                    <AlertDescription>
                      This app is missing the permission to create new Google
                      Meet meetings. This permissions is required for the
                      functionality of this app. Please click on the Sign in
                      with Google Button and grant this permission.
                    </AlertDescription>
                  </Alert>

                  <GoogleLoginButton />
                </>
              )}
              {userInfo.authenticated &&
                userInfo.missingScopes.length === 0 && (
                  <>
                    <form action={START_MEETING_URL} method="get">
                      <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg transition-all hover:shadow-xl"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  </>
                )}
            </div>
            <div className="md:w-1/2 max-w-sm w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-white opacity-80 blur-md rounded-lg"></div>
                <form className="relative bg-white p-8 rounded-lg shadow-lg">
                  <div className="mb-4">
                    <label
                      htmlFor="end-time"
                      className="block text-sm font-medium text-blue-700 mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      When Should the Meeting End?
                    </label>
                    <input
                      type="time"
                      id="end-time"
                      disabled
                      className="bg-white flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled
                  >
                    Create Meeting
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-4xl text-center px-4 mt-16">
          <FAQSection />
        </div>
      </div>
    </>
  );
}
