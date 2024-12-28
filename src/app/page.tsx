import { START_MEETING_URL } from "@/shared/server_constants";
import { loadUserInfo } from "./loadUserInfo";
import GoogleLoginButton from "./GoogleLoginButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default async function Page() {
  const userInfo = await loadUserInfo();

  return (
    <>
      <div className="max-w-screen-xl text-center">
        <h1 className="text-5xl font-bold">
          Take Control of Your Time. End Meetings on Schedule.
        </h1>
        <p className="py-6 text-lg">
          Avoid meetings that go overtime. This app allows you to set an end
          time for your Google Meet conferences, ensuring they end on time.
        </p>

        {!userInfo.authenticated && (
          <>
            <GoogleLoginButton />
          </>
        )}
        {userInfo.authenticated && userInfo.missingScopes.length > 0 && (
          <>
            <Alert variant="destructive" className="max-w-xl mx-auto mb-5 mt-5">
              <AlertCircle className="h-8 w-8" />
              <AlertTitle className="text-lg font-semibold">
                Missing permission
              </AlertTitle>
              <AlertDescription>
                This app is missing the permission to create new Google Meet
                conferences. This permissions is required for the functionality
                of this app. Please click on the Sign in with Google Button and
                grant this permission.
              </AlertDescription>
            </Alert>

            <GoogleLoginButton />
          </>
        )}
        {userInfo.authenticated && userInfo.missingScopes.length === 0 && (
          <>
            <form action={START_MEETING_URL} method="get">
              <button
                type="submit"
                className="btn bg-gray-200 hover:bg-gray-300 rounded-lg px-6 py-3"
              >
                Get started
              </button>
            </form>
          </>
        )}

        <Accordion type="single" collapsible className="max-w-xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger>How does it work?</AccordionTrigger>
            <AccordionContent>
              This app integrates with the Google Meet API to create and end
              conferences. When you start a meeting, this app sends a request to
              the Google Meet API to create a new conference. At the scheduled
              end time, another request is sent to the Google Meet API to end
              the meeting. The conference can only be ended, if it is active at
              that moment.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              Why can it not end conferences I created myself?
            </AccordionTrigger>
            <AccordionContent>
              The app can only end conferences that it created itself due to
              limitations in the Google Meet API. These ensures that apps in
              general cannot interfere with meetings created by other means.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
