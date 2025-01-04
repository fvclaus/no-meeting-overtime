import { AuthenticatedUserInfo, UnauthenticatedUserInfo } from "@/types";
import { getSession, setSession } from "@/app/session-store";
import { NextRequest, NextResponse } from "next/server";
import { updateUserInfo } from "../updateUserInfo";

export async function GET(req: NextRequest): Promise<Response> {
  console.log("Loading user info");

  const sessionData = await getSession();

  if (sessionData === undefined || !sessionData.hasAcceptedPrivacyPolicy) {
    return NextResponse.json({
      authenticated: false,
      hasAcceptedPrivacyPolicy: false,
    } as UnauthenticatedUserInfo);
  }

  if ("state" in sessionData) {
    // TODO error
    throw new Error("Shouldn't be here");
  }

  // TODO Return from session, if 'expired' is not expired.

  try {
    const newUserInfo = await updateUserInfo(sessionData.credentials);

    const newSessionData = {
      ...sessionData,
      ...newUserInfo,
    };

    await setSession(newSessionData);

    const userInfo: AuthenticatedUserInfo = {
      authenticated: true,
      hasAcceptedPrivacyPolicy: true,
      name: newSessionData.name,
      picture: newSessionData.picture,
      scopes: newSessionData.credentials.scope,
      id: newSessionData.userId,
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    const headers = new Headers();
    headers.set("Content-Type", "text/plain");
    if (
      error instanceof Error &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      if (error.message === "invalid_grant" || error.status === 401) {
        // TODO Reset to new sessions
        await setSession({
          hasAcceptedPrivacyPolicy: false,
        });
        return new NextResponse("Tokens expired or revoked", {
          status: error.status,
          headers,
        });
      }
    }
    console.log(error);
    return new NextResponse("Unknown error", {
      status: 500,
      headers,
    });
  }
}
