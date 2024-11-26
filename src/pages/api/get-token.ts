import { deleteSessionKey, getSessionKey, setSessionKey } from "@/session-store";
import { AUTHORIZATION_SUCCESS } from "@/shared/constants";
import { createOauth2Client, db } from "@/shared/server_constants";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.query.error) { // An error response e.g. error=access_denied
      res.end('Error:' + req.query.error)
      // TODO Log this better
      return;
    } 

    const state = await getSessionKey(req, 'state');
    
    if (req.query.state !== state) { //check state value
      res.end(`Stored state ${state} does not match received state ${req.query.state}`);
      return;
    }

    await deleteSessionKey(req, 'state');

    // Get access and refresh tokens (if access_type is offline)
        // TODO Type check
    const oauth2Client = createOauth2Client();
    let { tokens } = await oauth2Client.getToken(req.query.code as string);
    console.log(tokens);

    // TODO Missing access token?
    const userInfoResponse = await oauth2Client.getTokenInfo(tokens.access_token!);

    const doc = await db.collection("user").doc(userInfoResponse.sub!).get();

    try {
      const data = {id: userInfoResponse.sub} as any;
      if (tokens.refresh_token) {
        data.refresh_token = tokens.refresh_token;
      }
      doc.ref.set(data, {merge: true})

      oauth2Client.setCredentials(tokens);

   }
  catch (error) {
    // TODO Error handling when refresh_token leer ist?
    console.log(error);  

  }
  await setSessionKey (req, res, 'tokens', tokens);
  // set (req, res 'given_name', userInfoResponse.)
    res.redirect(AUTHORIZATION_SUCCESS);
};