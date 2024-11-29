'use client';

import { differenceInSeconds, formatISO } from "date-fns";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Meeting } from "@/types";
import { START_MEETING_PATH } from "@/shared/constants";

export type MeetingData = Pick<Meeting, "scheduledEndTime"> & Pick<Meeting, "uri"> & { code: string }

export function JoinMeeting({ meeting }: { meeting: MeetingData }) {

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

    const timerInterval = setInterval(() => {
      if (meeting.scheduledEndTime !== undefined) {
        const diff = differenceInSeconds(meeting.scheduledEndTime, new Date());

        if (diff <= 0) {
          setTimeRemaining(0);
          clearInterval(timerInterval);
        } else {
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
    <div className="flex flex-col max-w-screen-xl justify-center w-full">
      <div role="alert" className="alert alert-success">
        <p>Meeting with code <span className="font-bold">{meeting.code}</span> started and will end {timeRemaining > 0 && 
            <>in <span className="font-bold">{formatTimeRemaining(timeRemaining)} at {formatISO(meeting.scheduledEndTime)}</span></>
        }
        {timeRemaining <= 0 && <span className="font-bold">now</span>}
        </p>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="card grid flex-grow place-items-center"><Link className="btn btn-secondary" href={START_MEETING_PATH}>Create another</Link></div>
        <div className="divider lg:divider-horizontal">OR</div>
        <div className="card grid flex-grow place-items-center"><Link target="_blank" className="btn btn-primary" href={meeting.uri}>Join now</Link></div>
      </div>
    </div>
  </>);

}