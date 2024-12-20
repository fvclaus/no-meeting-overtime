import { db } from "@/shared/server_constants";
import { Meeting } from "@/types";
import { RouteParams } from "./route";

// TODO Export because of test
export const findMeeting = async (params: RouteParams): Promise<(Meeting & { code: string; }) | undefined> => {
    const { meetingCode } = await params;
    const meetingDocs = await db.collection("meeting").doc(meetingCode).get();

    const meeting = meetingDocs.data() as Meeting;
    return {
        ...meeting,
        code: meetingCode
    };
};
