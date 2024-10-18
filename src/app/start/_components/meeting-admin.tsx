'use client';


import { REDIRECT_TO_AUTHORIZATION_API_URL } from "@/shared/constants";
import { formatISO, set } from "date-fns";
import { meet_v2 } from "googleapis";
import { FormEvent, useState } from "react";
import { useForm } from "react-hook-form";
import CreateMeeting from "./meeting-creation";
import { MeetingList } from "./meeting-list";
import { Meeting } from "./meeting";


export default function MeetingAdministration({isAuthenticated}: {isAuthenticated: boolean}) {
    const [currentMeetingSpace, setCurrentMeetingSpace] = useState<Meeting | undefined>();

    function meetingCreated(space: Meeting) {
      setCurrentMeetingSpace(space);
    }

    function endedMeeting(meeting: Meeting) {
      setCurrentMeetingSpace(undefined);
      alert(`Meeting ${meeting.meetingCode} ended at ${formatISO(meeting.actualEndTime!)}`);
    }

    // TODO
    // Force new session, because we can't distinguish between different Google Accounts in one browser.
  
    if (!isAuthenticated) {
      return <>
          <p>
              <a href={REDIRECT_TO_AUTHORIZATION_API_URL} target="_blank">Allow access to create Google Meet spaces</a>
          </p>
      </>;
    } else if (currentMeetingSpace !== undefined) {
      return (
        <>
          <MeetingList newMeeting={currentMeetingSpace} endedMeeting={endedMeeting}></MeetingList>
        </>
      );
    } else {
      return <CreateMeeting meetingCreated={meetingCreated}></CreateMeeting>
    }
    // else if (endTime !== undefined && timeRemaining !== undefined) {
    //   return (
    //     <>
    //       <p> Meeting will end in { formatTimeRemaining(timeRemaining) } at { formatISO(endTime) } </p>
    //       {meetingInfo?.isOwner && 
    //       <p>Because you are the owner, we will end the meeting for everyone</p>
    //       }
    //       {!meetingInfo?.isOwner && 
    //       <p>Because you are not the owner or there is some technical problem, we will just close the tab.</p>
    //       }
    //     </>
    //   )
    //   // TODO Loading spinner
  
    // }
}