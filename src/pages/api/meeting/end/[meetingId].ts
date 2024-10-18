import { get, getCredentials } from "@/session-store";
import { createOauth2Client } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const { meetingId } = req.query;

    const oauthClient = await getCredentials(req);

    if (oauthClient === undefined) {
        res.status(403).end("No credentials in session");
    }

    try {
        const response = await google.meet('v2')
            .spaces.endActiveConference({
                name: `spaces/${meetingId}`,
                auth: oauthClient
            });
        console.log(response);
            return res.status(response.status).end();
    } catch (e) {
        // TODO Improve error messages
        return res.status(400).end();
    }
}