// Requires an isolated migrated database and an application using that same DB.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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
  const visitor = await browser.newPage({ baseURL: origin });
  assert.equal((await visitor.request.post("/api/admin/accounts", {
    headers: { Origin: origin },
    data: { email: "visitor@example.invalid" },
  })).status(), 401);
  await visitor.goto("/admin");
  assert.equal(new URL(visitor.url()).searchParams.get("next"), "/admin");
  await visitor.close();

  assert.equal(
    await db.guideNote.findUnique({ where: key }),
    null,
    "Use a clean test database",
  );
  for (let i = 0; i < 3; i++) {
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
        role: "ADMIN",
      },
    });
    const { user } = await reg.json();
    assert.equal(user.role, "MEMBER");
    accounts.push({ page, email, password, id: user.id });
  }
  const [editorAccount, { page: member }, adminAccount] = accounts;
  const { page, email } = editorAccount;
  const { page: admin } = adminAccount;
  const changeRole = (actor, data) => actor.request.patch("/api/admin/accounts", {
    headers: { Origin: origin },
    data,
  });
  const lookup = (actor) => actor.request.post("/api/admin/accounts", {
    headers: { Origin: origin },
    data: { email },
  });
  const promote = { id: editorAccount.id, currentRole: "MEMBER", role: "EDITOR" };
  assert.equal((await member.goto("/admin")).status(), 404);
  assert.equal((await lookup(member)).status(), 403);
  assert.equal((await changeRole(member, promote)).status(), 403);
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

  execFileSync(process.execPath, ["scripts/set-role.mjs", adminAccount.email, "ADMIN"]);
  const loginPage = await browser.newPage({ baseURL: origin });
  await loginPage.goto("/admin");
  const mode = loginPage.getByRole("combobox", { name: "Sign in as" });
  await mode.locator('option:checked[value="admin"]').waitFor({ state: "attached" });
  await loginPage.getByLabel("Email address").fill(editorAccount.email);
  await loginPage.getByLabel("Password", { exact: true }).fill(editorAccount.password);
  await loginPage.getByRole("button", { name: "Sign in", exact: true }).click();
  await loginPage.getByRole("alert").getByText("This account does not have Admin access.").waitFor();
  await mode.selectOption("user");
  await loginPage.getByRole("button", { name: "Sign in", exact: true }).click();
  await loginPage.waitForURL("**/dashboard");
  await loginPage.context().clearCookies();
  await loginPage.goto("/login");
  await mode.selectOption("admin");
  await loginPage.getByLabel("Email address").fill(adminAccount.email);
  await loginPage.getByLabel("Password", { exact: true }).fill(adminAccount.password);
  await loginPage.getByRole("button", { name: "Sign in", exact: true }).click();
  await loginPage.waitForURL("**/admin");
  await loginPage.close();
  assert.equal((await admin.request.get("/api/complaints/" + id)).status(), 404);
  assert.equal((await admin.request.get("/api/editor?topic=qr-refund&language=pa")).status(), 403);
  const found = await lookup(admin);
  assert.equal(found.status(), 200);
  assert.deepEqual((await found.json()).account, {
    id: editorAccount.id,
    name: "Role test",
    email,
    role: "MEMBER",
  });
  assert.equal((await changeRole(admin, { ...promote, role: "ADMIN" })).status(), 400);
  assert.equal((await changeRole(admin, { ...promote, id: adminAccount.id })).status(), 409);
  await admin.goto("/");
  await admin.getByRole("link", { name: "Admin", exact: true }).click();
  await admin.getByRole("heading", { name: "Manage account roles" }).waitFor();
  await admin.getByRole("textbox", { name: "Email address" }).fill(email);
  await admin.getByRole("button", { name: "Find account" }).click();
  await admin.getByRole("combobox", { name: "Account access" }).selectOption("EDITOR");
  await admin.getByRole("button", { name: "Save role" }).click();
  await admin.getByRole("status").getByText("Changes saved.").waitFor();
  assert.equal((await changeRole(admin, promote)).status(), 409);
  assert.equal((await lookup(page)).status(), 403);
  assert.equal((await changeRole(page, promote)).status(), 403);

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
  assert.equal((await changeRole(admin, {
    id: editorAccount.id,
    currentRole: "EDITOR",
    role: "MEMBER",
  })).status(), 200);
  assert.equal((await write()).status(), 403);
  await db.user.update({ where: { email: adminAccount.email }, data: { role: "MEMBER" } });
  assert.equal((await changeRole(admin, promote)).status(), 403);
  console.log(
    "Admin role management, editor publication, localization, conflicts, revocation and complaint privacy passed.",
  );
} finally {
  if (ownsNote) await db.guideNote.delete({ where: key });
  for (const a of accounts)
    await db.user.deleteMany({ where: { email: a.email } });
  await db.$disconnect();
  await browser.close();
}
