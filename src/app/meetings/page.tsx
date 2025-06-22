import { loadUserInfo } from "../loadUserInfo";
import { redirect } from "next/navigation";

import { SITE_BASE } from "@/shared/server_constants";

import { cookies } from "next/headers";
import { Meeting } from "@/types";
import ViewMeetings from "./components/view-meetings";

// TODO Duplication
export default async function Page() {
  const userInfo = await loadUserInfo();

  if (!userInfo.authenticated || userInfo.missingScopes.length > 0) {
    redirect("/");
  }

  const meetingsRequest = await fetch(`${SITE_BASE}/api/meetings`, {
    headers: { Cookie: (await cookies()).toString() },
  });

  // TODO Error Handling

  const meetings = (await meetingsRequest.json()) as (Meeting & {
    meetingCode: string;
  })[];

  return <ViewMeetings meetings={meetings} />;
}
