import { cookies } from "next/headers";
import { createOauth2Client, db, SITE_BASE } from "../shared/server_constants";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { FieldValue } from "@google-cloud/firestore";
import { NextRequest } from "next/server";

type SessionId = string;

const SESSION_ID_NAME = "session-id";
async function getSessionId(): Promise<SessionId | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_ID_NAME)?.value;
}

async function setSessionId(sessionId: SessionId): Promise<void> {
  const cookieStore = await cookies();
  if (SITE_BASE.startsWith("https://")) {
    cookieStore.set(SESSION_ID_NAME, sessionId, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  } else {
    cookieStore.set(SESSION_ID_NAME, sessionId, { path: "/", httpOnly: true });
  }
}

export interface SessionData {
  tokens?: Record<string, string>;
  state?: string;
  userId?: string;
  name?: string;
  picture?: string;
}

async function _set(sessionId: string, data: SessionData): Promise<void> {
  await db.collection("session").doc(sessionId).set(data, { merge: true });
}

async function getSessionIdAndCreateIfMissing(): Promise<string> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    const newSessionId = crypto.randomUUID();
    await setSessionId(newSessionId);
    return newSessionId;
  }

  return sessionId;
}

export async function getSessionKey<T extends keyof SessionData>(
  key: T,
): Promise<SessionData[T] | undefined> {
  const data = await getSession();
  if (!data) {
    return undefined;
  } else {
    return data[key];
  }
}

export async function getSession(): Promise<SessionData | undefined> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return undefined;
  }
  const doc = await db.collection("session").doc(sessionId).get();
  const data = doc.data();
  if (!data) {
    return undefined;
  } else {
    return data;
  }
}

export async function getSessionOrThrow(
  req: ReadonlyRequestCookies | NextRequest,
): Promise<SessionData> {
  const data = await getSession();
  if (data === undefined) {
    throw new Error("User should not be here without session");
  }
  return data;
}

export async function deleteSessionKey<T extends keyof SessionData>(
  req: ReadonlyRequestCookies | NextRequest,
  key: T,
): Promise<void> {
  const sessionId = await getSessionId();
  if (sessionId !== undefined) {
    await db
      .collection("session")
      .doc(sessionId)
      .update({
        [key]: FieldValue.delete(),
      });
  }
}

export async function setOrThrowSessionKey<T extends keyof SessionData>(
  req: ReadonlyRequestCookies | NextRequest,
  key: T,
  value: NonNullable<SessionData[T]>,
): Promise<void> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    throw new Error("User should not be here without session");
  }
  await _set(sessionId, {
    [key]: value,
  });
}

export async function setSessionKey<T extends keyof SessionData>(
  key: T,
  value: NonNullable<SessionData[T]>,
): Promise<void> {
  const sessionId = await getSessionIdAndCreateIfMissing();
  await _set(sessionId, {
    [key]: value,
  });
}

export async function setSession(session: SessionData): Promise<void> {
  const sessionId = await getSessionIdAndCreateIfMissing();
  await _set(sessionId, session);
}

export async function deleteSession(): Promise<void> {
  const sessionId = await getSessionId();
  if (sessionId) {
    try {
      await db.collection("session").doc(sessionId).delete();
    } catch (e) {
      console.error(
        `Something went wrong when deleting session ${sessionId}: ${e}`,
      );
    }
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_ID_NAME);
  }
}

export async function getCredentials() {
  const credentials = await getSessionKey("tokens");

  if (credentials == null) {
    console.log("Has no tokens in session");
    return undefined;
  }

  const oauth2Client = createOauth2Client();
  oauth2Client.setCredentials(credentials);
  return oauth2Client;
}
