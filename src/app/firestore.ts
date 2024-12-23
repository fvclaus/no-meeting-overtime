import { db } from "@/shared/server_constants";
import { Meeting } from "@/types";
import { RouteParams } from "./api/meeting/[meetingCode]/route";

// Don't need to unit test this. One E2E Test should be enough
export async function findMeeting(
  params: RouteParams,
): Promise<(Meeting & { code: string }) | undefined> {
  const { meetingCode } = await params;
  const meetingDocs = await db.collection("meeting").doc(meetingCode).get();

  const meeting = meetingDocs.data() as Meeting;
  return {
    ...meeting,
    code: meetingCode,
  };
}

export async function findUser(userId: string) {
  return await db.collection("user").doc(userId).get();
}
export async function saveMeeting(meetingCode: string, meeting: Meeting) {
  await db.collection("meeting").doc(meetingCode).set(meeting);
}
