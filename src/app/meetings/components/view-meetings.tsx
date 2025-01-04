"use client";

import { formatEndTime } from "@/app/formattedEndTime";
import { Meeting, MeetingAndCode } from "@/types";
import { Title } from "@/components/ui/title";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ArrowRight } from "lucide-react";
import Link from "@/app/Link";
import { START_MEETING_PATH } from "@/shared/constants";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewMeetings({
  meetings,
}: {
  meetings: MeetingAndCode[];
}) {
  const [meetingsView, setMeetingsView] =
    useState<(MeetingAndCode & { formattedScheduledEndTime?: string })[]>(
      meetings,
    );

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setMeetingsView(
      meetings.map((meeting) => ({
        ...meeting,
        formattedScheduledEndTime: formatter.format(
          new Date(meeting.scheduledEndTime),
        ),
      })),
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <Title subtitle="My Meetings" />
      <div className="w-full bg-blue-50 py-16 text-gray-600">
        <div className="px-4 flex flex-col items-center">
          <Link href={START_MEETING_PATH} role="button" variant="button">
            Create New Meeting
            <ArrowRight className="inline ml-2 h-5 w-5" />
          </Link>
          <section>
            <Table>
              <TableCaption>A list of your recent invoices.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    Scheduled End Time
                  </TableHead>
                  <TableHead>Meeting Code</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingsView.map((meeting) => (
                  <TableRow>
                    <TableCell className="font-medium">
                      {meeting.formattedScheduledEndTime ? (
                        meeting.formattedScheduledEndTime
                      ) : (
                        <Skeleton className="h-4 w-[100px]" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={meeting.uri} target="_blank">
                        {meeting.meetingCode}
                      </Link>
                    </TableCell>
                    <TableCell>Unknown</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </div>
      </div>
    </div>
  );
}
