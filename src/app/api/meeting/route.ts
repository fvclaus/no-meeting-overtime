import { Meeting } from "@/types";
import { getCredentials, getSessionKey } from "@/session-store";
import { CLOUD_TASKS_SERVICE_ACCOUNT, db, PROJECT_ID, QUEUE_LOCATION } from "@/shared/server_constants";
import { google } from "googleapis";
import {CloudTasksClient} from "@google-cloud/tasks";

import z from "zod";
import { SITE_BASE_CLOUD_TASKS } from "@/shared/server_constants";
import { differenceInSeconds, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

const RequestBodySchema = z.object({
    scheduledEndTime: z.string()
})

const client = new CloudTasksClient();


export async function POST(
    req: NextRequest,
  ) {
      
    const body = await req.json();
      // TODO Must not be in the past and must be a time
      try {
        RequestBodySchema.parse(body);
    } catch (e: any) {
        return new NextResponse("The request was invalid", {status: 400});
    }

    const reqData = body as z.infer<typeof RequestBodySchema>;

    const oauthClient = await getCredentials();

    if (oauthClient === undefined) {
        return new NextResponse("No credentials in session", {status: 403});
    }

    const userId = await getSessionKey('userId');

    if (userId === undefined) {
        return new NextResponse("No userId in session", {status: 403});
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
        const secondsToEnd = Math.min(0, differenceInSeconds(parseISO(reqData.scheduledEndTime), Date.now()));
        // TODO eslint Rule Hanging Promise
        await client.createTask({
            parent: client.queuePath(PROJECT_ID, QUEUE_LOCATION, "end-meetings1"),
            task: {
                httpRequest: {
                    httpMethod: 'DELETE',
                    url: `${SITE_BASE_CLOUD_TASKS}/api/meeting/${space.data.meetingCode!}`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // TODO encoding
                    body: JSON.stringify({userId}),
                    oidcToken: {
                        serviceAccountEmail: CLOUD_TASKS_SERVICE_ACCOUNT
                    }
                },
                scheduleTime:  {
                    seconds: secondsToEnd
                },
                
            },
        })
        await db.collection("meeting").doc(space.data.meetingCode!).set(meeting);
        return NextResponse.json(
            space.data
        );
    } catch (e) {
        console.error(e);
        return new NextResponse(`Creation of meeting failed`, {status: 500})
    }
}