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

import { ArrowRight, Plus } from "lucide-react";
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

  // TODO Add start date and status
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(navigator.language, {
      year: "numeric",
      month: "numeric",
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
      <div className="w-full bg-blue-50 py-16 text-gray-600 flex flex-col items-center">
        <div className="px-4 max-w-4xl w-full flex flex-col">
          <Link
            href={START_MEETING_PATH}
            role="button"
            variant="button"
            className="ml-auto"
          >
            Create New Meeting
            <Plus className="inline ml-2 h-5 w-5" />
          </Link>
          <section className="w-full ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg">Scheduled End Time</TableHead>
                  <TableHead className="text-lg">Meeting Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingsView.map((meeting) => (
                  <TableRow>
                    <TableCell className="font-medium">
                      {meeting.formattedScheduledEndTime ? (
                        <span className="text-base">
                          {meeting.formattedScheduledEndTime}
                        </span>
                      ) : (
                        <Skeleton className="h-4 w-[100px]" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={meeting.uri}
                        target="_blank"
                        className="text-base"
                      >
                        {meeting.meetingCode}
                      </Link>
                    </TableCell>
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
