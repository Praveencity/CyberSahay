import { endpoint, fail, limit, owner } from "@/lib/security";
import { commit } from "@/lib/complaints";
import { complaintWithEvidence } from "@/lib/evidence";
import { generatePdf } from "@/lib/pdf";
async function download(req, ctx) {
  if (req.headers.get("sec-fetch-site") === "cross-site")
    fail(403, "Invalid request origin.");
  const user = await owner(),
    { complaint: c, files } = await complaintWithEvidence(user.id, (await ctx.params).id);
  if (!c.answers.description) fail(400, "Describe the incident first.");
  await limit("pdf:" + user.id, 12, 300);
  const pdf = await generatePdf(c, files);
  if (req.method === "POST" && c.status !== "DOCUMENT_GENERATED")
    await commit(c, { status: "DOCUMENT_GENERATED" });
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="complaint-draft.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
export const GET = endpoint(download);
export const POST = endpoint(download);
