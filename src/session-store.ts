import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from 'cookie';
import { createOauth2Client } from "./shared/server_constants";
import { Credentials } from "google-auth-library";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";


type SessionId = string;

function getSessionId(req: NextApiRequest | ReadonlyRequestCookies): SessionId | undefined {
    return 'get' in req? req.get('session-id')?.value : req.cookies["session-id"]
}

function setSessionId(res: NextApiResponse, sessionId: SessionId): void {
  res.setHeader('Set-Cookie', serialize('session-id', sessionId, { path: '/', httpOnly: true, secure: true, sameSite: "none" }))
}

function getSessionIdAndCreateIfMissing(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    const newSessionId = crypto.randomUUID();
    setSessionId(res, newSessionId);

    return newSessionId;
  }

  return sessionId;
}


export function get(req: NextApiRequest | ReadonlyRequestCookies, key: string) {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return null;
    }
    return kv.hget(`session-${sessionId}`, key);
  }

export function deleteKey(req: NextApiRequest, key: string) {
    const session = getSessionId(req);
    kv.del(key);
}
  
//   export function getAll(namespace: string = "") {
//     const sessionId = getSessionId();
//     if (!sessionId) {
//       return null;
//     }
//     return kv.hgetall(`session-${namespace}-${sessionId}`);
//   }
  
  export function set(req: NextApiRequest, res: NextApiResponse, key: string, value: string) {
    const sessionId = getSessionIdAndCreateIfMissing(req, res);
    return kv.hset(`session-${sessionId}`, { [key]: value });
  }

  export async function getCredentials(req: NextApiRequest | ReadonlyRequestCookies) {
    const tokensFromStore = await get(req, 'tokens');

    if (tokensFromStore == null || tokensFromStore === undefined) {
        console.log('Has no tokens in session');
        return undefined;
    }

    let tokens = (typeof tokensFromStore === 'string'? JSON.parse(tokensFromStore) : tokensFromStore) as Credentials

    const oauth2Client = createOauth2Client();
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }