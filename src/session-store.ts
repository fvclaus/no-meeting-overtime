import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from 'cookie';

type SessionId = string;

function getSessionId(req: NextApiRequest): SessionId | undefined {
    return req.cookies["session-id"];
}

function setSessionId(res: NextApiResponse, sessionId: SessionId): void {
  res.setHeader('Set-Cookie', serialize('session-id', sessionId, { path: '/' }))
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


export function get(req: NextApiRequest, key: string) {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      return null;
    }
    return kv.hget(`session-${sessionId}`, key);
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