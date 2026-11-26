import { db } from "./db";
import { commit, getComplaint, safeAnswer } from "./complaints";
import { fail, readBytes } from "./security";
import { nextField } from "./workflow";
import { evidenceFilename, evidenceMediaType } from "./evidence-format";
import { maxEvidenceBytes, maxEvidenceFiles } from "../config/evidence";

export const evidenceMetadata = {
  id: true,
  name: true,
  mediaType: true,
  size: true,
  note: true,
};

export const evidenceOrder = [{ createdAt: "asc" }, { id: "asc" }];

export async function evidenceForm(req) {
  const type = req.headers.get("content-type");
  if (!type?.toLowerCase().startsWith("multipart/form-data;"))
    fail(415, "Select an image or video.");
  const payload = await readBytes(req, maxEvidenceBytes + 64 * 1024);
  try {
    return await new Response(payload, { headers: { "content-type": type } }).formData();
  } catch {
    fail(400, "Invalid evidence upload.");
  }
}

export async function uploadedEvidence(form) {
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) fail(400, "Select an image or video.");
  if (file.size > maxEvidenceBytes) fail(413, "Each file must be 10 MB or smaller.");
  const note = safeAnswer(form.get("note") ?? "");
  const bytes = Buffer.from(await file.arrayBuffer());
  const mediaType = evidenceMediaType(bytes);
  if (!mediaType) fail(415, "Use a JPG, PNG, WebP, MP4, MOV or WebM file.");
  return { name: evidenceFilename(file.name), mediaType, size: bytes.length, note, bytes };
}

export function listEvidence(complaintId, client = db) {
  return client.evidenceFile.findMany({
    where: { complaintId },
    select: evidenceMetadata,
    orderBy: evidenceOrder,
  });
}

export async function checkStorage(client, userId, bytes) {
  const users = await client.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
  if (!users.length) fail(401, "Please sign in.");
  const { _sum } = await client.evidenceFile.aggregate({
    where: { complaint: { userId } },
    _sum: { size: true },
  });
  if ((_sum.size || 0) + bytes > 100 * 1024 * 1024)
    fail(413, "Evidence storage is full. Remove a file before uploading.");
}

export function reviseEvidenceDraft(client, complaint) {
  const status = nextField(complaint.category, complaint.answers) ? "IN_PROGRESS" : "DRAFT_READY";
  return commit(complaint, { status }, client);
}

export function checkEvidenceCount(files) {
  if (files.length >= maxEvidenceFiles) fail(400, "A complaint can have up to 5 evidence files.");
}

export function complaintWithEvidence(userId, id) {
  return db.$transaction(async (tx) => {
    const complaint = await getComplaint(userId, id, tx);
    return { complaint, files: await listEvidence(id, tx) };
  }, { isolationLevel: "RepeatableRead" });
}
