import { categories, classify, extractFacts, nextField, question } from "./workflow.js";
import { patterns } from "../config/categories.js";

// A closed vocabulary keeps names, account numbers and user instructions local.
const contextPattern =
  /\b(?:email|message|attachment|bank|instagram|facebook|whatsapp|recovery|login|refund|delivery|parcel|returns|recruitment|advertisement|loan|loan app|verification|link|romance|voucher)\b|ईमेल|संदेश|बैंक|पार्सल|लिंक|ਈਮੇਲ|ਸੁਨੇਹਾ|ਬੈਂਕ|ਪਾਰਸਲ|ਲਿੰਕ/giu;
const completion = {
  "hi-Latn": "Aapka draft check karne ke liye taiyaar hai.",
  en: "Your draft is ready for review.",
  hi: "आपका मसौदा समीक्षा के लिए तैयार है।",
  pa: "ਤੁਹਾਡਾ ਖਰੜਾ ਸਮੀਖਿਆ ਲਈ ਤਿਆਰ ਹੈ।",
};

function keywords(text) {
  const signals = new Set();
  for (const pattern of [...Object.values(patterns), contextPattern]) {
    for (const match of text.toLowerCase().match(pattern) || [])
      signals.add(match);
  }
  return [...signals];
}

function failureStatus(code) {
  if (code === 429) return "aiQuota";
  if (code === 401 || code === 403) return "aiAccess";
  if (code === 400 || code === 404) return "aiConfig";
  return "aiUnavailable";
}

// The server chooses the field for each possible category. The provider can
// phrase that question but cannot write answers or change the report schema.
export async function draftReply({ answers, category, opening, language }) {
  const lang = Object.hasOwn(completion, language) ? language : "en";
  const signals = keywords(answers.description);
  const local = opening ? classify(answers.description) : category;
  const choices = opening && signals.length ? categories : [local];
  const candidates = {};
  const prompts = {};
  for (const id of choices) {
    const facts = opening
      ? { ...extractFacts(answers.description, id), ...answers }
      : answers;
    const field = nextField(id, facts);
    candidates[id] = { answers: facts, field };
    if (field) prompts[field] = question(field, lang);
  }
  function result(id, source, wording) {
    const { answers: saved, field } = candidates[id];
    return {
      category: id,
      answers: saved,
      complete: !field,
      message: {
        role: "assistant",
        text: wording || (field ? prompts[field] : completion[lang]),
        ...(field && { field, language: lang, source }),
      },
    };
  }
  if (!candidates[local].field) return result(local);
  if (!process.env.AI_API_KEY || !process.env.AI_MODEL) return result(local, "aiOff");
  try {
    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    const url = new URL(base + "/chat/completions");
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))
      return result(local, "aiConfig");
    const fieldByCategory = Object.fromEntries(choices.map((id) => [id, candidates[id].field]));
    const response = await fetch(url, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(18000),
      headers: {
        Authorization: "Bearer " + process.env.AI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages: [
          { role: "system", content: "Help a person draft a cyber incident report. Choose the best category from fieldByCategory based on the keywords, using other if uncertain and available. Use the exact field mapped to that category. Rephrase its supplied question in the requested language. For hi-Latn, use conversational Hinglish in Latin letters with familiar English terms. Ask one short, neutral question tailored to the category, preserving any privacy guidance. Do not assume facts, ask for passwords, codes or card numbers, provide links, or suggest actions. Return only JSON with category, field and question." },
          { role: "user", content: JSON.stringify({ language: lang, keywords: signals, fieldByCategory, questions: prompts }) },
        ],
      }),
    });
    if (!response.ok) return result(local, failureStatus(response.status));
    const content = (await response.json()).choices?.[0]?.message?.content;
    if (typeof content !== "string") return result(local, "aiInvalid");
    let reply;
    try {
      reply = JSON.parse(content.trim().replace(/^```(?:json)?\s*|\s*```$/gi, ""));
    } catch {
      return result(local, "aiInvalid");
    }
    const wording = typeof reply?.question === "string" ? reply.question.trim() : "";
    if (
      !choices.includes(reply?.category) ||
      !reply.field ||
      reply.field !== candidates[reply.category].field ||
      !wording ||
      (lang === "hi-Latn" && /\p{Script=Devanagari}/u.test(wording)) ||
      wording.length > 360 ||
      /https?:|www\.|[<>]/i.test(wording)
    )
      return result(local, "aiInvalid");
    const source = url.hostname === "generativelanguage.googleapis.com" ? "aiGemini" : "aiProvider";
    return result(reply.category, source, wording);
  } catch {
    return result(local, "aiUnavailable");
  }
}
