import { cookies } from "next/headers";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from 'cookie';
import { createOauth2Client, db } from "./shared/server_constants";
import { Credentials, OAuth2Client } from "google-auth-library";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { FieldValue } from "@google-cloud/firestore";

type SessionId = string;

function getSessionId(req: NextApiRequest | ReadonlyRequestCookies): SessionId | undefined {
    return 'get' in req? req.get('session-id')?.value : req.cookies["session-id"]
}

function setSessionId(res: NextApiResponse, sessionId: SessionId): void {
  res.setHeader('Set-Cookie', serialize('session-id', sessionId, { path: '/', httpOnly: true, secure: true, sameSite: "none" }))
}

export interface SessionData {
  tokens?: Credentials
  state?: string;
  name?: string;
  picture?: string;
}

async function _set(sessionId: string, data: SessionData): Promise<void> {
  await db.collection("session").doc(sessionId).set(data, {merge : true});
}

async function getSessionIdAndCreateIfMissing(req: NextApiRequest, res: NextApiResponse): Promise<string> {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    const newSessionId = crypto.randomUUID();
    setSessionId(res, newSessionId);
    return newSessionId;
  }

  return sessionId;
}



export async function getSessionKey<T extends keyof SessionData>(req: NextApiRequest | ReadonlyRequestCookies, key: T): Promise<SessionData[T] | undefined> {
    const data = await getSession(req);
    if (!data) {
      return undefined;
    } else {
      return data[key];
    }
}

async function getSession(req: NextApiRequest | ReadonlyRequestCookies): Promise<SessionData | undefined> {
  const sessionId = getSessionId(req);
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

export async function getSessionOrThrow(req: NextApiRequest | ReadonlyRequestCookies): Promise<SessionData> {
  const data = await getSession(req);
  if (data === undefined) {
    throw new Error('User should not be here without session');
  }
  return data;
}

export async function deleteSessionKey<T extends keyof SessionData>(req: NextApiRequest | ReadonlyRequestCookies, key: T): Promise<void> {
    const sessionId = getSessionId(req);
    if (sessionId !== undefined) {
      await db.collection("session").doc(sessionId).update({
        [key]: FieldValue.delete()
      })
    }
}


  export async function setOrThrowSessionKey<T extends keyof SessionData>(req: NextApiRequest | ReadonlyRequestCookies,  key: T, value: NonNullable<SessionData[T]> ): Promise<void> {
    const sessionId = getSessionId(req);
    if (!sessionId) {
        throw new Error('User should not be here without session');
    }
    await _set(sessionId, {
      [key]: value
    });
  }

  export async function setSessionKey<T extends keyof SessionData>(req: NextApiRequest, res: NextApiResponse, key: T, value: NonNullable<SessionData[T]>): Promise<void> {
    const sessionId = await getSessionIdAndCreateIfMissing(req, res);
    await _set(sessionId, {
      [key]: value
    });
  }


  export async function getCredentials(req: NextApiRequest | ReadonlyRequestCookies) {
    const tokensFromStore = await getSessionKey(req, 'tokens');

    if (tokensFromStore == null || tokensFromStore === undefined) {
        console.log('Has no tokens in session');
        return undefined;
    }

    let tokens = (typeof tokensFromStore === 'string'? JSON.parse(tokensFromStore) : tokensFromStore) as Credentials

    const oauth2Client = createOauth2Client();
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }