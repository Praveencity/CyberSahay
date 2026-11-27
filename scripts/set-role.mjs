import { PrismaClient } from "@prisma/client";
const [email, role] = process.argv.slice(2);
if (!email || !["MEMBER", "EDITOR", "ADMIN"].includes(role)) {
  console.error("Usage: npm run role -- registered-email MEMBER|EDITOR|ADMIN");
  process.exit(1);
}
const db = new PrismaClient();
try {
  const result = await db.user.updateMany({
    where: { email: email.trim().toLowerCase() },
    data: { role },
  });
  if (!result.count)
    throw Error("Register the account before assigning a role.");
  console.log("Role assigned:", role);
} finally {
  await db.$disconnect();
}
