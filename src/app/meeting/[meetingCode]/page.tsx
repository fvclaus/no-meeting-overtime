import { JoinMeeting, MeetingData } from "./_components/join-meeting";
import { getSession, isAuthorizedSession } from "@/app/session-store";
import { findMeeting } from "@/app/firestore";

export default async function Page({
  params,
}: {
  params: Promise<{ meetingCode: string }>;
}) {
  const { meetingCode } = await params;

  const sessionData = await getSession();

  let meeting: MeetingData | null = null;

  if (isAuthorizedSession(sessionData)) {
    const meetingData = await findMeeting(Promise.resolve({ meetingCode }));
    if (
      meetingData !== undefined &&
      meetingData.userId === sessionData.userId
    ) {
      meeting = {
        scheduledEndTime: meetingData.scheduledEndTime,
        uri: meetingData.uri,
        code: meetingCode,
      };
    }
  }

  if (meeting === null) {
    return (
      <div className="flex flex-col w-full max-w-screen-sm">
        {/* TODO Replace with alert component */}
        <div role="alert" className="alert alert-error w-full">
          <span>Could not find meeting</span>
        </div>
      </div>
    );
  }
  return <JoinMeeting meeting={meeting}></JoinMeeting>;
}
