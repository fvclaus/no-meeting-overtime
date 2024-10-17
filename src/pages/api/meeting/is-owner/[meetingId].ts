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

    try {
        await google.meet('v2')
            .spaces.get({
                name: `spaces/${meetingId}`,
                auth: oauth2Client
            });
    } catch (e) {
        if (e instanceof Error && e.toString().includes("Permission denied")) {
            res.send("false");
            return;
        }
    }

    res.send("true");
    return;
}