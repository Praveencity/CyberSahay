import { body, endpoint, limit, owner } from "@/lib/security";
import { chatTurn, getComplaint } from "@/lib/complaints";
export const POST = endpoint(async (req, ctx) => {
  const user = await owner();
  await limit("chat:" + user.id, 60, 60);
  return {
    complaint: await chatTurn(
      await getComplaint(user.id, (await ctx.params).id),
      await body(req),
    ),
  };
});
