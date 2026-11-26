import { db } from "@/lib/db";
import {
  body,
  current,
  endpoint,
  fail,
  hash,
  language,
  limit,
  matches,
  owner,
  publicFields,
  session,
  string,
} from "@/lib/security";
export const GET = endpoint(async () => ({ user: await current() }));
function passwordValue(value, creating = false) {
  if (
    typeof value !== "string" ||
    value.length > 256 ||
    value.length < (creating ? 12 : 1)
  )
    fail(400, "Use a password of 12 to 256 characters.");
  return value;
}
export const POST = endpoint(async (req) => {
  const d = await body(req),
    s = await session();
  if (d.action === "logout") {
    s.destroy();
    return { user: null };
  }
  if (["register", "login"].includes(d.action)) {
    const email = string(d.email, 3, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      fail(400, "Invalid email address.");
    await limit("auth:" + email, 12, 900);
    await limit("auth-global", 600, 60);
    const password = passwordValue(d.password, d.action === "register");
    let user;
    if (d.action === "register") {
      const name = string(d.name, 1, 100);
      try {
        user = await db.user.create({
          data: {
            email,
            name,
            passwordHash: await hash(password),
            language: language(d.language || "en"),
          },
        });
      } catch (e) {
        if (e.code === "P2002")
          fail(409, "An account already exists for this email.");
        throw e;
      }
    } else {
      user = await db.user.findUnique({ where: { email } });
      const ok = await matches(
        password,
        user?.passwordHash || "dummy." + "00".repeat(64),
      );
      if (!user || !ok) fail(401, "Invalid email or password.");
    }
    s.uid = user.id;
    s.version = user.sessionVersion;
    await s.save();
    return {
      user: Object.fromEntries(
        Object.keys(publicFields).map((k) => [k, user[k]]),
      ),
    };
  }
  const user = await owner();
  await limit("account:" + user.id, 40, 600);
  if (d.action === "update")
    return {
      user: await db.user.update({
        where: { id: user.id },
        data: { name: string(d.name, 1, 100), language: language(d.language) },
        select: publicFields,
      }),
    };
  if (!["clear", "delete", "password"].includes(d.action))
    fail(400, "Unknown action.");
  const record = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await matches(passwordValue(d.password), record.passwordHash)))
    fail(403, "Incorrect current password.");
  if (d.action === "delete") {
    await db.user.delete({
      where: { id: user.id, sessionVersion: record.sessionVersion },
    });
    s.destroy();
    return { user: null };
  }
  if (d.action === "clear") {
    await db.complaint.deleteMany({ where: { userId: user.id } });
    return { user };
  }
  const updated = await db.user.update({
    where: { id: user.id, sessionVersion: record.sessionVersion },
    data: {
      passwordHash: await hash(passwordValue(d.newPassword, true)),
      sessionVersion: { increment: 1 },
    },
  });
  s.version = updated.sessionVersion;
  await s.save();
  return { user };
});
