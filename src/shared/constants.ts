import { addMinutes, isAfter } from "date-fns";

export const START_MEETING_PATH = "/meeting/start";
export const MEETING_END_MINUTES_OFFSET = parseInt(
  process.env.NEXT_PUBLIC_MEETING_END_MINUTES_OFFSET || "5",
  10,
);
if (isNaN(MEETING_END_MINUTES_OFFSET)) {
  throw new Error("Missing or invalid MINUTES_OFFSET");
}

export function isMeetingEndAfterOffset(meetingEnd: Date) {
  const earliestEndTime = addMinutes(new Date(), MEETING_END_MINUTES_OFFSET);
  return isAfter(meetingEnd, earliestEndTime);
}
export const MEETINGS_URL = "/meetings";
export const REDIRECT_TO_AUTHORIZATION_API_URL = `/api/redirect-to-authorization`;
export const HAS_ACCEPTED_PRIVACY_POLICY = "hasAcceptedPrivacyPolicy";
