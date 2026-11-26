import { db } from "@/lib/db";
import { body, endpoint, owner } from "@/lib/security";
import { changes, commit, getComplaint } from "@/lib/complaints";
import { complaintWithEvidence } from "@/lib/evidence";
async function owned(ctx) {
  return getComplaint((await owner()).id, (await ctx.params).id);
}
export const GET = endpoint(async (_req, ctx) =>
  complaintWithEvidence((await owner()).id, (await ctx.params).id),
);
export const PATCH = endpoint(async (req, ctx) => {
  const c = await owned(ctx);
  return { complaint: await commit(c, changes(await body(req), c)) };
});
export const DELETE = endpoint(async (req, ctx) => {
  const c = await owned(ctx);
  await db.complaint.deleteMany({ where: { id: c.id, userId: c.userId } });
  return { deleted: true };
});
