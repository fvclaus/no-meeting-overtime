import { get, getCredentials } from "@/session-store";
import { createOauth2Client } from "@/shared/server_constants";
import { google, meet_v2 } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";


// TODO Typing
type Response =  meet_v2.Schema$Space | {
    error: unknown;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const oauthClient = await getCredentials(req);

    if (oauthClient === undefined) {
        res.status(403).end("No credentials in session");
    }

    let isOwner;
    try {
        const space = await google.meet('v2')
            .spaces.create({
                auth: oauthClient
            });
            return res.json(
                space.data
            );;
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: 'Creation failed'
        })
    }
    
 
}