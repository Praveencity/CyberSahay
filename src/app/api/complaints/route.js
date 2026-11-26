import { db } from "@/lib/db";
import { body, endpoint, language, limit, owner } from "@/lib/security";
import { getComplaint } from "@/lib/complaints";
export const GET = endpoint(async (req) => {
  const { id: userId } = await owner();
  const params = new URL(req.url).searchParams;
  const cursor = params.get("cursor");
  const filter = params.get("filter");
  const before = cursor ? await getComplaint(userId, cursor) : null;
  const where = {
    userId,
    ...(filter === "generated" && { status: "DOCUMENT_GENERATED" }),
    ...(filter === "drafts" && { status: { not: "DOCUMENT_GENERATED" } }),
    ...(before && {
      OR: [
        { createdAt: { lt: before.createdAt } },
        { createdAt: before.createdAt, id: { lt: before.id } },
      ],
    }),
  };
  const [rows, total, generated] = await db.$transaction([
    db.complaint.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 21,
      select: {
        id: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        language: true,
        version: true,
      },
    }),
    db.complaint.count({ where: { userId } }),
    db.complaint.count({ where: { userId, status: "DOCUMENT_GENERATED" } }),
  ]);
  return {
    complaints: rows.slice(0, 20),
    nextCursor: rows.length > 20 ? rows[19].id : null,
    stats: { total, generated, drafts: total - generated },
  };
});
export const POST = endpoint(async (req) => {
  const user = await owner(),
    d = await body(req);
  await limit("create:" + user.id, 30, 3600);
  return {
    complaint: await db.complaint.create({
      data: {
        userId: user.id,
        category: "other",
        language: language(d.language || user.language),
      },
    }),
  };
});
