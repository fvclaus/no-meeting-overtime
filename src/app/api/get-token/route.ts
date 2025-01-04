import { Credentials, getSession, setSession } from "@/app/session-store";
import {
  START_MEETING_URL,
  createOauth2Client,
  db,
} from "@/shared/server_constants";
import { NextRequest, NextResponse } from "next/server";
import { updateUserInfo } from "../updateUserInfo";

export async function GET(req: NextRequest) {
  const error = req.nextUrl.searchParams.get("error");
  if (error) {
    // An error response e.g. error=access_denied
    // TODO Log this better
    return new NextResponse(error, { status: 500 });
  }

  const session = await getSession();

  if (session === undefined) {
    return new NextResponse("Could not find session", { status: 400 });
  }

  if (!("state" in session) || typeof session.state === "undefined") {
    return new NextResponse("Could not find state in session", { status: 400 });
  }

  const state = req.nextUrl.searchParams.get("state");

  if (state !== session.state) {
    //Check state value
    return new NextResponse(
      `Stored state ${session.state} does not match received state ${state}`,
      { status: 400 },
    );
  }

  // Get access and refresh tokens (if access_type is offline)
  // TODO Type check
  const oauth2Client = createOauth2Client(),
    code = req.nextUrl.searchParams.get("code");
  if (code == null) {
    return new NextResponse("No code transmitted", { status: 400 });
  }
  const credentials = (await oauth2Client.getToken(code)).tokens as Credentials;

  // TODO Missing access token?
  const userInfoResponse = await oauth2Client.getTokenInfo(
      credentials.access_token,
    ),
    // TODO Validate refresh token?
    doc = await db.collection("user").doc(userInfoResponse.sub!).get();

  try {
    const data = {} as any;
    if (credentials.refresh_token) {
      data.refresh_token = credentials.refresh_token;
    }
    await doc.ref.set(data, { merge: true });

    // TODO Need to get refresh_token from data if existing user.
    oauth2Client.setCredentials(credentials);
  } catch (error) {
    // TODO Error handling when refresh_token leer ist?
    console.log(error);
  }

  try {
    const userInfo = await updateUserInfo(credentials);
    await setSession({
      userId: userInfoResponse.sub!,
      hasAcceptedPrivacyPolicy: true,
      ...userInfo,
    });
  } catch (error2) {
    console.log(error2);
    throw new Error(
      "This shouldn't happen. Token should be valid at this point.",
    );
  }

  return NextResponse.redirect(START_MEETING_URL);
}
