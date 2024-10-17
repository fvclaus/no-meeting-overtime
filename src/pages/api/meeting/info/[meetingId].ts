import { get } from "@/session-store";
import { createOauth2Client } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";


interface Response {
    isOwner: boolean;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Response>
  ) {

    const { meetingId } = req.query;

    const tokensFromStore = await get(req, 'tokens');
    if (tokensFromStore == null || tokensFromStore === undefined) {
        console.log('Has no tokens in session');
        return res.status(403).end();
    }

    const oauth2Client = createOauth2Client();
    oauth2Client.setCredentials(typeof tokensFromStore === 'string'? JSON.parse(tokensFromStore) : tokensFromStore);

    let isOwner;
    try {
        await google.meet('v2')
            .spaces.get({
                name: `spaces/${meetingId}`,
                auth: oauth2Client
            });
        isOwner = true;
    } catch (e) {
        if (e instanceof Error && e.toString().includes("Permission denied")) {
            isOwner = false;
            return;
        }
        // TODO logging
        isOwner = false;
    }
    res.json({
        isOwner
    });
    return;
}