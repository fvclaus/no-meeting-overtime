// TODO Just copied to avoid problems with other env variables
export const REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.created",
];
import {
  BrowserContext,
  chromium,
  expect,
  Locator,
  Page,
} from "@playwright/test";
import {
  addSeconds,
  differenceInSeconds,
  format,
  formatISO,
  roundToNearestMinutes,
} from "date-fns";
import { afterEach, beforeEach, describe, it } from "node:test";

//google-chrome-stable --remote-debugging-port=9222
// eslint-disable-next-line @typescript-eslint/no-floating-promises
describe("test", { timeout: 200_000 }, () => {
  // eslint-disable-next-line init-declarations
  let page: Page;
  let context: BrowserContext;
  let signInWithGoogleButton: Locator;
  let createMeetingButton: Locator;

  async function revokeGoogleSignIn() {
    await page.goto("https://myaccount.google.com/connections");
    const thirdPartyLink = page.getByRole("link", {
      name: "No Meeting Overtime",
    });
    if (await thirdPartyLink.isVisible()) {
      await thirdPartyLink.click();
      await page
        .getByRole("button", { name: "Delete all connections" })
        .click();
      await page.getByRole("button", { name: "Confirm" }).click();
    }
  }

  async function signInWithGoogle(scopes: string[] = REQUIRED_SCOPES) {
    const continueButton = page.getByRole("button", { name: "Continue" });
    await page.waitForURL("**");
    // Select first account
    await page.locator('css=[data-authuser="0"]').click();
    await page.waitForURL("**");

    const notVerified = page.getByText(/given access/);
    const additionalAccess = page.getByText(/wants additional access/);
    const access = page.getByText(/wants access/);

    await expect(notVerified.or(additionalAccess).or(access)).toBeVisible();

    if (await notVerified.isVisible()) {
      await continueButton.click();
    }

    await expect(
      page.getByText("Sign in to No Meeting Overtime"),
    ).toBeVisible();
    await continueButton.click();

    await expect(additionalAccess.or(access)).toBeVisible();
    for (const scope of scopes) {
      const locator = page.locator(`css=[data-value="${scope}"]`);
      // eslint-disable-next-line no-await-in-loop
      if (await locator.isVisible()) {
        // eslint-disable-next-line no-await-in-loop
        await locator.click();
      }
    }
    await continueButton.click();
  }

  async function signInIfNecessary() {
    await page.goto("http://localhost:3000");
    const getStartedButton = page.getByRole("button", { name: "Get started" });
    await expect(signInWithGoogleButton.or(getStartedButton)).toBeVisible();
    if (await signInWithGoogleButton.isVisible()) {
      await signInWithGoogleButton.click();
      await signInWithGoogle();
      await expect(createMeetingButton).toBeVisible();
    } else {
      await getStartedButton.click();
    }
  }

  beforeEach(async () => {
    const browser = await chromium.connectOverCDP("http://localhost:9222", {
      slowMo: 200,
    });
    [context] = browser.contexts();
    page = await context.newPage();
    signInWithGoogleButton = page.getByRole("button", {
      name: "Sign in with Google",
    });
    createMeetingButton = page.getByRole("button", { name: "Create Meeting" });
  });

  afterEach(async () => {
    if (page != undefined) {
      await page.close();
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it("happy path", async () => {
    await signInIfNecessary();
    const shortMeetingEnd = addSeconds(Date.now(), 10);

    const response = await page
      .context()
      .request.post("http://localhost:3000/api/meeting", {
        data: {
          scheduledEndTime: formatISO(shortMeetingEnd),
        },
      });
    if (response.status() !== 200) {
      console.error(await response.text());
    }
    expect(response.status()).toEqual(200);
    const body = (await response.json()) as { meetingCode: string };
    await page.goto(`http://localhost:3000/meeting/${body.meetingCode}`);
    // const meetingEnd = roundToNearestMinutes(addSeconds(Date.now(), 65), {
    //   roundingMethod: "ceil",
    // });
    // await page
    //   .getByLabel("When should the meeting end?")
    //   .fill(format(meetingEnd, "HH:mm"));

    // await createMeetingButton.click();
    const successText = page.getByText(/Meeting with code .* created/);
    await expect(successText).toBeVisible({ timeout: 45_000 });
    const pagePromise = page
      .context()
      .waitForEvent("page", (p) =>
        p.url().startsWith("https://meet.google.com/"),
      );
    await page.getByRole("link", { name: "Join now" }).click();
    const newPage = await pagePromise;
    await newPage.bringToFront();
    await expect(
      newPage.getByRole("heading", {
        name: "Your host ended the meeting for everyone",
      }),
    ).toBeVisible({
      timeout: (differenceInSeconds(shortMeetingEnd, new Date()) + 10) * 1000,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it("should display login button after removing connection to app", async () => {
    await signInIfNecessary();
    await revokeGoogleSignIn();
    await page.goto("http://localhost:3000");
    await expect(signInWithGoogleButton).toBeVisible();
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it("should display missing scopes", async () => {
    await revokeGoogleSignIn();
    await page.goto("http://localhost:3000");
    await signInWithGoogleButton.click();
    await signInWithGoogle([]);
    await expect(signInWithGoogleButton).toBeVisible();
    await expect(page.getByText("Missing permission")).toBeVisible();
    await signInWithGoogleButton.click();
    // There is no selection, because it is only a single permission
    await signInWithGoogle();
    await expect(createMeetingButton).toBeVisible();
  });
});
