import { getMissingScopes, SITE_BASE } from "@/shared/server_constants";
import { cookies } from "next/headers";
import { UserInfo } from "../types";

export async function loadUserInfo(): Promise<
  UserInfo & {
    missingScopes: string[];
    authenticatedWithRequiredScopes: boolean;
  }
> {
  const userInfoRequest = await fetch(`${SITE_BASE}/api/userinfo`, {
    headers: { Cookie: cookies().toString() },
  });
  const userInfo = await userInfoRequest.json();
  const missingScopes =
    userInfo.scope !== undefined ? getMissingScopes(userInfo.scope) : [];
  return {
    ...userInfo,
    missingScopes,
    authenticatedWithRequiredScopes:
      userInfo.authenticated && missingScopes.length === 0,
  };
}
