import { REQUIRED_SCOPES } from "@/shared/server_constants";
import { chromium, expect, Locator, Page } from "@playwright/test";
import { addSeconds, format, roundToNearestMinutes } from "date-fns";
import { afterEach, beforeEach, describe, it } from "vitest";

//google-chrome-stable --remote-debugging-port=9222
describe("test", { timeout: 200_000 }, () => {
  // eslint-disable-next-line init-declarations
  let page: Page;
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
    const [defaultContext] = browser.contexts();
    page = await defaultContext.newPage();
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

  it("happy path", async () => {
    await signInIfNecessary();
    const meetingEnd = roundToNearestMinutes(addSeconds(Date.now(), 65), {
      roundingMethod: "ceil",
    });

    await page
      .getByLabel("When should the meeting end?")
      .fill(format(meetingEnd, "HH:mm"));

    await createMeetingButton.click();
    const successText = page.getByText(/Meeting with code .* created/);
    await expect(successText).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("link", { name: "Join now" })).toBeVisible();

    // TODO Verify Get started button
  });

  it("should display login button after removing connection to app", async () => {
    await signInIfNecessary();
    await revokeGoogleSignIn();
    await page.goto("http://localhost:3000");
    await expect(signInWithGoogleButton).toBeVisible();
  });

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
