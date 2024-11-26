import { meet_v2 } from "googleapis";


export type Meeting = meet_v2.Schema$Space &
 {
    scheduledEndTime: Date,
    actualEndTime?: Date,
 };

export interface UserInfo {
   id?: string;
   name?: string;
   picture?: string;
   scope?: string;
   authenticated: boolean;
}

