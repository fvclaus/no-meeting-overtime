import { deleteKey, get, set } from "@/session-store";
import { AUTHORIZATION_SUCCESS, SITE_BASE } from "@/shared/constants";
import { createOauth2Client } from "@/shared/server_constants";
import { sql } from "@vercel/postgres";
import {JWT} from 'google-auth-library';
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import url from "url";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.query.error) { // An error response e.g. error=access_denied
      res.end('Error:' + req.query.error)
      // TODO Log this better
      return;
    } 

    const state = await get(req, 'state');
    
    if (req.query.state !== state) { //check state value
      res.end(`Stored state ${state} does not match received state ${req.query.state}`);
      return;
    }

    deleteKey(req, 'state');

    // Get access and refresh tokens (if access_type is offline)
        // TODO Type check
    const oauth2Client = createOauth2Client();
    let { tokens } = await oauth2Client.getToken(req.query.code as string);
    console.log(tokens);

    // TODO Missing access token?
    const userInfoResponse = await oauth2Client.getTokenInfo(tokens.access_token!);

    const result = await sql`SELECT * FROM Users where id = ${userInfoResponse.sub}`;
    console.log(result);

    try {
      if (result.rowCount == 0) {
        await sql`INSERT INTO Users (id, refresh_token) VALUES (${userInfoResponse.sub}, ${tokens.refresh_token});`;
      } else {
        const refresh_token = result.rows[0].refresh_token;
        tokens = {...tokens, refresh_token: refresh_token}
        if (tokens.refresh_token) {
          // TODO Test
          await sql`UPDATE Users set refresh_token = ${tokens.refresh_token} where id = ${userInfoResponse.sub};`;
        }
      }

      oauth2Client.setCredentials(tokens);

   }
  catch (error) {
    // TODO Error handling when refresh_token leer ist?
    console.log(error);  

  }
  set (req, res, 'tokens', JSON.stringify(tokens));
  // set (req, res 'given_name', userInfoResponse.)
    res.redirect(AUTHORIZATION_SUCCESS);
};