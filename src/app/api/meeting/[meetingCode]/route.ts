import { Meeting } from "@/types";
import { getCredentials, getSessionKey } from "@/session-store";
import { CLOUD_TASKS_SERVICE_ACCOUNT, createOauth2Client, db } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ meetingCode: string }>}
  ) {

    const { meetingCode } = await params;

    
    const meetingDoc = await db.collection("meeting").doc(meetingCode as string).get();
    const meeting = meetingDoc.data() as Meeting | undefined;
    if (meeting == null || !meetingDoc.exists) {
        return new NextResponse("Unauthenticated", {status: 403})
    }

    const userId = await getSessionKey('userId');
    if (userId !== meeting.userId) {
        return new NextResponse("Unauthenticated", {status: 403})
    }

    return NextResponse.json({
        scheduledEndTime: meeting.scheduledEndTime,
        uri: meeting.uri
    })    
}

const DeleteBodySchema = z.object({
    userId: z.string()
});

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ meetingCode: string }>}
  ) {

    const oauth2Client = createOauth2Client();
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (idToken == null) {
        return new NextResponse(undefined, {status: 400});
    }
    try {
        // TODO Test
        const login = await oauth2Client.verifyIdToken({
            idToken: idToken
        });
        if (CLOUD_TASKS_SERVICE_ACCOUNT !== login.getUserId()) {
            return new NextResponse(undefined, {status: 403});
        }
    } catch (e) {
        console.error(e);
        return new NextResponse(undefined, {status: 403});
    }

    const body = await req.json();
      // TODO Must not be in the past and must be a time
      try {
        DeleteBodySchema.parse(body);
    } catch (e: any) {
        return new NextResponse("The request was invalid", {status: 400});
    }

    const reqData = body as z.infer<typeof DeleteBodySchema>;
    const userDoc = await db.collection("user").doc(reqData.userId).get();
    const user = userDoc.data();

    if (!userDoc.exists || user == undefined) {
        return new NextResponse("The request was invalid", {status: 400});
    }
    
    const oauthClient = await getCredentials(user.refresh_token);

    if (oauthClient === undefined) {
        return new NextResponse("Unauthenticated", {status: 403})
    }

    try {

        const { meetingCode } = await params;
        const response = await google.meet('v2')
            .spaces.endActiveConference({
                name: `spaces/${meetingCode.replaceAll('-', '')}`,
                auth: oauthClient
            });
        console.log(response);
        // TODO Maybe make meetings subcollection of User
        // TODO Delete meeting
        return new NextResponse(undefined, {status: response.status});
    } catch (e) {
        console.error(e);
        // TODO Improve error messages
        return new NextResponse(undefined, {status: 500});
    }
}