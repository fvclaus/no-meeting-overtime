import { chromium, expect, Page } from "@playwright/test";
import { afterEach, beforeEach, describe, it } from "vitest";

//google-chrome-stable --remote-debugging-port=9222
describe("test", { timeout: 200_000 }, () => {
  // eslint-disable-next-line init-declarations
  let page: Page;

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

  async function signInWithGoogle() {
    const continueButton = page.getByRole("button", { name: "Continue" });
    await page.waitForURL("**");
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
    } catch (e) {
      // Ignore
    }
    if (isVisible) {
      await continueButton.click();
    }
    await continueButton.click();
    await page.getByRole("checkbox", { name: "Select all" }).click();
    await continueButton.click();
  }

  beforeEach(async () => {
    const browser = await chromium.connectOverCDP("http://localhost:9222", {
      slowMo: 200,
    });
    const [defaultContext] = browser.contexts();
    page = await defaultContext.newPage();
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
    await page.getByRole("button", { name: "Sign in with Google" }).click();
    await signInWithGoogle();
    await expect(
      page.getByRole("button", { name: "Create Meeting" }),
    ).toBeVisible();
    // TODO Verify Get started button
  });

  it("should display login button after removing connection to app", async () => {
    await page.goto("http://localhost:3000");
    const loginWithGoogle = page.getByRole("button", {
      name: "Sign in with Google",
    });
    const getStartedButton = page.getByRole("button", { name: "Get started" });
    await expect(loginWithGoogle.or(getStartedButton)).toBeVisible();
    if (await loginWithGoogle.isVisible()) {
      await loginWithGoogle.click();
      await signInWithGoogle();
      await expect(
        page.getByRole("button", { name: "Create Meeting" }),
      ).toBeVisible();
    }
    await revokeGoogleSignIn();
    await page.goto("http://localhost:3000");
    await expect(loginWithGoogle).toBeVisible();
  });

  it("should display missing scopes", async () => {});
});
