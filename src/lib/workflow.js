import { schemas, patterns } from "../config/categories.js";
import en from "../locales/en.js";
import hi from "../locales/hi.js";
import pa from "../locales/pa.js";

import hinglish from "../locales/hi-Latn.js";

const dictionaries = { en, hi, pa, "hi-Latn": hinglish };
export const categories = Object.keys(schemas);
export const UNKNOWN = "__unknown__";
export const SKIPPED = "__skipped__";
export const NOT_APPLICABLE = "__na__";
const optional = new Set([
  "time",
  "suspect",
  "evidence",
  "actions",
  "recipient",
  "contact",
  "name",
  "sender",
  "seller",
  "safety",
  "reference",
]);
const emptyValues = new Set([UNKNOWN, SKIPPED, NOT_APPLICABLE]);
export function isRequired(id) {
  return !optional.has(id);
}
export function fields(category) {
  const specific = categories.includes(category)
    ? schemas[category]
    : schemas.other;
  return [
    "description",
    "date",
    "time",
    "platform",
    ...specific,
    "suspect",
    "evidence",
    "actions",
    "name",
    "contact",
  ];
}
export function label(id, lang = "en") {
  return dictionaries[lang]?.labels[id] ?? en.labels[id] ?? id;
}
export const documentText = label;
export function question(id, lang = "en") {
  return (
    dictionaries[lang]?.questions[id] ?? en.questions[id] ?? label(id, lang)
  );
}
export function classify(text) {
  let best = "other",
    score = 0;
  for (const [id, pattern] of Object.entries(patterns)) {
    const count = new Set(String(text).toLowerCase().match(pattern)).size;
    if (count > score) {
      best = id;
      score = count;
    }
  }
  return best;
}
export function nextField(category, answers = {}) {
  return fields(category).find((id) => !answers[id]?.trim()) ?? null;
}
export function progress(category, answers = {}) {
  const required = fields(category).filter(isRequired);
  const known = required.filter(
    (id) => answers[id]?.trim() && !emptyValues.has(answers[id]),
  );
  return Math.round((100 * known.length) / required.length);
}
export function sensitive(text) {
  const value = String(text)
    .normalize("NFKC")
    .replace(/[०-९]/g, (c) => String(c.charCodeAt(0) - 2406))
    .replace(/[੦-੯]/g, (c) => String(c.charCodeAt(0) - 2662));
  return /(?:otp|pin|cvv|ओटीपी|पिन|सीवीवी|ਓਟੀਪੀ|ਪਿੰਨ|ਸੀਵੀਵੀ)[\s:=#-]*(?:(?:is|was|hai|tha|है|था|ਹੈ|ਸੀ)\s*)?\d{3,8}\b|(?:password|पासवर्ड|ਪਾਸਵਰਡ)\s*(?:is\b|was\b|hai\b|tha\b|है|था|ਹੈ|ਸੀ|[:=])\s*\S+|\b(?:\d[ -]?){13,19}\b/iu.test(
    value,
  );
}

// Only copy literal answers. Dates and account identifiers need an explicit label
// because an incident description can mention several people or transactions.
export function extractFacts(description, category) {
  const relevant = fields(category).filter((id) => id !== "description");
  const facts = {};
  for (const line of String(description).split(/\r?\n/)) {
    const match = line.match(/^\s*([^:：]{1,70})\s*[:：]\s*(.{1,300})\s*$/u);
    if (!match) continue;
    const [, prefix, value] = match;
    const id = relevant.find((id) =>
      Object.keys(dictionaries).some(
        (lang) => label(id, lang).toLowerCase() === prefix.trim().toLowerCase(),
      ),
    );
    if (id && !sensitive(value)) facts[id] = value.trim();
  }
  // Unlabelled amounts are ambiguous when more than one transaction is discussed.
  if (relevant.includes("amount") && !facts.amount) {
    const mentions = [
      ...String(description).matchAll(
        /(?:₹|\bINR\s+|\bRs\.?\s+)[ \t]*[\d०-९੦-੯]+(?:,[\d०-९੦-੯]+)*(?:\.[\d०-९੦-੯]{1,2})?(?![\d०-९੦-੯])/giu,
      ),
    ];
    if (mentions.length === 1) {
      const mention = mentions[0];
      const before = description.slice(0, mention.index);
      if (
        /(?:^|[.!?]\s+)\s*I\s+(?:paid|sent|transferred|lost)\s*$/iu.test(before)
      )
        facts.amount = mention[0];
    }
  }
  if (!facts.platform) {
    const explicit = String(description).matchAll(
      /(?:\b(?:on|through|via|using)\s+(WhatsApp|Instagram|Facebook|Telegram|Paytm|PhonePe|Google Pay|Amazon|Flipkart)\b)|(?:(व्हाट्सऐप|इंस्टाग्राम|फेसबुक|टेलीग्राम|पेटीएम|फोनपे|गूगल पे)\s+(?:पर|से))|(?:(ਵਟਸਐਪ|ਇੰਸਟਾਗ੍ਰਾਮ|ਫੇਸਬੁੱਕ|ਟੈਲੀਗ੍ਰਾਮ|ਪੇਟੀਐਮ|ਫੋਨਪੇ|ਗੂਗਲ ਪੇ)\s+(?:ਉੱਤੇ|ਤੇ|ਰਾਹੀਂ))/giu,
    );
    const names = new Set(
      Array.from(explicit, (match) => match[1] || match[2] || match[3]),
    );
    if (names.size === 1) facts.platform = [...names][0];
  }
  return facts;
}
