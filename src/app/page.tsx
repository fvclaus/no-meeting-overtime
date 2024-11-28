import { REDIRECT_TO_AUTHORIZATION_API_URL, START_MEETING_URL } from "@/shared/server_constants";
import { loadUserInfo } from "./loadUserInfo";
import Link from "next/link";


export default async function Page() {

    const userInfo = await loadUserInfo();

    return <>
            <div className="max-w-screen-xl text-center">
              <h1 className="text-5xl font-bold">Take Control of Your Time. End Meetings on Schedule.</h1>
              <p className="py-6">
                Say goodbye to meetings that drag on and on. With our solution, you can set a firm end time for your Google Meet sessions, and we'll make sure the meeting wraps up when it’s supposed to.
              </p>
              {
                (!userInfo.authenticatedWithRequiredScopes) &&
                    <>
                        {userInfo.missingScopes.length > 0 &&
                         <p>The following scopes are missing, but required: 
                          <ul>
                          {userInfo.missingScopes.map(scope => <li>{scope}</li>)}
                          </ul>
                         </p>
                        }
                        <a className="bg-gray-200 hover:bg-gray-300 rounded-lg px-6 py-3"
                          href={REDIRECT_TO_AUTHORIZATION_API_URL}>
                          Sign in with Google to get started
                        </a>
                    </>
              }
              {
                userInfo.authenticatedWithRequiredScopes && <Link className="btn bg-gray-200 hover:bg-gray-300 rounded-lg px-6 py-3" href={START_MEETING_URL}>Get Started</Link>
              }
            </div>
    </>;
  }