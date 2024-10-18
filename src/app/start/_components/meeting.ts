import { meet_v2 } from "googleapis";


export type Meeting = meet_v2.Schema$Space &
 {
    scheduledEndTime: Date,
    actualEndTime?: Date,
 };

