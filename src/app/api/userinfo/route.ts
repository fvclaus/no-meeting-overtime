import { UserInfo } from "@/types";
import { deleteSessionKey, getCredentials, getSessionOrThrow, setOrThrowSessionKey } from "@/session-store";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
  ): Promise<Response> {
  const oauth2Client = await getCredentials();
  let userinfo: UserInfo = {
    authenticated: false
  }
  if (oauth2Client !== undefined) {
    try {

      const sessionData = await getSessionOrThrow(req);
      if (typeof sessionData.name === 'string') {
        userinfo.name = sessionData.name;
      }
      if (typeof sessionData.picture === 'string') {
        userinfo.picture = sessionData.picture;
      }

      // TODO How often do we need to actually load this endpoint to make sure that the user is still logged in.
      // if (userinfo.name === undefined || userinfo.picture === undefined) {
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

      // }
      // TODO Missing refresh_token error handling
      userinfo.authenticated = true;
      // TODO Scope is only defined if we call the userinfo endpoint
      userinfo.scope = oauth2Client.credentials.scope;
    } catch (e) {
      if (e instanceof Error) {
        let message;
        if (e.message === 'invalid_grant') {
          message = "Tokens expired or revoked";
          // TODO Drop refresh token
          await deleteSessionKey(cookies(), 'tokens');
        } else {
          // TODO Log this somehow
          console.log(e);
          message = e.message;
        }
        const headers = new Headers();
        headers.set('Content-Type', 'text/plain');
        return new NextResponse(message, {status: 500, headers})
      }
    }
  }
  return NextResponse.json(userinfo);
}
    