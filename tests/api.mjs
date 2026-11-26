import { spawnSync } from "node:child_process";
// Run against a disposable running instance. All created accounts are deleted.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
function client() {
  let cookie = "";
  return async (path, method = "GET", data) => {
    const multipart = data instanceof FormData;
    const res = await fetch(origin + "/api/" + path, {
      method,
      headers: { origin, cookie, ...(!multipart && data !== undefined && { "content-type": "application/json" }) },
      body: multipart || data === undefined ? data : JSON.stringify(data),
    });
    if (res.headers.get("set-cookie"))
      cookie = res.headers.get("set-cookie").split(";")[0];
    const result = res.headers.get("content-type")?.includes("json")
      ? await res.json()
      : Buffer.from(await res.arrayBuffer());
    return {
      status: res.status,
      ...(Buffer.isBuffer(result) ? { bytes: result } : result),
    };
  };
}
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l2UAAAAASUVORK5CYII=", "base64");
function evidenceForm(description, binary = png) {
  const form = new FormData();
  form.set("file", new Blob([binary], { type: "image/png" }), "evidence-screenshot.png");
  form.set("note", "Screenshot of the message <saved>");
  if (description !== undefined) form.set("description", description);
  return form;
}

const a = client(),
  b = client(),
  password = randomUUID(),
  email = randomUUID() + "@example.invalid";
try {
  assert.equal((await a("complaints")).status, 401);
  assert.equal(
    (
      await a("account", "POST", {
        action: "register",
        email,
        password: "short",
        name: "Test",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a("account", "POST", {
        action: "register",
        email,
        password,
        name: "Test",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await b("account", "POST", {
        action: "register",
        email,
        password,
        name: "Test",
      })
    ).status,
    409,
  );
  assert.equal((await a("account", "POST", { action: "logout" })).status, 200);
  assert.equal(
    (
      await a("account", "POST", {
        action: "login",
        email,
        password: "incorrect",
      })
    ).status,
    401,
  );
  assert.equal(
    (await a("account", "POST", { action: "login", email, password })).status,
    200,
  );
  assert.equal(
    (
      await b("account", "POST", {
        action: "register",
        email: randomUUID() + "@example.invalid",
        password,
        name: "Test B",
      })
    ).status,
    200,
  );
  const { complaint } = await a("complaints", "POST", { language: "hi" });
  const url = "complaints/" + complaint.id;
  for (const [path, method, data] of [
    [url, "GET"],
    [url, "PATCH", { version: 0, answers: {} }],
    [url, "DELETE"],
    [url + "/pdf", "GET"],
    [url + "/chat", "POST", { version: 0, text: "Test" }],
  ]) {
    assert.equal((await b(path, method, data)).status, 404);
  }
  assert.equal(
    (await a(url + "/chat", "POST", { version: 0, text: "My OTP is 654321" }))
      .status,
    400,
  );
  const sent = await a(url + "/chat", "POST", {
    version: 0,
    text: "मुझे एक फ़िशिंग ईमेल मिला।",
  });
  assert.equal(sent.status, 200);
  assert.equal(sent.complaint.messages.length, 2);
  assert.equal(
    (await a(url, "PATCH", { version: 0, answers: { date: "Monday" } })).status,
    409,
  );
  const edited = await a(url, "PATCH", {
    version: 1,
    category: "phishing",
    answers: { platform: "ईमेल" },
  });
  assert.equal(edited.complaint.answers.platform, "ईमेल");
  for (const lang of ["en", "hi", "hi-Latn", "pa"]) {
    const { complaint: c } = await a(url);
    assert.equal(
      (await a(url, "PATCH", { version: c.version, language: lang })).status,
      200,
    );
    const pdf = await a(url + "/generate", "POST");
    assert.equal(pdf.status, 200);
    assert.equal(pdf.bytes.subarray(0, 5).toString(), "%PDF-");
    assert.ok(pdf.bytes.length > 10000);
    if (process.env.CHECK_PDF_TEXT) {
      const extracted = spawnSync("pdftotext", ["-", "-"], {
        input: pdf.bytes,
        encoding: "utf8",
      });
      assert.equal(extracted.status, 0);
      assert.ok(
        extracted.stdout.includes(
          { en: "Subject", hi: "ईमेल", "hi-Latn": "Vishay", pa: "ਪੁਲਿਸ" }[lang],
        ),
        "Missing rendered text in " + lang,
      );
    }
  }
  assert.equal((await a("complaints")).stats.generated, 1);
  assert.equal((await a(url, "DELETE")).status, 200);
  assert.equal((await a(url)).status, 404);

  const createEvidence = "complaints/evidence";
  assert.equal((await a(createEvidence, "POST", evidenceForm("A suspicious email.", Buffer.from("arbitrary text masquerading as a png")))).status, 415);
  const opening = evidenceForm("I received a suspicious email.");
  opening.set("fromChat", "1");
  const startReport = await a(createEvidence, "POST", opening);
  assert.equal(startReport.status, 200);
  assert.equal(startReport.files.length, 1);
  assert.equal(startReport.complaint.messages.length, 2);
  assert.equal(startReport.files[0].bytes, undefined);
  const reportUrl = "complaints/" + startReport.complaint.id;
  const initialReport = await a(reportUrl);
  assert.equal(initialReport.complaint.answers.description, "I received a suspicious email.");
  assert.equal(initialReport.files.length, 1);
  assert.equal(initialReport.files[0].bytes, undefined);

  const ownerFile = initialReport.files[0];
  const fileUrl = reportUrl + "/evidence/" + ownerFile.id;
  assert.equal((await b(reportUrl + "/evidence")).status, 404);
  assert.equal((await b(fileUrl)).status, 404);
  assert.deepEqual((await a(fileUrl)).bytes, png);

  const upload = evidenceForm();
  upload.set("version", String(initialReport.complaint.version));
  upload.set("answer", "Tuesday");
  const attached = await a(reportUrl + "/evidence", "POST", upload);
  assert.equal(attached.status, 200);
  assert.equal(attached.files.length, 2);
  assert.equal(attached.complaint.answers.date, "Tuesday");
  assert.equal(attached.version, initialReport.complaint.version + 1);
  assert.equal((await a(reportUrl + "/evidence", "POST", upload)).status, 409);

  const withEvidence = await a(reportUrl + "/generate", "POST");
  assert.equal(withEvidence.status, 200);
  assert.equal(withEvidence.bytes.subarray(0, 5).toString(), "%PDF-");
  if (process.env.CHECK_PDF_TEXT) {
    const extracted = spawnSync("pdftotext", ["-", "-"], { input: withEvidence.bytes, encoding: "utf8" });
    assert.equal(extracted.status, 0);
    assert.match(extracted.stdout, /evidence-screenshot\.png/);
    assert.match(extracted.stdout, /Screenshot of the message <saved>/);
  }

  const updated = await a(reportUrl + "/evidence");
  assert.equal((await b(fileUrl, "DELETE", { version: updated.version })).status, 404);
  assert.equal((await a(fileUrl, "DELETE", { version: attached.version })).status, 409);
  const removed = await a(fileUrl, "DELETE", { version: updated.version });
  assert.equal(removed.status, 200);
  assert.equal(removed.files.length, 1);
  assert.equal((await a(fileUrl)).status, 404);
  assert.equal((await a(reportUrl, "DELETE")).status, 200);
  assert.equal((await a(reportUrl + "/evidence/" + removed.files[0].id)).status, 404);
  console.log(
    "Authentication, ownership, CRUD, conflict detection, evidence attachments and multilingual PDF checks passed.",
  );
} finally {
  await Promise.all(
    [a, b].map((request) =>
      request("account", "POST", { action: "delete", password }),
    ),
  );
}
