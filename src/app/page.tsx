import { START_MEETING_URL } from "@/shared/server_constants";
import { loadUserInfo } from "./loadUserInfo";
import GoogleLoginButton from "./GoogleLoginButton";

export default async function Page() {
  const userInfo = await loadUserInfo();

  return (
    <>
      <div className="max-w-screen-xl text-center">
        <h1 className="text-5xl font-bold">
          Take Control of Your Time. End Meetings on Schedule.
        </h1>
        <p className="py-6">
          Say goodbye to meetings that drag on and on. With our solution, you
          can set a firm end time for your Google Meet sessions, and we'll make
          sure the meeting wraps up when it’s supposed to.
        </p>
        {!userInfo.authenticated && (
          <>
            <GoogleLoginButton />
          </>
        )}
        {userInfo.authenticated && userInfo.missingScopes.length > 0 && (
          <>
            {userInfo.missingScopes.length > 0 && (
              <p>
                The following scopes are missing, but required:
                <ul>
                  {userInfo.missingScopes.map((scope) => (
                    <li>{scope}</li>
                  ))}
                </ul>
              </p>
            )}
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
      </div>
    </>
  );
}
