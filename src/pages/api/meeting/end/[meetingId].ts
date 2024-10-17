import { get } from "@/session-store";
import { createOauth2Client } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const { meetingId } = req.query;

    const tokensFromStore = await get(req, 'tokens');
    if (tokensFromStore == null || tokensFromStore === undefined) {
        console.log('Has no tokens in session');
        return res.status(403).end();
    }

    const oauth2Client = createOauth2Client();
    oauth2Client.setCredentials(typeof tokensFromStore === 'string'? JSON.parse(tokensFromStore) : tokensFromStore);

    const recording = await google.meet('v2')
        .spaces.get({
            name: `spaces/${meetingId}`,
            auth: oauth2Client
        });
    console.log(recording);

    // await google.meet('v2')
    //     .spaces.endActiveConference({
    //         name: 'spaces/wec-kghm-gzs',
    //         auth: oauth2Client
    //     })
    return res.json(recording);
}