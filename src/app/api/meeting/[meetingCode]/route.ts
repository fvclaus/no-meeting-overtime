import { Meeting } from "@/types";
import { getSessionKey } from "@/session-store";
import { CLOUD_TASKS_SERVICE_ACCOUNT, createOauth2Client, db } from "@/shared/server_constants";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const findMeeting = async (params: RouteParams): Promise<Meeting & {code: string} | undefined> => {
    const {meetingCode} = await params;
    const meetingDocs = await db.collection("meeting").doc(meetingCode).get();

    const meeting = meetingDocs.data() as Meeting;
    return {
        ...meeting,
        code: meetingCode
    }
}


type RouteParams = 
     Promise<{
        meetingCode: string;
    }>;

export async function GET(
    req: NextRequest,
    { params }: {params: RouteParams}
  ) {

    const meeting = await findMeeting(params);
    if (meeting == null) {
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
    { params }: { params: RouteParams}
  ) {

    const taskName = req.headers.get('X-CLOUDTASKS-TASKNAME');
    if (taskName == undefined) {
        console.error(`No X-CLOUDTASKS-TASKNAME header`);
    }

    const oauth2Client = createOauth2Client();
    const idToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (idToken == null) {
        // TODO Structured logging?
        console.error(`[${taskName}]: Missing authorization header`);
        return new NextResponse("Missing Authorization Header", {status: 400});
    }
    try {
        // TODO Test
        const login = await oauth2Client.verifyIdToken({
            idToken: idToken
        });
        if (CLOUD_TASKS_SERVICE_ACCOUNT !== login.getPayload()?.email) {
            console.error(`[${taskName}]: OIDC token has the wrong mail: ${login.getPayload()?.email} instead of ${CLOUD_TASKS_SERVICE_ACCOUNT}`)
            return new NextResponse(undefined, {status: 403});
        }
    } catch (e) {
        console.error(`[${taskName}]: OIDC signature validation failed`);
        return new NextResponse(undefined, {status: 403});
    }

    const userId = req.nextUrl.searchParams.get('userId');

    if (userId == null) {
        console.error(`[${taskName}]: Missing userId parameter`);
        return new NextResponse("Missing userId parameter",  {status: 400});
    }

    const userDoc = await db.collection("user").doc(userId).get();
    const user = userDoc.data();

    if (!userDoc.exists || user == undefined) {
        console.error(`[${taskName}]: Did not find user ${userId}`);
        return new NextResponse(undefined, {status: 204});
    }
    
    oauth2Client.setCredentials({refresh_token: user.refresh_token});

    const meeting = await findMeeting(params);
    if (meeting == undefined) {
        console.log(`[${taskName}]: Did not find meeting`);
      return new NextResponse(undefined, {status: 204});
    }

    try {
        
        const response = await google.meet('v2')
            .spaces.endActiveConference({
                name: meeting.name,
                auth: oauth2Client
            });
        console.log(`[${taskName}]: Ended meeting ${meeting.code}`);
        // TODO Maybe make meetings subcollection of User?
        // TODO Keep or delete meeting?
        return new NextResponse(undefined, {status: response.status});
    } catch (e: any) {
        // TODO How to handle 'There is no active conference for the given space.'?
        if ('status' in e && typeof e.status === 'number') {
            const status = e.status;
            if (status === 403) { // Deleted or permission denied
                return new NextResponse(undefined, {status: 204});
            }
            else {
                console.error(`[${taskName}]`, e);
                return new NextResponse(undefined, {status});
            }
        }
        console.error(`[${taskName}]`, e);
        return new NextResponse(undefined, {status: 500});
    }
}