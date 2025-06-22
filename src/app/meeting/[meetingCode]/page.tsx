import { cookies } from "next/headers";
import { JoinMeeting, MeetingData } from "./_components/join-meeting";
import { SITE_BASE } from "@/shared/server_constants";

export default async function Page({
  params,
}: {
  params: Promise<{ meetingCode: string }>;
}) {
  const { meetingCode } = await params,
    res = await fetch(`${SITE_BASE}/api/meeting/${meetingCode}`, {
      headers: { Cookie: (await cookies()).toString() },
    });

  let meeting: MeetingData | null = null;

  if (res.ok) {
    const data = (await res.json()) as {
      scheduledEndTime: string;
      uri: string;
    };
    meeting = {
      ...data,
      code: meetingCode,
    };
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
