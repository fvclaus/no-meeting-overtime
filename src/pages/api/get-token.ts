import { deleteKey, get, set } from "@/session-store";
import { AUTHORIZATION_SUCCESS } from "@/shared/constants";
import { createOauth2Client } from "@/shared/server_constants";
import { NextApiRequest, NextApiResponse } from "next";
import url from "url";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.query.error) { // An error response e.g. error=access_denied
      res.end('Error:' + req.query.error)
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
    oauth2Client.setCredentials(tokens);
    await set(req, res, 'tokens', JSON.stringify(tokens));
    res.redirect(AUTHORIZATION_SUCCESS);
};