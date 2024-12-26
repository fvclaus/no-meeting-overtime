import { chromium, expect } from "@playwright/test";
import { describe, it } from "vitest";

//google-chrome-stable --remote-debugging-port=9222
describe("test", () => {
  it(
    "should work",
    {
      timeout: 200_000,
    },
    async () => {
      const browser = await chromium.connectOverCDP("http://localhost:9222", {
        slowMo: 200,
      });
      const defaultContext = browser.contexts()[0];
      const page = await defaultContext.newPage();
      // const page = defaultContext.pages()[0];
      // const page = await browser.newPage();
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
      await page.goto("http://localhost:3000");
      await page.getByRole("button", { name: "Sign in with Google" }).click();
      const continueButton = page.getByRole("button", { name: "Continue" });
      await page.waitForURL("**");
      await page.locator('css=[data-authuser="0"]').click();
      await page.waitForURL("**");

      const notVerified = page.getByText(/given access/);
      let isVisible = false;
      try {
        await notVerified.waitFor({
          timeout: 20_000,
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
      await expect(
        page.getByRole("button", { name: "Create Meeting" }),
      ).toBeVisible();
    },
  );
});
