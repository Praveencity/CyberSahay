import { db } from "@/lib/db";
import {
  body,
  endpoint,
  fail,
  language,
  owner,
  string,
  limit,
} from "@/lib/security";
import { guides } from "@/config/awareness";

async function requireEditor() {
  const user = await owner();
  if (user.role !== "EDITOR") fail(403, "Editor access required.");
  return user;
}
function key(topic, lang) {
  if (!Object.hasOwn(guides, topic)) fail(400, "Unknown guide.");
  return { topic, language: language(lang) };
}
export const GET = endpoint(async (req) => {
  await requireEditor();
  const p = new URL(req.url).searchParams;
  const where = { topic_language: key(p.get("topic"), p.get("language")) };
  const note = await db.guideNote.findUnique({ where });
  return { text: note?.text ?? "", version: note?.version ?? 0 };
});
export const PUT = endpoint(async (req) => {
  const editor = await requireEditor();
  await limit("publish:" + editor.id, 60, 600);
  const d = await body(req);
  const identity = key(d.topic, d.language);
  const text = string(d.text, 0, 2400);
  if (!Number.isInteger(d.version) || d.version < 0)
    fail(400, "Invalid version.");
  if (d.version === 0) {
    try {
      await db.guideNote.create({ data: { ...identity, text } });
    } catch (e) {
      if (e.code === "P2002")
        fail(409, "Another editor saved changes. Reload the current note.");
      throw e;
    }
  } else {
    const changed = await db.guideNote.updateMany({
      where: { ...identity, version: d.version },
      data: { text, version: { increment: 1 } },
    });
    if (!changed.count)
      fail(409, "Another editor saved changes. Reload the current note.");
  }
  return { text, version: d.version + 1 };
});
