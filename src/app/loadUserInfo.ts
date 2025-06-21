import { SITE_BASE, getMissingScopes } from "@/shared/server_constants";
import { cookies } from "next/headers";
import {
  AuthenticatedUserInfo,
  UnauthenticatedUserInfo,
  UserInfo,
} from "../types";

export async function loadUserInfo(): Promise<
  | (AuthenticatedUserInfo & {
      missingScopes: string[];
    })
  | UnauthenticatedUserInfo
> {
  const userInfoRequest = await fetch(`${SITE_BASE}/api/userinfo`, {
    headers: { Cookie: (await cookies()).toString() },
  });
  if (userInfoRequest.status !== 200) {
    return {
      authenticated: false,
      hasAcceptedPrivacyPolicy: false,
    };
  }
  const userInfo = (await userInfoRequest.json()) as UserInfo;
  if (userInfo.authenticated) {
    const missingScopes = getMissingScopes(userInfo.scopes);
    return {
      ...userInfo,
      missingScopes,
    };
  }
  return userInfo;
}
