import { portalLanguages } from "../config/languages";
import { allowedOrigin } from "./origin";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { randomBytes, scrypt, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";
const derive = promisify(scrypt);
export function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}
export const publicFields = {
  role: true,
  id: true,
  name: true,
  email: true,
  language: true,
};
export async function session() {
  return getIronSession(await cookies(), {
    cookieName: "portal_session",
    password: process.env.AUTH_SECRET,
    ttl: 60 * 60 * 12,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  });
}
export async function current() {
  const s = await session();
  if (!s.uid) return null;
  return db.user.findFirst({
    where: { id: s.uid, sessionVersion: s.version },
    select: publicFields,
  });
}
export async function owner() {
  return (await current()) || fail(401, "Please sign in.");
}
export function endpoint(fn) {
  return async function (req, ctx) {
    try {
      if (
        !["GET", "HEAD"].includes(req.method) &&
        !allowedOrigin(
          req.headers.get("origin"),
          process.env.APP_ORIGIN || process.env.RENDER_EXTERNAL_URL || new URL(req.url).origin,
          req.headers.get("host"),
          process.env.NODE_ENV === "development",
        )
      )
        fail(403, "Invalid request origin.");
      const result = await fn(req, ctx);
      return result instanceof Response
        ? result
        : Response.json(result, { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      return Response.json(
        {
          error: e.status
            ? e.message
            : "Service unavailable. Please try again.",
        },
        { status: e.status || 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}
export async function body(req) {
  if (!req.headers.get("content-type")?.includes("application/json"))
    fail(415, "Expected JSON.");
  const content = await readBytes(req, 65536);
  try {
    const data = JSON.parse(content.toString());
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
  } catch {}
  fail(400, "Invalid request.");
}
export async function readBytes(req, maxBytes) {
  if (Number(req.headers.get("content-length")) > maxBytes)
    fail(413, "Request too large.");
  const reader = req.body?.getReader();
  if (!reader) fail(400, "Missing request.");
  const chunks = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > maxBytes) {
      await reader.cancel();
      fail(413, "Request too large.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks, bytes);
}
export function string(value, min, max, message = "Invalid field.") {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.length > max
  )
    fail(400, message);
  return value.trim();
}
export function language(value) {
  if (typeof value !== "string" || !Object.hasOwn(portalLanguages, value)) fail(400, "Invalid language.");
  return value;
}
export async function hash(password) {
  const salt = randomBytes(16).toString("hex");
  return salt + "." + (await derive(password, salt, 64)).toString("hex");
}
export async function matches(password, stored) {
  const [salt, digest] = stored.split(".");
  return timingSafeEqual(
    await derive(password, salt, 64),
    Buffer.from(digest, "hex"),
  );
}
export async function limit(key, max, seconds) {
  const window = Math.floor(Date.now() / (seconds * 1000));
  const id = createHmac("sha256", process.env.AUTH_SECRET)
    .update(key + ":" + window)
    .digest("hex");
  const b = await db.rateBucket.upsert({
    where: { id },
    create: { id, expiresAt: new Date((window + 1) * seconds * 1000) },
    update: { hits: { increment: 1 } },
  });
  if (Math.random() < 0.015)
    await db.rateBucket.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  if (b.hits > max) fail(429, "Too many requests. Try again later.");
}
