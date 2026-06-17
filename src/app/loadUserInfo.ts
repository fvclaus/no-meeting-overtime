import { getMissingScopes } from "@/shared/server_constants";
import { AuthenticatedUserInfo, UnauthenticatedUserInfo } from "../types";
import { getSession, setSession } from "@/app/session-store";
import { updateUserInfo } from "@/app/api/updateUserInfo";
import { Logger } from "@/log";

const logger = new Logger("loadUserInfo");

export async function loadUserInfo(): Promise<
  | (AuthenticatedUserInfo & {
      missingScopes: string[];
    })
  | UnauthenticatedUserInfo
> {
  const sessionData = await getSession();

  if (
    sessionData === undefined ||
    !sessionData.hasAcceptedPrivacyPolicy ||
    "state" in sessionData
  ) {
    return {
      authenticated: false,
      hasAcceptedPrivacyPolicy: false,
    };
  }

  try {
    const newUserInfo = await updateUserInfo(sessionData.credentials);
    const newSessionData = {
      ...sessionData,
      ...newUserInfo,
    };
    await setSession(newSessionData);

    const missingScopes = getMissingScopes(newSessionData.credentials.scope);
    return {
      authenticated: true,
      hasAcceptedPrivacyPolicy: true,
      name: newSessionData.name,
      picture: newSessionData.picture,
      scopes: newSessionData.credentials.scope,
      id: newSessionData.userId,
      missingScopes,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      if (error.message === "invalid_grant" || error.status === 401) {
        await setSession({ hasAcceptedPrivacyPolicy: false });
        logger.debug("Tokens expired or revoked", {
          userId: sessionData.userId,
        });
        return { authenticated: false, hasAcceptedPrivacyPolicy: false };
      }
    }
    logger.error(error, { userId: sessionData.userId });
    return { authenticated: false, hasAcceptedPrivacyPolicy: false };
  }
}
