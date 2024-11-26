'use client';

import { differenceInSeconds, formatISO } from "date-fns";
import { Meeting } from "./types";
import { useEffect, useState } from "react";

export function CurrentMeeting({meeting, endedMeeting}: {meeting: Meeting, endedMeeting: (meeting: Meeting) => void}) {

    async function endMeeting(meeting: Meeting) {
        const url = `/api/meeting/end/${meeting.name!.replace("spaces/", "")}`;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
    
          meeting.actualEndTime = new Date();
          endedMeeting(meeting);
        } catch (error) {
          console.error(error);
        }
    }

    const [timeRemaining, setTimeRemaining] = useState<number>(differenceInSeconds(meeting.scheduledEndTime, new Date()));
  
    const formatTimeRemaining = (timeRemaining: number): string => {
      let remaining = timeRemaining;
      const hours = Math.floor(remaining / (60 * 60));
      remaining = remaining - (hours * 60 * 60);
      const minutes = Math.floor(remaining / 60);
      remaining = remaining - (minutes * 60);
      const seconds = remaining;
      return [hours, minutes, seconds].map(n => n.toString().padStart(2, '0')).join(":");
    }

    useEffect(() => {
      console.log("Starting interval");
  
        const timerInterval = setInterval(() => {
          if (meeting.scheduledEndTime !== undefined) {
            const diff = differenceInSeconds(meeting.scheduledEndTime, new Date());
    
            if (diff <= 0) {
              console.log("Ending meeting");
              clearInterval(timerInterval);
              endMeeting(meeting);
            } else {
              console.log(`Setting diff to ${diff}`);
              setTimeRemaining(diff);
            }
    
          }
        }, 1000);
  
      // Cleanup the interval when the component unmounts
      return () => {
        timerInterval !== undefined && clearInterval(timerInterval);
      }
  
    }, [meeting]);

    return (<>
        <p>
           Meeting with code { meeting.meetingCode } started and will end in {formatTimeRemaining(timeRemaining)} at { formatISO(meeting.scheduledEndTime) }
            </p>
            <a target="_blank" href={meeting.meetingUri!}>Join now</a>
            <button onClick={() => endMeeting(meeting!)}>End meeting</button>
    </>);
    
}