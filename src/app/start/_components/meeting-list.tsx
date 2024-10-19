import { meet_v2 } from "googleapis";
import { Meeting } from "./types";
import { formatISO } from "date-fns";
import { useState } from "react";
import { CurrentMeeting } from "./meeting-current";

export function MeetingList({newMeeting, endedMeeting}: {newMeeting: Meeting | undefined, endedMeeting: (meeting: Meeting) => void}) {

    const [oldMeetings, setOldMeetings] = useState<Meeting[]>([]);

    // function endedMeeting(meeting: Meeting) {
    //     setOldMeetings([meeting, ...oldMeetings]);
    //     newMeeting = undefined;
    // }

    // TODO Warning wenn man von der Seite wegnavigiert

    return (
    <>
        {newMeeting !== undefined &&
            <CurrentMeeting meeting={newMeeting} endedMeeting={endedMeeting}></CurrentMeeting>
        }
        <table>
            <thead>
            <tr>
                <th>
                    Meeting Code
                </th>
                <th>
                    Scheduled End Time
                </th>
                <th>
                    Actual End Time
                </th>
            </tr>
            </thead>
            <tbody>
            {
                oldMeetings.map(meeting => (
                    <tr>
                        <td>
                            {meeting.meetingCode}
                        </td>
                        <td>
                            {formatISO(meeting.scheduledEndTime!)}
                        </td>
                        <td>
                            {formatISO(meeting.actualEndTime!)}
                        </td>
                    </tr>
                ))
            }
            </tbody>
        </table>
    </>
    );

}