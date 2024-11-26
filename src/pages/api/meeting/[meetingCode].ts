import { Meeting } from "@/types";
import { getSessionKey } from "@/session-store";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/shared/server_constants";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {

    const { meetingCode } = req.query;

    
    const meetingDoc = await db.collection("meeting").doc(meetingCode as string).get();
    const meeting = meetingDoc.data() as Meeting | undefined;
    if (meeting == null || !meetingDoc.exists) {
        return res.status(403).send("Unauthorized");
    }

    const userId = await getSessionKey(req, 'userId');
    if (userId !== meeting.userId) {
        return res.status(403).send("Unauthorized");
    }

    return res.status(200).json({
        scheduledEndTime: meeting.scheduledEndTime,
        uri: meeting.uri
    })
    
}