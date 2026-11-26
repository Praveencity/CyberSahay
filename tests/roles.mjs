// Requires an isolated migrated database and an application using that same DB.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";
const db = new PrismaClient(),
  origin = process.env.TEST_BASE_URL;
if (!origin) throw Error("Set TEST_BASE_URL for the isolated application");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const accounts = [],
  topic = "qr-refund",
  language = "pa",
  key = { topic_language: { topic, language } };
let ownsNote = false;
try {
  assert.equal(
    await db.guideNote.findUnique({ where: key }),
    null,
    "Use a clean test database",
  );
  for (let i = 0; i < 2; i++) {
    const page = await browser.newPage({ baseURL: origin });
    const email = randomUUID() + "@example.invalid",
      password = randomUUID();
    const reg = await page.request.post("/api/account", {
      headers: { Origin: origin },
      data: {
        action: "register",
        email,
        password,
        name: "Role test",
        role: "EDITOR",
      },
    });
    assert.equal((await reg.json()).user.role, "MEMBER");
    accounts.push({ page, email, password });
  }
  const [{ page, email }, { page: member }] = accounts;
  assert.equal(
    (
      await page.request.get("/api/editor?topic=qr-refund&language=pa")
    ).status(),
    403,
  );
  const draft = await member.request.post("/api/complaints", {
    headers: { Origin: origin },
    data: { language: "en" },
  });
  const id = (await draft.json()).complaint.id;
  await db.user.update({ where: { email }, data: { role: "EDITOR" } });
  assert.equal((await page.request.get("/api/complaints/" + id)).status(), 404);
  const editorPage = await page.goto("/editor");
  assert.equal(editorPage?.status(), 200);
  assert.equal(new URL(page.url()).pathname, "/editor");
  const editor = page.getByRole("main");
  await editor.getByRole("combobox", { name: "Guide", exact: true }).selectOption(topic);
  await editor.getByRole("combobox", { name: "Note language", exact: true }).selectOption(language);
  const note = "ਸੰਭਾਲਿਆ ਟੈਸਟ ਨੋਟ";
  await page.getByLabel("Public safety note").fill(note);
  await page.getByRole("button", { name: "Publish note" }).click();
  await page.getByText("Published.", { exact: true }).waitFor();
  ownsNote = true;
  await member.goto("/awareness/" + topic);
  await member.locator("header select").selectOption("pa");
  await member.getByText(note, { exact: true }).waitFor();
  const write = () =>
    page.request.put("/api/editor", {
      headers: { Origin: origin },
      data: { topic, language, version: 0, text: "Counterexample" },
    });
  assert.equal((await write()).status(), 409);
  await db.user.update({ where: { email }, data: { role: "MEMBER" } });
  assert.equal((await write()).status(), 403);
  console.log(
    "Role defaults, editor-only publication, localization, conflicts, revocation and complaint privacy passed.",
  );
} finally {
  if (ownsNote) await db.guideNote.delete({ where: key });
  for (const a of accounts)
    await db.user.deleteMany({ where: { email: a.email } });
  await db.$disconnect();
  await browser.close();
}
