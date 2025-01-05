"use server";

import { db } from "@/shared/server_constants";
import { findMeetings } from "../firestore";
import { getSession, isAuthorizedSession } from "../session-store";

export async function deleteAccount() {
  const sessionData = await getSession();
  if (!isAuthorizedSession(sessionData)) {
    throw new Error("Unauthorized");
  }

  const meetings = await findMeetings(sessionData.userId);

  const batch = db.batch();
  meetings.forEach((meeting) => {
    batch.delete(db.doc(`meeting/${meeting.meetingCode}`));
  });
  batch.delete(db.doc(`user/${sessionData.userId}`));
  await batch.commit();
}
