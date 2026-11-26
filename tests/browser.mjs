// Run against a disposable, migrated PostgreSQL-backed application.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
try {
  for (const [width, locale, heading] of [
    [1366, "hi", "साइबर अपराध की शिकायत बनाएँ।"],
    [390, "pa", "ਸਾਈਬਰ ਅਪਰਾਧ ਦੀ ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰੋ।"],
  ]) {
    const context = await browser.newContext({
      baseURL,
      viewport: { width, height: 850 },
    });
    const page = await context.newPage();
    const password = randomUUID();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    try {
      await page.goto("/");
      await page.locator("header select").selectOption(locale);
      await page.getByRole("heading", { name: heading }).waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.locator("header select").selectOption("en");
      await page
        .getByRole("link", { name: "Start a complaint", exact: true })
        .click();
      await page.waitForURL("**/login?**");
      await page.getByRole("link", { name: "Create account" }).click();
      await page.locator("[name=name]").fill("Browser test");
      await page
        .locator("[name=email]")
        .fill("browser-" + randomUUID() + "@example.invalid");
      await page.locator("[name=password]").fill(password);
      await page.locator("[name=confirm]").fill("deliberate mismatch");
      await page.getByRole("button", { name: "Create account" }).click();
      await page
        .getByRole("alert")
        .getByText("Passwords must match.")
        .waitFor();
      await page.locator("[name=confirm]").fill(password);
      await page.getByRole("button", { name: "Create account" }).click();
      await page.waitForURL("**/assistant");
      const description =
        "I received a phishing email asking me to verify my account.";
      const send = async (value) => {
        await page.locator("textarea").fill(value);
        const saved = page.waitForResponse(
          (r) => r.url().endsWith("/chat") && r.request().method() === "POST",
        );
        await page.getByRole("button", { name: "Send", exact: true }).click();
        assert.equal((await saved).status(), 200);
        await page.getByRole("log").getByText(value, { exact: true }).waitFor();
      };
      await send(description);
      await send("Yesterday afternoon");
      await page.reload();
      await page
        .getByRole("log")
        .getByText(description, { exact: true })
        .waitFor();
      if (width < 600)
        await page.getByRole("button", { name: "Complaint details" }).click();
      await page
        .getByRole("link", { name: "Preview complaint" })
        .filter({ visible: true })
        .first()
        .click();
      await page.getByText(description, { exact: true }).first().waitFor();
      await page.getByRole("button", { name: "Edit details" }).click();
      await page
        .getByLabel("Incident description")
        .fill(description + " I kept the message.");
      await page.getByRole("button", { name: "Save changes" }).click();
      await page
        .getByText(description + " I kept the message.", { exact: true })
        .waitFor();
      const downloading = page.waitForEvent("download");
      await page
        .getByText("Download PDF", { exact: true })
        .filter({ visible: true })
        .first()
        .click();
      const download = await downloading;
      assert.equal(await download.failure(), null);
      assert.equal(
        (await readFile(await download.path())).subarray(0, 5).toString(),
        "%PDF-",
      );
      await page.goto("/dashboard");
      await page
        .getByText("Document generated", { exact: true })
        .first()
        .waitFor();
      await page.locator(".portal-stats a[href*=generated]").click();
      await page.waitForURL("**/complaints?filter=generated");
      await page.locator("tbody").getByText("Document generated").waitFor();
      await page.getByRole("link", { name: "Profile", exact: true }).click();
      await page.getByLabel("Full name").fill("Updated browser test");
      await page.getByRole("button", { name: "Save changes" }).click();
      await page.getByText("Changes saved.", { exact: true }).waitFor();
      assert.deepEqual(runtimeErrors, []);
      console.log("Passed authenticated complaint journey at " + width + "px");
    } finally {
      // Only this context's newly registered synthetic account is removed.
      await context.request.post("/api/account", {
        headers: { Origin: new URL(baseURL).origin },
        data: { action: "delete", password },
      });
      await context.close();
    }
  }
} finally {
  await browser.close();
}
