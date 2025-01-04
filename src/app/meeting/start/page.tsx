import { loadUserInfo } from "../../loadUserInfo";
import { redirect } from "next/navigation";
import CreateMeeting from "./_components/create-meeting";
/**
 * @see {@link https://developers.google.com/meet/add-ons/guides/overview#side-panel}
 */
export default async function Page() {
  const userInfo = await loadUserInfo();

  if (!userInfo.authenticated || userInfo.missingScopes.length > 0) {
    redirect("/");
  }

  return (
    <>
      <CreateMeeting />
    </>
  );
}
