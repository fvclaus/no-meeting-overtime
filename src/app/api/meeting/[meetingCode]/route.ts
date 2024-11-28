import { Meeting } from "@/types";
import { getCredentials, getSessionKey } from "@/session-store";
import { db } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";


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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ meetingCode: string }>}
  ) {

    const { meetingCode } = await params;

    const oauthClient = await getCredentials();

    if (oauthClient === undefined) {
        return new NextResponse("Unauthenticated", {status: 403})
    }

    try {
        const response = await google.meet('v2')
            .spaces.endActiveConference({
                name: `spaces/${meetingCode}`,
                auth: oauthClient
            });
        console.log(response);
        return new NextResponse(undefined, {status: response.status});
    } catch (e) {
        console.error(e);
        // TODO Improve error messages
        return new NextResponse(undefined, {status: 500});
    }
}