import { Meeting } from "@/types";
import { getCredentials, getSessionKey } from "@/app/session-store";
import {
  CLOUD_TASKS_SERVICE_ACCOUNT,
  PROJECT_ID,
  QUEUE_LOCATION,
} from "@/shared/server_constants";
import { google } from "googleapis";
import { CloudTasksClient } from "@google-cloud/tasks";

import z from "zod";
import { SITE_BASE_CLOUD_TASKS } from "@/shared/server_constants";
import { differenceInSeconds, formatISO, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { saveMeeting } from "../../firestore";
import {
  isMeetingEndAfterOffset,
  MEETING_END_MINUTES_OFFSET,
} from "@/shared/constants";

const RequestBodySchema = z.object({
    scheduledEndTime: z
      .string()
      .datetime({ offset: true })
      .refine(
        (value) => {
          return isMeetingEndAfterOffset(new Date(value));
        },
        {
          message: `Datetime must be ${MEETING_END_MINUTES_OFFSET} minutes in future`,
        },
      )
      .pipe(z.coerce.date()),
  }),
  client = new CloudTasksClient();

export async function POST(req: NextRequest) {
  console.log(client.auth);

  const body = await req.json(),
    result = RequestBodySchema.safeParse(body);
  if (result.error) {
    return NextResponse.json(result.error.errors, { status: 400 });
  }

  const reqData = result.data,
    oauthClient = await getCredentials();

  if (oauthClient === undefined) {
    return new NextResponse("No credentials in session", { status: 403 });
  }

  const userId = await getSessionKey("userId");

  if (userId === undefined) {
    return new NextResponse("No userId in session", { status: 403 });
  }

  try {
    const space = await google.meet("v2").spaces.create({
        auth: oauthClient,
      }),
      meeting: Meeting = {
        scheduledEndTime: formatISO(reqData.scheduledEndTime),
        name: space.data.name!,
        uri: space.data.meetingUri!,
        userId,
      };

    console.log(`Created meeting ${space.data.meetingCode}`);
    const secondsToEnd = Math.max(
        0,
        differenceInSeconds(reqData.scheduledEndTime, Date.now()),
      ),
      // TODO eslint Rule Hanging Promise
      [response] = await client.createTask({
        parent: client.queuePath(PROJECT_ID, QUEUE_LOCATION, "end-meetings1"),
        task: {
          httpRequest: {
            httpMethod: "DELETE",
            url: `${SITE_BASE_CLOUD_TASKS}/api/meeting/${space.data.meetingCode!}?userId=${userId}`,
            headers: {
              "Content-Type": "application/json",
            },
            oidcToken: {
              serviceAccountEmail: CLOUD_TASKS_SERVICE_ACCOUNT,
            },
          },
          scheduleTime: {
            seconds: secondsToEnd + Date.now() / 1000,
          },
        },
      });
    console.log(
      `Created task with name ${response.name} to end meeting ${space.data.meetingCode} in ${secondsToEnd}s`,
    );
    await saveMeeting(space.data.meetingCode!, meeting);
    return NextResponse.json(space.data);
  } catch (e) {
    console.error(e);
    return new NextResponse(
      `Creation of meeting failed: ${e instanceof Error ? e.message : e}`,
      { status: 500 },
    );
  }
}
