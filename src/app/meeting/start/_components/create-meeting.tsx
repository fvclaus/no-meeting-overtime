"use client";

import { meet_v2 } from "googleapis";
import { get, useForm } from "react-hook-form";
import { addMinutes, formatISO, isAfter, set } from "date-fns";
import { useEffect, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

type FormValues = {
  endTime: string;
};

export default function CreateMeeting() {
  const [error, setError] = useState<string | undefined>(),
    router = useRouter(),
    // TODO default mode doesn't work. Why?
    { register, handleSubmit, formState } = useForm<FormValues>({
      mode: "all",
    }),
    { errors, isValid, isSubmitting } = formState;

  // TODO Server using up lots of RAM

  async function createMeeting(data: FormValues) {
    setError(undefined);
    const response = await fetch(`/api/meeting/`, {
      method: "POST",
      body: JSON.stringify({ scheduledEndTime: formatISO(data.endTime) }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      setError(await response.text());
      return false;
    }
    setError(undefined);

    const meeting = (await response.json()) as meet_v2.Schema$Space;
    console.log(meeting);

    router.push(`/meeting/${meeting.meetingCode}`);

    return false;
  }

  return (
    <>
      <div className="flex justify-center w-full">
        <form
          onSubmit={handleSubmit(createMeeting)}
          className="flex flex-col w-full max-w-screen-sm"
        >
          {error && (
            <div role="alert" className="alert alert-error w-full">
              <span>{error}</span>
            </div>
          )}
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">When Should the Meeting End?</span>
            </div>

            <input
              type="time"
              className={clsx(
                "input input-bordered w-full",
                errors.endTime && "input-error",
              )}
              {...register("endTime", {
                required: true,
                setValueAs(value: string | undefined) {
                  console.log(`Setting value from ${value}`);
                  if (value == undefined) {
                    return value;
                  }
                  const [hours, minutes] = value
                      .split(":")
                      .map((s) => parseInt(s)),
                    endTime = set(new Date(), {
                      hours,
                      minutes,
                      seconds: 0,
                      milliseconds: 0,
                    });
                  return endTime;
                },
                validate: {
                  wrongTime: ((v: TZDate) => {
                    console.log(`Validating ${v}`);
                    const minLengthInMinutes = 2,
                      earliestEndTime = addMinutes(
                        new Date(),
                        minLengthInMinutes,
                      );
                    console.log(`Is ${v} after ${earliestEndTime}`);
                    return (
                      isAfter(v, earliestEndTime) ||
                      `Meeting must be at least ${minLengthInMinutes} minutes long.`
                    );
                  }) as any,
                },
              })}
            />
          </label>
          {errors.endTime && (
            <p className="text-error text-size text-base mt-1">
              {errors.endTime.message}
            </p>
          )}
          <button
            className="btn btn-primary w-full mt-6"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {!isSubmitting && <span>Create Meeting</span>}
            {isSubmitting && <span className="loading loading-spinner"></span>}
          </button>
        </form>
      </div>
    </>
  );
}
