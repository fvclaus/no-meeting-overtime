import { loadUserInfo } from "../loadUserInfo";
import { redirect } from "next/navigation";
import ViewMeetings from "./components/view-meetings";
import { getSession, isAuthorizedSession } from "@/app/session-store";
import { findMeetings } from "@/app/firestore";

// TODO Duplication
export default async function Page() {
  const userInfo = await loadUserInfo();

  if (!userInfo.authenticated || userInfo.missingScopes.length > 0) {
    redirect("/");
  }

  const sessionData = await getSession();
  if (!isAuthorizedSession(sessionData)) {
    redirect("/");
  }

  const meetings = await findMeetings(sessionData.userId);

  return <ViewMeetings meetings={meetings} />;
}
