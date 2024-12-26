import {
  REQUIRED_SCOPES,
  SITE_BASE,
  getMissingScopes,
} from "@/shared/server_constants";
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
  if (userInfoRequest.status !== 200) {
    return {
      authenticated: false,
      missingScopes: REQUIRED_SCOPES,
      authenticatedWithRequiredScopes: false,
    };
  }
  const userInfo = (await userInfoRequest.json()) as UserInfo;
  const missingScopes =
    userInfo.scope !== undefined ? getMissingScopes(userInfo.scope) : [];
  return {
    ...userInfo,
    missingScopes,
    authenticatedWithRequiredScopes:
      userInfo.authenticated && missingScopes.length === 0,
  };
}
