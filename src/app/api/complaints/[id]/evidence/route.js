import { db } from "@/lib/db";
import { chatChanges, commit, getComplaint } from "@/lib/complaints";
import {
  checkEvidenceCount,
  checkStorage,
  complaintWithEvidence,
  evidenceForm,
  evidenceMetadata,
  listEvidence,
  reviseEvidenceDraft,
  uploadedEvidence,
} from "@/lib/evidence";
import { endpoint, fail, limit, owner } from "@/lib/security";

export const GET = endpoint(async (_req, ctx) => {
  const { complaint, files } = await complaintWithEvidence((await owner()).id, (await ctx.params).id);
  return { version: complaint.version, files };
});

export const POST = endpoint(async (req, ctx) => {
  const user = await owner();
  const c = await getComplaint(user.id, (await ctx.params).id);
  await limit("evidence:" + user.id, 20, 3600);
  const form = await evidenceForm(req);
  if (form.get("version") !== String(c.version))
    fail(409, "This draft changed. Reload before continuing.");
  const file = await uploadedEvidence(form);
  const answer = form.get("answer");
  let changes;
  if (answer) {
    await limit("chat:" + user.id, 60, 60);
    changes = await chatChanges(c, { text: answer, version: c.version });
  }
  return db.$transaction(async (tx) => {
    await checkStorage(tx, user.id, file.size);
    const complaint = changes ? await commit(c, changes, tx) : await reviseEvidenceDraft(tx, c);
    const files = await listEvidence(c.id, tx);
    checkEvidenceCount(files);
    const saved = await tx.evidenceFile.create({
      data: { ...file, complaintId: c.id },
      select: evidenceMetadata,
    });
    return { version: complaint.version, files: [...files, saved], ...(form.has("answer") && { complaint }) };
  });
});
