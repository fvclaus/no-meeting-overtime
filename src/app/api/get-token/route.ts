import {
  deleteSessionKey,
  getSession,
  getSessionKey,
  setSession,
  setSessionKey,
} from "@/app/session-store";
import { START_MEETING_URL } from "@/shared/server_constants";
import { createOauth2Client, db } from "@/shared/server_constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const error = req.nextUrl.searchParams.get("error");
  if (error) {
    // An error response e.g. error=access_denied
    // TODO Log this better
    return new NextResponse(error, { status: 500 });
  }

  const session = await getSession();

  if (session == null) {
    return new NextResponse("Could not find session", { status: 400 });
  }

  const state = req.nextUrl.searchParams.get("state");

  if (state !== session.state) {
    //Check state value
    return new NextResponse(
      `Stored state ${session.state} does not match received state ${state}`,
      { status: 400 },
    );
  }

  await deleteSessionKey(req, "state");

  // Get access and refresh tokens (if access_type is offline)
  // TODO Type check
  const oauth2Client = createOauth2Client(),
    code = req.nextUrl.searchParams.get("code");
  if (code == null) {
    return new NextResponse("No code transmitted", { status: 400 });
  }
  const { tokens } = await oauth2Client.getToken(code);

  // TODO Missing access token?
  const userInfoResponse = await oauth2Client.getTokenInfo(
      tokens.access_token!,
    ),
    // TODO Validate refresh token?

    doc = await db.collection("user").doc(userInfoResponse.sub!).get();

  try {
    const data = {} as any;
    if (tokens.refresh_token) {
      data.refresh_token = tokens.refresh_token;
    }
    doc.ref.set(data, { merge: true });

    oauth2Client.setCredentials(tokens);
  } catch (error) {
    // TODO Error handling when refresh_token leer ist?
    console.log(error);
  }
  await setSession({
    tokens: tokens as any,
    userId: userInfoResponse.sub!,
  });
  return NextResponse.redirect(START_MEETING_URL);
}
