import { db } from "./db";
import { fail, language, string } from "./security";
import {
  categories,
  fields,
  nextField,
  SKIPPED,
  UNKNOWN,
  NOT_APPLICABLE,
  sensitive,
  label,
} from "./workflow";
import { draftReply } from "./ai";
export async function getComplaint(userId, id, client = db) {
  return (
    (await client.complaint.findFirst({ where: { userId, id } })) ||
    fail(404, "Complaint not found.")
  );
}
export function checkVersion(d, c) {
  if (d.version !== c.version)
    fail(409, "This draft changed. Reload before continuing.");
}
export function safeAnswer(value) {
  const text = string(value, 0, 4000);
  if (sensitive(text))
    fail(400, "Remove passwords, PINs, OTPs and card details before saving.");
  return text;
}
export async function commit(c, data, client = db) {
  const result = await client.complaint.updateManyAndReturn({
    where: { id: c.id, userId: c.userId, version: c.version },
    data: { ...data, version: { increment: 1 } },
  });
  if (!result.length)
    fail(409, "This draft changed. Reload before continuing.");
  return result[0];
}
export function changes(d, c) {
  checkVersion(d, c);
  const category = d.category ?? c.category;
  if (!categories.includes(category)) fail(400, "Invalid category.");
  const valid = fields(category),
    answers = {};
  for (const key of valid) if (c.answers[key]) answers[key] = c.answers[key];
  if (d.answers !== undefined) {
    if (!d.answers || typeof d.answers !== "object" || Array.isArray(d.answers))
      fail(400, "Invalid answers.");
    for (const [key, value] of Object.entries(d.answers)) {
      if (!valid.includes(key)) fail(400, "Invalid complaint field.");
      answers[key] = safeAnswer(value);
    }
  }
  return {
    category,
    answers,
    language: language(d.language ?? c.language),
    status: nextField(category, answers) ? "IN_PROGRESS" : "DRAFT_READY",
  };
}
export async function chatChanges(c, d) {
  checkVersion(d, c);
  const field = nextField(c.category, c.answers);
  if (!field) fail(400, "Review your completed draft.");
  const answer = d.skip ? SKIPPED : safeAnswer(d.text);
  if (
    !answer ||
    (field === "description" &&
      [SKIPPED, UNKNOWN, NOT_APPLICABLE].includes(answer))
  )
    fail(400, "Describe the incident first.");
  const reply = await draftReply({
    answers: { ...c.answers, [field]: answer },
    category: c.category,
    opening: field === "description",
    language: c.language,
  });
  const messages = [
    ...c.messages,
    {
      role: "user",
      text: [SKIPPED, UNKNOWN, NOT_APPLICABLE].includes(answer)
        ? label(answer, c.language)
        : answer,
    },
    reply.message,
  ];
  return {
    category: reply.category,
    answers: reply.answers,
    messages,
    status: reply.complete ? "DRAFT_READY" : "IN_PROGRESS",
  };
}

export async function chatTurn(c, d) {
  return commit(c, await chatChanges(c, d));
}
