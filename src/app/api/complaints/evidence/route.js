import { db } from "@/lib/db";
import { safeAnswer } from "@/lib/complaints";
import { checkStorage, evidenceForm, evidenceMetadata, uploadedEvidence } from "@/lib/evidence";
import { endpoint, fail, language, limit, owner } from "@/lib/security";
import { draftReply } from "@/lib/ai";
import { NOT_APPLICABLE, SKIPPED, UNKNOWN } from "@/lib/workflow";

export const POST = endpoint(async (req) => {
  const user = await owner();
  await limit("evidence:" + user.id, 20, 3600);
  await limit("create:" + user.id, 30, 3600);
  const form = await evidenceForm(req);
  const description = safeAnswer(form.get("description") ?? "");
  if (!description || [SKIPPED, UNKNOWN, NOT_APPLICABLE].includes(description))
    fail(400, "Describe the incident first.");
  const file = await uploadedEvidence(form);
  const lang = language(form.get("language") || user.language);
  const reply = await draftReply({ answers: { description }, opening: true, language: lang });
  const complaint = await db.$transaction(async (tx) => {
    await checkStorage(tx, user.id, file.size);
    return tx.complaint.create({
      data: {
        userId: user.id,
        category: reply.category,
        language: lang,
        status: reply.complete ? "DRAFT_READY" : "IN_PROGRESS",
        answers: reply.answers,
        messages: [
          { role: "user", text: description },
          reply.message,
        ],
        evidence: { create: file },
      },
      ...(form.has("fromChat") ? { include: { evidence: { select: evidenceMetadata } } } : { select: { id: true } }),
    });
  });
  const { evidence: files, ...draft } = complaint;
  return { complaint: draft, ...(files && { files }) };
});
