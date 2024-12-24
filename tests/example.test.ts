import { chromium } from "@playwright/test";
import { describe, it } from "vitest";

//google-chrome-stable --remote-debugging-port=9222
describe("test", () => {
  it("should work", async () => {
    const browser = await chromium.connectOverCDP("http://localhost:9222", {
      slowMo: 50,
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
      await page.getByRole("link", { name: /Delete all connections/ }).click();
    } else {
      throw new Error("Should not happen");
    }
    await page.goto("http://localhost:3000");
  });
});
