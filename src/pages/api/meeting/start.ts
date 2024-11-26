import { Meeting } from "@/types";
import { getCredentials, getSessionKey } from "@/session-store";
import { db } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

import z from "zod";

const RequestBodySchema = z.object({
    scheduledEndTime: z.string()
})


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    try {
        RequestBodySchema.parse(req.body);
    } catch (e: any) {
        return res.status(400).send("The request was invalid");
    }

    const reqData = req.body as z.infer<typeof RequestBodySchema>;

    const oauthClient = await getCredentials(req);

    if (oauthClient === undefined) {
        return res.status(403).end("No credentials in session");
    }

    const userId = await getSessionKey(req, 'userId');

    if (userId === undefined) {
        return res.status(403).end("No userId in session");
    }

    try {
        const space = await google.meet('v2')
            .spaces.create({
                auth: oauthClient
            });
        const meeting: Meeting = {
            scheduledEndTime: reqData.scheduledEndTime,
            name: space.data.name!,
            uri: space.data.meetingUri!,
            userId: userId!
        };
        await db.collection("meeting").doc(space.data.meetingCode!).set(meeting);
        return res.status(200).json(
            space.data
        );
    } catch (e) {
        console.error(e);
        res.status(500).send(`Creation of meeting failed`)
    }
    
 
}