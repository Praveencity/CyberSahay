// Local browser regression with synthetic API responses; no database writes.
// Run: node --env-file=.env tests/conflicts.mjs (against npm run dev).
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { sealData } from "iron-session";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
try {
  const context = await browser.newContext({ baseURL });
  await context.addCookies([{
    name: "portal_session",
    value: await sealData({ uid: "conflict-test", version: 0 }, {
      password: process.env.AUTH_SECRET,
      ttl: 43200,
    }),
    url: baseURL,
  }]);
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  let latest = {
    id: "conflict-test", category: "other", language: "en", version: 1,
    answers: { description: "An incident to review." }, messages: [],
  };
  let rejectSave = true;
  let failReload = false;
  let saved;
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    let status = 200;
    let data;
    if (path === "/api/account") data = { user: { name: "Test", role: "MEMBER" } };
    else if (path === "/api/complaints") data = { complaints: [latest] };
    else if (request.method() === "GET") {
      status = failReload ? 503 : 200;
      data = failReload ? { error: "offline" } : { complaint: latest };
    } else if (rejectSave) {
      status = 409;
      data = { error: "This draft changed. Reload before continuing." };
    } else {
      saved = request.postDataJSON();
      latest = { ...latest, version: latest.version + 1,
        answers: { ...latest.answers, ...saved.answers } };
      data = { complaint: latest };
    }
    await route.fulfill({ status, json: data });
  });
  await page.goto("/assistant?id=conflict-test");
  const send = page.getByRole("button", { name: "Send", exact: true });
  await page.locator("textarea").fill("My unsent answer");
  await page.locator("textarea").press("Enter");
  const reload = page.getByRole("button", { name: "Load latest draft" });
  await reload.waitFor();
  assert.equal(await send.isDisabled(), true);
  failReload = true;
  await reload.click();
  await page.getByText("The request failed. Please try again.", { exact: true }).waitFor();
  assert.equal(await page.locator("textarea").inputValue(), "My unsent answer");
  assert.equal(await send.isDisabled(), true);
  failReload = false;
  latest = { ...latest, version: 2 };
  await reload.click();
  await reload.waitFor({ state: "hidden" });
  assert.equal(await page.locator("textarea").inputValue(), "My unsent answer");
  rejectSave = false;
  await send.click();
  await page.waitForFunction(() => document.querySelector("textarea")?.value === "");
  assert.equal(saved.version, 2);

  await page.goto("/complaints/conflict-test/preview");
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByLabel("Incident description").fill("Unsaved local change");
  latest = { ...latest, version: 4, answers: { description: "Updated in another tab." } };
  rejectSave = true;
  const save = page.getByRole("button", { name: "Save changes" });
  await save.click();
  await reload.waitFor();
  assert.equal(await save.isDisabled(), true);
  assert.equal(await page.getByLabel("Incident description").inputValue(), "Unsaved local change");
  await reload.click();
  await page.getByText("Updated in another tab.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByLabel("Incident description").fill("Reviewed and updated");
  rejectSave = false;
  await save.click();
  await page.getByText("Reviewed and updated", { exact: true }).waitFor();
  assert.equal(saved.version, 4);
  assert.deepEqual(runtimeErrors, []);
  console.log("Passed chat and review conflict recovery, including a failed reload.");
  await context.close();
} finally {
  await browser.close();
}
