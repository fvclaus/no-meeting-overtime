import { REQUIRED_SCOPES } from "@/shared/server_constants";
import { chromium, expect, Locator, Page } from "@playwright/test";
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
    let isVisible = false;
    try {
      await notVerified.waitFor({
        timeout: 20000,
      });
      // TODO Doesn't work any other way
      isVisible = true;
    } catch (error) {
      // Ignore
    }
    if (isVisible) {
      await continueButton.click();
    }
    await continueButton.click();
    if (scopes === REQUIRED_SCOPES) {
      await page.getByRole("checkbox", { name: "Select all" }).click();
    } else {
      for (const scope of scopes) {
        // eslint-disable-next-line no-await-in-loop
        await page.locator(`css=[data-value="${scope}"]`).click();
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
    // const page = defaultContext.pages()[0];
    // const page = await browser.newPage();
    await revokeGoogleSignIn();
    await page.goto("http://localhost:3000");
    await signInWithGoogleButton.click();
    await signInWithGoogle();
    await expect(createMeetingButton).toBeVisible();
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
    await signInWithGoogle([]);
    await expect(createMeetingButton).toBeVisible();
  });
});
