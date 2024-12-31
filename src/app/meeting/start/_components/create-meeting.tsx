"use client";

import { meet_v2 } from "googleapis";
import { useForm } from "react-hook-form";
import { addMinutes, formatISO, isAfter, set } from "date-fns";
import { useState } from "react";
import { TZDate } from "@date-fns/tz";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import FAQSection from "@/app/FAQSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  isMeetingEndAfterOffset,
  MEETING_END_MINUTES_OFFSET,
} from "@/shared/constants";

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

    const meeting = (await response.json()) as { meetingCode: string };

    router.push(`/meeting/${meeting.meetingCode}`);

    return false;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl text-center px-4 mb-8 mt-10">
          <div className="flex justify-center space-x-6 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center transition-colors hover:bg-blue-100">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center transition-colors hover:bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-800 sm:text-5xl">
            <span className="block text-blue-600">
              End Your Meeting on Schedule
            </span>
          </h1>
        </div>

        <div className="w-full bg-blue-50 py-16">
          <div className="px-4 flex flex-col items-center">
            <form
              onSubmit={handleSubmit(createMeeting)}
              className="bg-white p-8 rounded-lg shadow-lg w-full max-w-screen-sm"
            >
              {error && (
                <Alert
                  variant="destructive"
                  className="max-w-xl mx-auto mb-5 mt-5"
                >
                  <div className="flex flex-row items-center">
                    <AlertCircle className="h-6 w-6" />
                    <AlertTitle className="text-lg font-semibold ml-2">
                      Problem while creating meeting
                    </AlertTitle>
                  </div>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <label htmlFor="endTime" className="form-control w-full ">
                <div className="label">
                  <span className="label-text text-blue-700">
                    When should the meeting end?
                  </span>
                </div>

                <input
                  type="time"
                  id="endTime"
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
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      wrongTime: ((v: TZDate) => {
                        return (
                          isMeetingEndAfterOffset(v) ||
                          `Meeting must be at least ${MEETING_END_MINUTES_OFFSET} minutes long.`
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
                className="btn w-full mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {!isSubmitting && <span>Create Meeting</span>}
                {isSubmitting && (
                  <span className="loading loading-spinner"></span>
                )}
              </button>
            </form>
          </div>
        </div>
        <div className="w-full max-w-4xl text-center px-4 mt-16">
          <FAQSection />
        </div>
      </div>
    </>
  );
}
