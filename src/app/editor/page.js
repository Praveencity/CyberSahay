import { current } from "@/lib/security";
import { redirect, notFound } from "next/navigation";
import Editor from "@/components/Editor";
export default async function Page() {
  const user = await current();
  if (!user) redirect("/login?next=%2Feditor");
  if (user.role !== "EDITOR") notFound();
  return <Editor />;
}
