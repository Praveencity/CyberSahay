import { endpoint, body, owner, limit, string } from "@/lib/security";
import { chatTurn, getComplaint } from "@/lib/complaints";
export const POST = endpoint(async (req) => {
  const user = await owner(),
    d = await body(req);
  await limit("chat:" + user.id, 60, 60);
  return {
    complaint: await chatTurn(
      await getComplaint(user.id, string(d.complaintId, 1, 100)),
      d,
    ),
  };
});
