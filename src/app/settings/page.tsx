import { loadUserInfo } from "../loadUserInfo";
import { redirect } from "next/navigation";

import { Settings } from "./components/settings";

// TODO Duplication
export default async function Page() {
  const userInfo = await loadUserInfo();

  if (!userInfo.authenticated || userInfo.missingScopes.length > 0) {
    redirect("/");
  }

  return <Settings />;
}
