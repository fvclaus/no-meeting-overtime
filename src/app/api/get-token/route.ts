import { Credentials, getSession, setSession } from "@/app/session-store";
import {
  START_MEETING_URL,
  createOauth2Client,
  db,
} from "@/shared/server_constants";
import { NextRequest, NextResponse } from "next/server";
import { updateUserInfo } from "../updateUserInfo";
import { Logger } from "@/log";

const logger = new Logger("get-token");

export async function GET(req: NextRequest) {
  const errorParam = req.nextUrl.searchParams.get("error");
  if (errorParam) {
    // An error response e.g. error=access_denied
    // TODO Make this visible to the user better
    return new NextResponse(errorParam, { status: 500 });
  }

  const session = await getSession();

  if (session === undefined) {
    logger.error("Expected to find session, but didn't");
    return new NextResponse("Could not find session", { status: 400 });
  }

  if (!("state" in session) || typeof session.state === "undefined") {
    logger.error("Could not find state in session", { session });
    return new NextResponse("Could not find state in session", { status: 400 });
  }

  const state = req.nextUrl.searchParams.get("state");

  if (state !== session.state) {
    const errorMsg = `Stored state ${session.state} does not match received state ${state}`;
    logger.error(errorMsg, { session });
    return new NextResponse(errorMsg, { status: 400 });
  }

  // Get access and refresh tokens (if access_type is offline)
  // TODO Type check
  const oauth2Client = createOauth2Client(),
    code = req.nextUrl.searchParams.get("code");
  if (code === null) {
    logger.error("No code transmitted");
    return new NextResponse("No code transmitted", { status: 400 });
  }
  const credentials = (await oauth2Client.getToken(code)).tokens as Credentials;

  // TODO Missing access token?
  const userInfoResponse = await oauth2Client.getTokenInfo(
      credentials.access_token,
    ),
    // TODO Validate refresh token?
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    doc = await db.collection("user").doc(userInfoResponse.sub!).get();

  const data = {} as any;
  if (credentials.refresh_token) {
    data.refresh_token = credentials.refresh_token;
  }
  await doc.ref.set(data, { merge: true });

  // TODO Need to get refresh_token from data if existing user.
  oauth2Client.setCredentials(credentials);

  try {
    const userInfo = await updateUserInfo(credentials);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = userInfoResponse.sub!;
    await setSession({
      // TODO Observation google-apis have horrible typing
      userId,
      hasAcceptedPrivacyPolicy: true,
      ...userInfo,
    });
    logger.info(`User ${userId} authenticated successfully`, { userId });
  } catch (error) {
    logger.error(error, { additional: credentials });
    throw new Error(
      "This shouldn't happen. Token should be valid at this point.",
    );
  }

  return NextResponse.redirect(START_MEETING_URL);
}
