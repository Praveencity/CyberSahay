import Assistant from "../../components/portal/Assistant";
import { starters } from "../../components/portal/starters";

export default async function Page({ searchParams }) {
  const { id, starter } = await searchParams;
  const initialId = typeof id === "string" && id ? id : null;
  const selected = initialId ? undefined : starters.find((item) => item.id === starter);

  return (
    <Assistant
      key={initialId ? "draft-" + initialId : "new-" + (selected?.id || "")}
      initialId={initialId}
      initialStarter={selected?.prompt}
    />
  );
}
