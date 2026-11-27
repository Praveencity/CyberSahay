import { db } from "@/lib/db";
import { body, emailAddress, endpoint, fail, limit, owner, string } from "@/lib/security";

const managedRoles = ["MEMBER", "EDITOR"];

async function requireAdmin() {
  const user = await owner();
  if (user.role !== "ADMIN") fail(403, "Admin access required.");
  await limit("manage-roles:" + user.id, 60, 600);
}

export const POST = endpoint(async (req) => {
  await requireAdmin();
  const data = await body(req);
  const account = await db.user.findUnique({
    where: { email: emailAddress(data.email), role: { in: managedRoles } },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!account) fail(404, "No member or editor found for this email.");
  return { account };
});

export const PATCH = endpoint(async (req) => {
  await requireAdmin();
  const { id, currentRole, role } = await body(req);
  if (!managedRoles.includes(currentRole) || !managedRoles.includes(role))
    fail(400, "Choose Member or Guide editor.");
  const updated = await db.user.updateMany({
    where: { id: string(id, 1, 100), role: currentRole },
    data: { role },
  });
  if (!updated.count) fail(409, "Account access changed. Look up the account again.");
  return { role };
});
