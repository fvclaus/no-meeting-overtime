import { UserInfo } from "@/types";
import { deleteSessionKey, getCredentials, getSessionOrThrow, setOrThrowSessionKey } from "@/session-store";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const oauth2Client = await getCredentials(req);
  let userinfo: UserInfo = {
    authenticated: false
  }
  let errorMessage = null;
  if (oauth2Client !== undefined) {
    try {

      const sessionData = await getSessionOrThrow(req);
      if (typeof sessionData.name === 'string') {
        userinfo.name = sessionData.name;
      }
      if (typeof sessionData.picture === 'string') {
        userinfo.picture = sessionData.picture;
      }

      if (userinfo.name === undefined || userinfo.picture === undefined) {
        const response = await google.oauth2('v2')
        .userinfo.get({
          auth: oauth2Client
        })
        // TODO
        console.log(response);
  
        if (response.data.name) {
          // TODO Expire
          // expire()
          await setOrThrowSessionKey(req, 'name', response.data.name);
          userinfo.name = response.data.name;
        }
  
        if (response.data.picture) {
          await setOrThrowSessionKey(req, 'picture', response.data.picture)
          userinfo.picture = response.data.picture;
        }

      }
      // TODO Missing refresh_token error handling
      userinfo.authenticated = true;
      userinfo.scope = oauth2Client.credentials.scope;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'invalid_grant') {
          // TODO Drop refresh token
          await deleteSessionKey(cookies(), 'tokens');
        } else {
          // TODO Log this somehow
          console.log(e);
          errorMessage = e.message;
          res.send(e.message);
        }
        res.status(500);
      }
    }
  }
  return res.json(userinfo);
}
    