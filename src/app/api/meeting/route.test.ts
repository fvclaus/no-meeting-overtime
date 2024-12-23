import { describe, it, expect, vi, beforeEach } from "vitest";
import * as handler from "./route";
import { getCredentials, getSessionKey } from "@/app/session-store";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { add, formatISO } from "date-fns";
import { ZodIssue } from "zod";
import { saveMeeting } from "@/app/firestore";
import { CloudTasksClient } from "@google-cloud/tasks";

describe("/api/meeting/[meetingCode]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mock("./../../session-store");
    vi.mock("./../../firestore");
    vi.mock("googleapis");
    vi.mock("@google-cloud/tasks", () => {
      // This is necessary, but I don't understand why the mocking in the test doesn't work without it.
      const CloudTasksClient = vi.fn();
      CloudTasksClient.prototype.createTask = vi.fn(() =>
        Promise.resolve([{ name: "task123" }]),
      );
      CloudTasksClient.prototype.queuePath = vi.fn(() => "queuePath");
      return { CloudTasksClient };
    });
  });

  describe("POST", () => {
    it("should return 400 for invalid request body", async () => {
      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({ invalid: "data" }),
      });

      const response = await handler.POST(req);
      await expectBadRequest(response, {
        path: ["scheduledEndTime"],
        message: "Required",
      });
    });

    it("should fail if it is not a date", async () => {
      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({ scheduledEndTime: "foo" }),
      });

      const response = await handler.POST(req);
      await expectBadRequest(response, {
        path: ["scheduledEndTime"],
        message: "Invalid datetime",
      });
    });

    it("should fail if time is not far enough in the future", async () => {
      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({
          scheduledEndTime: formatISO(add(new Date(), { minutes: 2 })),
        }),
      });

      const response = await handler.POST(req);
      await expectBadRequest(response, {
        path: ["scheduledEndTime"],
        message: "Datetime must be 5 minutes in future",
      });
    });

    it("should return 403 if no credentials in session", async () => {
      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({
          scheduledEndTime: formatISO(add(new Date(), { minutes: 10 })),
        }),
      });

      const response = await handler.POST(req);
      expect(response.status).toBe(403);
      expect(await response.text()).toBe("No credentials in session");
    });

    it("should return 403 if no userId in session", async () => {
      vi.mocked(getCredentials).mockResolvedValue({} as any);

      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({
          scheduledEndTime: formatISO(add(new Date(), { minutes: 10 })),
        }),
      });

      const response = await handler.POST(req);
      expect(response.status).toBe(403);
      expect(await response.text()).toBe("No userId in session");
    });

    it("should return 500 if meeting creation fails", async () => {
      vi.mocked(getCredentials).mockResolvedValue({} as any);
      vi.mocked(getSessionKey).mockResolvedValue("userId");
      vi.mocked(google.meet).mockReturnValue({
        spaces: {
          create: vi.fn().mockRejectedValue(new Error("Google API error")),
        },
      } as any);

      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({
          scheduledEndTime: formatISO(add(new Date(), { minutes: 10 })),
        }),
      });

      const response = await handler.POST(req);
      expect(response.status).toBe(500);
      expect(await response.text()).toBe(
        "Creation of meeting failed: Google API error",
      );
    });

    it("should create a meeting and return the meeting data", async () => {
      vi.mocked(getCredentials).mockResolvedValue({} as any);
      vi.mocked(getSessionKey).mockResolvedValue("userId");
      vi.mocked(google.meet).mockReturnValue({
        spaces: {
          create: vi.fn().mockResolvedValue({
            data: {
              name: "Test Meeting",
              meetingUri: "https://meet.google.com/test-meeting",
              meetingCode: "meeting123",
            },
          }),
        },
      } as any);

      // const CloudTasksClientMock = vi.fn()
      // CloudTasksClientMock.prototype.createTask = vi.fn(() => Promise.resolve());
      // CloudTasksClientMock.prototype.queuePath = vi.fn(() => "queuePath");
      vi.mocked(CloudTasksClient.prototype.createTask).mockResolvedValue([
        { name: "task123" },
      ] as any);

      const req = new NextRequest("http://localhost/api/meeting", {
        method: "POST",
        body: JSON.stringify({
          scheduledEndTime: formatISO(add(new Date(), { minutes: 10 })),
        }),
      });

      const response = await handler.POST(req);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        name: "Test Meeting",
        meetingUri: "https://meet.google.com/test-meeting",
        meetingCode: "meeting123",
      });
      expect(vi.mocked(saveMeeting)).toHaveBeenCalledOnce();
    });
  });
});

async function expectBadRequest(
  response: NextResponse,
  error: Partial<ZodIssue>,
) {
  expect(response.status).toBe(400);
  const errors = await response.json();
  expect(errors[0]).toEqual(expect.objectContaining(error));
}
