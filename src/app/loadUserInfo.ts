import { getMissingScopes } from "@/shared/constants";
import { cookies } from "next/headers";
import { UserInfo } from "./start-meeting/_components/types";

export async function loadUserInfo(): Promise<UserInfo & {missingScopes: string[], authenticatedWithRequiredScopes: boolean }> {
  const userInfoRequest = await fetch('http://localhost:3000/api/userinfo', {
    headers: { Cookie: cookies().toString() },
  });
  const userInfo = await userInfoRequest.json();
  const missingScopes = userInfo.scope !== undefined? getMissingScopes(userInfo.scope) : [];
  return { ...userInfo,
    missingScopes,
    authenticatedWithRequiredScopes: userInfo.authenticated && missingScopes.length === 0
  }
}
