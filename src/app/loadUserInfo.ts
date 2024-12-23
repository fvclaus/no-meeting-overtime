import { SITE_BASE, getMissingScopes } from "@/shared/server_constants";
import { cookies } from "next/headers";
import { UserInfo } from "../types";

export const loadUserInfo: () => Promise<
  UserInfo & {
    missingScopes: string[];
    authenticatedWithRequiredScopes: boolean;
  }
> = async () => {
  const userInfoRequest = await fetch(`${SITE_BASE}/api/userinfo`, {
      headers: { Cookie: cookies().toString() },
    }),
    userInfo = await userInfoRequest.json(),
    missingScopes =
      userInfo.scope !== undefined ? getMissingScopes(userInfo.scope) : [];
  return {
    ...userInfo,
    missingScopes,
    authenticatedWithRequiredScopes:
      userInfo.authenticated && missingScopes.length === 0,
  };
};
