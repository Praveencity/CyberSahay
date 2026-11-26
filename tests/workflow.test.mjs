import test from "node:test";
import assert from "node:assert/strict";
import {
  categories,
  fields,
  classify,
  label,
  question,
  nextField,
  isRequired,
  progress,
  UNKNOWN,
  SKIPPED,
  NOT_APPLICABLE,
  sensitive,
} from "../src/lib/workflow.js";
import { draftReply } from "../src/lib/ai.js";

test("category-specific questions and human-readable translations cover every flow", () => {
  assert.equal(categories.length, 10);
  for (const category of categories) {
    for (const lang of ["en", "hi", "hi-Latn", "pa"]) {
      assert.notEqual(label(category, lang), category);
      for (const id of fields(category)) {
        assert.notEqual(question(id, lang), id);
        if (lang !== "en")
          assert.notEqual(question(id, lang), question(id, "en"));
      }
    }
  }
  assert.ok(fields("payment").includes("reference"));
  assert.ok(!fields("harassment").includes("reference"));
});
test("classification recognizes multiple languages and defaults to other", () => {
  assert.equal(classify("The UPI transfer went through"), "payment");
  assert.equal(classify("मेरे खाते को हैक किया गया"), "social");
  assert.equal(classify("ਨੌਕਰੀ ਲਈ ਪੈਸੇ ਮੰਗੇ"), "job");
  assert.equal(classify("Naukri ke liye fees maangi"), "job");
  assert.equal(classify("Mere account se paise kat gaye"), "payment");
  assert.equal(classify("Something unusual happened"), "other");
});
test("unknowns and skipped fields advance the conversation without inventing information", () => {
  for (const state of [UNKNOWN, SKIPPED, NOT_APPLICABLE]) {
    const answers = { description: "My profile was copied", date: state };
    assert.equal(nextField("identity", answers), "time");
    assert.equal(
      progress("identity", answers),
      Math.round(100 / fields("identity").filter(isRequired).length),
    );
  }
  assert.equal(progress("payment", {}), 0);
  const all = Object.fromEntries(
    fields("payment").map((id) => [id, "User answer"]),
  );
  assert.equal(progress("payment", all), 100);
  assert.equal(nextField("payment", all), null);
});
test("credential warning handles common patterns across scripts", () => {
  for (const value of [
    "OTP is 123456",
    "mera OTP hai 123456",
    "password tha abc",
    "पिन १२३४",
    "ਪਿੰਨ ੧੨੩੪",
    "my password: abc",
    "1234 5678 9012 3456",
  ])
    assert.equal(sensitive(value), true);
  assert.equal(sensitive("They asked me for an OTP."), false);
});
test("AI writes opening and follow-up questions without receiving personal answers", async (t) => {
  const keys = ["AI_API_KEY", "AI_MODEL", "AI_BASE_URL"];
  const prev = keys.map((k) => process.env[k]);
  t.after(() => keys.forEach((k, i) => {
    if (prev[i] === undefined) delete process.env[k];
    else process.env[k] = prev[i];
  }));
  const opening = {
    answers: { description: "UPI payment by victim@example.org via Paytm" },
    opening: true, language: "en",
  };
  delete process.env.AI_API_KEY;
  assert.equal((await draftReply(opening)).message.source, "aiOff");
  Object.assign(process.env, {
    AI_API_KEY: "test-only", AI_MODEL: "test-model",
    AI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/openai",
  });
  const calls = [];
  let providerReply = { category: "shopping", field: "date", question: "When did this purchase take place?" };
  const mock = t.mock.method(globalThis, "fetch", async (url, opts) => {
    calls.push({ url: url.href, body: JSON.parse(opts.body) });
    return Response.json({ choices: [{ message: { content: JSON.stringify(providerReply) } }] });
  });
  const first = await draftReply(opening);
  assert.equal(first.category, "shopping");
  assert.equal(first.answers.platform, "Paytm");
  assert.equal(first.message.source, "aiGemini");
  assert.equal(first.message.text, providerReply.question);

  const followup = { answers: { ...first.answers, date: "19 March 2025" }, category: first.category, language: "hi" };
  providerReply = { category: "shopping", field: "time", question: "खरीदारी लगभग किस समय हुई थी?" };
  const second = await draftReply(followup);
  assert.equal(second.message.text, providerReply.question);
  assert.equal(second.message.source, "aiGemini");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
  const context = JSON.parse(calls[1].body.messages[1].content);
  assert.deepEqual(context.fieldByCategory, { shopping: "time" });
  assert.equal(context.language, "hi");
  assert.ok(context.keywords.includes("upi"));
  assert.doesNotMatch(JSON.stringify(calls), /victim@|19 March|test-only|via Paytm/);

  providerReply.field = "contact";
  assert.equal((await draftReply(followup)).message.source, "aiInvalid");
  for (const [status, expected] of [[429, "aiQuota"], [403, "aiAccess"], [404, "aiConfig"], [503, "aiUnavailable"]]) {
    mock.mock.mockImplementation(async () => new Response(null, { status }));
    const fallback = await draftReply(opening);
    assert.equal(fallback.message.source, expected);
    assert.equal(fallback.category, "payment");
    assert.equal(fallback.message.text, question("date", "en"));
  }
  mock.mock.mockImplementation(async () => { throw Error("unavailable"); });
  assert.equal((await draftReply(followup)).message.source, "aiUnavailable");
  const before = mock.mock.callCount();
  const done = await draftReply({ category: "payment", language: "en", answers: Object.fromEntries(fields("payment").map(k => [k, "answered"])) });
  assert.ok(done.complete);
  assert.equal(mock.mock.callCount(), before);
});
import { extractFacts } from "../src/lib/workflow.js";
test("extracts explicit details without guessing dates, ambiguous amounts or absent facts", () => {
  assert.deepEqual(
    extractFacts(
      "I sent ₹2,500 via PhonePe.\nIncident date: 13 March",
      "payment",
    ),
    { amount: "₹2,500", platform: "PhonePe", date: "13 March" },
  );
  assert.deepEqual(
    extractFacts("They asked for ₹500 then ₹800 on Tuesday.", "payment"),
    {},
  );
  assert.deepEqual(extractFacts("I never sent ₹1,000.", "payment"), {});
  assert.deepEqual(extractFacts("घटना की तारीख: २ अक्टूबर", "other"), {
    date: "२ अक्टूबर",
  });
  assert.deepEqual(
    extractFacts("I sent ₹10 on Telegram via PhonePe", "phishing"),
    {},
  );
});

test("development accepts same-port loopback aliases and preserves cross-origin rejection", async () => {
  const { allowedOrigin } = await import("../src/lib/origin.js");
  const expected = "http://localhost:3000";
  const alias = "http://127.0.0.1:3000";
  assert.ok(allowedOrigin(alias, expected, "127.0.0.1:3000", true));
  for (const bad of [
    null,
    "null",
    "https://example.org",
    "http://127.0.0.1:3001",
    "https://127.0.0.1:3000",
  ]) {
    assert.equal(allowedOrigin(bad, expected, "127.0.0.1:3000", true), false);
  }
  assert.equal(allowedOrigin(alias, expected, "localhost:3000", true), false);
  assert.equal(allowedOrigin(alias, expected, "127.0.0.1:3000", false), false);
});

test("image pastes preserve the original file and leave plain text to the browser", async () => {
  const { clipboardImage, maxEvidenceBytes } = await import("../src/config/evidence.js");
  const file = new File(["image data"], "Screenshot.png", { type: "image/png" });
  const text = { kind: "string", type: "text/plain" };
  const item = { kind: "file", getAsFile: () => file };
  assert.equal(clipboardImage({ items: [text] }), null);
  assert.equal(clipboardImage({ files: [file], items: [item] }).file, file);
  assert.equal(clipboardImage({ items: [text, item] }).file, file);
  assert.equal(clipboardImage({ files: [file, file] }).error, "onePaste");
  assert.equal(clipboardImage({ files: [new File(["x"], "icon.svg", { type: "image/svg+xml" })] }).error, "pasteFormats");
  assert.equal(clipboardImage({ files: [{ type: "image/png", size: maxEvidenceBytes + 1 }] }).error, "Each file must be 10 MB or smaller.");
});

test("Hinglish guides, draft fields and UI use Latin script", async () => {
  const lang = "hi-Latn";
  const { awarenessLanguages, awarenessPath, awarenessText, guideCopy } = await import("../src/config/awareness-language.js");
  const { guides } = await import("../src/config/awareness.js");
  const { words } = await import("../src/components/portal/words.js");
  assert.equal(awarenessLanguages[lang], "Hinglish");
  assert.equal(awarenessText(lang, "Guide language"), "Guide ki language");
  for (const slug of Object.keys(guides)) {
    const copy = guideCopy(slug, lang);
    assert.equal(copy.length, 4);
    for (const [i, paragraph] of copy.entries()) {
      assert.notEqual(paragraph, guideCopy(slug, "en")[i]);
      assert.doesNotMatch(paragraph, /\p{Script=Devanagari}/u);
    }
  }
  assert.equal(awarenessPath({ slug: "sim-swap", lang }), "/awareness/sim-swap?lang=hi-Latn");
  assert.equal(words("send", lang), "Bhejein");
  assert.equal(label("subject", lang), "Vishay");
  assert.deepEqual(extractFacts("Ghatna ki tareekh: 5 June", "other"), { date: "5 June" });
});
