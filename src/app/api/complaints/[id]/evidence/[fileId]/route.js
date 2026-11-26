import { db } from "@/lib/db";
import { checkVersion, getComplaint } from "@/lib/complaints";
import { listEvidence, reviseEvidenceDraft } from "@/lib/evidence";
import { body, endpoint, fail, owner } from "@/lib/security";

export const GET = endpoint(async (_req, ctx) => {
  const user = await owner();
  const { id, fileId } = await ctx.params;
  const file = await db.evidenceFile.findFirst({
    where: { id: fileId, complaintId: id, complaint: { userId: user.id } },
    select: { name: true, mediaType: true, bytes: true, size: true },
  });
  if (!file) fail(404, "Evidence file not found.");
  const filename = encodeURIComponent(file.name).replace(/['()*]/g, (char) => "%" + char.charCodeAt(0).toString(16));
  return new Response(file.bytes, {
    headers: {
      "Content-Type": file.mediaType,
      "Content-Length": String(file.size),
      "Content-Disposition": "attachment; filename*=UTF-8''" + filename,
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

export const DELETE = endpoint(async (req, ctx) => {
  const user = await owner();
  const { id, fileId } = await ctx.params;
  const c = await getComplaint(user.id, id);
  checkVersion(await body(req), c);
  return db.$transaction(async (tx) => {
    const complaint = await reviseEvidenceDraft(tx, c);
    const result = await tx.evidenceFile.deleteMany({ where: { id: fileId, complaintId: c.id } });
    if (!result.count) fail(404, "Evidence file not found.");
    return { version: complaint.version, files: await listEvidence(c.id, tx) };
  });
});
