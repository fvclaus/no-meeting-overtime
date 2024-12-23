import { cookies } from "next/headers";
import { JoinMeeting, MeetingData } from "./_components/join-meeting";
import { SITE_BASE } from "@/shared/server_constants";

export default async function Page({
  params,
}: {
  params: Promise<{ meetingCode: string }>;
}) {
  const meetingCode = (await params).meetingCode;

  const res = await fetch(`${SITE_BASE}/api/meeting/${meetingCode}`, {
    headers: { Cookie: cookies().toString() },
  });

  let meeting: MeetingData | undefined = undefined;

  if (res.ok) {
    const data = await res.json();
    meeting = {
      ...data,
      code: meetingCode,
    };
  }

  if (meeting == null) {
    return (
      <div className="flex flex-col w-full max-w-screen-sm">
        <div role="alert" className="alert alert-error w-full">
          <span>Could not find meeting</span>
        </div>
      </div>
    );
  } else {
    return <JoinMeeting meeting={meeting}></JoinMeeting>;
  }
}
