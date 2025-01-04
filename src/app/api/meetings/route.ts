import { findMeetings } from "@/app/firestore";
import { getSession, isAuthorizedSession } from "@/app/session-store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionData = await getSession();
  if (!isAuthorizedSession(sessionData)) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const meetings = await findMeetings(sessionData.userId);

  return NextResponse.json(meetings);
}
