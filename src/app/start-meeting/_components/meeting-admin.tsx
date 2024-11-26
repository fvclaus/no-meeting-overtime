'use client';

import { formatISO} from "date-fns";
import { useState } from "react";
import CreateMeeting from "./meeting-creation";
import { MeetingList } from "./meeting-list";
import { Meeting, UserInfo } from "./types";


export default function MeetingAdministration({userInfo}: {userInfo: UserInfo}) {
    const [currentMeetingSpace, setCurrentMeetingSpace] = useState<Meeting | undefined>();

    function meetingCreated(space: Meeting) {
      setCurrentMeetingSpace(space);
    }

    function endedMeeting(meeting: Meeting) {
      setCurrentMeetingSpace(undefined);
      alert(`Meeting ${meeting.meetingCode} ended at ${formatISO(meeting.actualEndTime!)}`);
    }

    // return <><p>Hello, World!</p></>

    if (currentMeetingSpace !== undefined) {
      return (<>
          <MeetingList newMeeting={currentMeetingSpace} endedMeeting={endedMeeting}></MeetingList>
        </>
      );
    } else {
      return (       <>
      <div>
       {userInfo.name && 
          <p>Welcome, {userInfo.name}!</p>
        }
        {userInfo.picture &&
        <img src={userInfo.picture} />
        }
        </div>
      <CreateMeeting meetingCreated={meetingCreated}></CreateMeeting>
      </>);
    }
}