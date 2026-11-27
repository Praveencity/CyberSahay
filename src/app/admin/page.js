import { current } from "@/lib/security";
import { notFound, redirect } from "next/navigation";
import Admin from "@/components/portal/Admin";

export default async function Page() {
  const user = await current();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role !== "ADMIN") notFound();
  return <Admin />;
}
