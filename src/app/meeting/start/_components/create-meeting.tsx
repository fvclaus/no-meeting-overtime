'use client';

import { meet_v2 } from "googleapis";
import { useForm } from "react-hook-form";
import { formatISO, set } from "date-fns";
import { useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useRouter } from "next/navigation";

type FormValues = {
  endTime: string;
};

export default function CreateMeeting() {

  const [error, setError] = useState<string | undefined>();

  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormValues>();

  // TODO
  // Force new session, because we can't distinguish between different Google Accounts in one browser.

  // TODO Check time not in the past

  async function createMeeting(data: FormValues) {
    setError(undefined);
    const [hours, minutes] = data.endTime.split(":").map(s => parseInt(s));
    const endTime = new TZDate(set(new Date(), { hours, minutes, seconds: 0, milliseconds: 0 }), Intl.DateTimeFormat().resolvedOptions().timeZone);
    const response = await fetch(`/api/meeting/start/`, {
      method: "POST",
      body: JSON.stringify({ scheduledEndTime: formatISO(endTime) }),
      headers: {
        "Content-Type": "application/json",
      }
    });
    if (!response.ok) {
      setError(await response.text());
      return false;
    } else {
      setError(undefined);
    }

    const json = await response.json() as meet_v2.Schema$Space;
    console.log(json);

    router.push(`/meeting/${json.meetingCode}`);

    return false;
  }

  return (
    <>
      <div className="flex justify-center w-full">
        <form onSubmit={handleSubmit(createMeeting)} className="flex flex-col w-full max-w-screen-sm">
          {error &&
            <div role="alert" className="alert alert-error w-full">
              <span>{error}</span>
            </div>
          }
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">When Should the Meeting End?</span>
            </div>
            <input type="time" className="input input-bordered w-full"  {...register("endTime", {
              required: true
            })} />
            <div className="label">
              <span className="label-text-alt">Your meeting will automatically end at this time.</span>
            </div>
          </label>
          {errors.endTime &&
            <div role="alert" className="alert alert-error w-full">
              <span>This is a required field</span>
            </div>
          }

          <button className="btn btn-primary w-full" type="submit" disabled={!isValid}>Create Meeting</button>

        </form >
      </div>
    </>
  );
}