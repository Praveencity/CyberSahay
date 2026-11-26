import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { guides } from "@/config/awareness";
import { AwarenessGuide } from "@/components/Resources";
export default async function Page({ params, searchParams }) {
  const [{ topic }, { lang }] = await Promise.all([params, searchParams]);
  if (!Object.hasOwn(guides, topic)) notFound();
  const notes = await db.guideNote
    .findMany({ where: { topic }, select: { language: true, text: true } })
    .catch(() => []);
  return (
    <AwarenessGuide
      slug={topic}
      notes={Object.fromEntries(notes.map((n) => [n.language, n.text]))}
      requestedLanguage={lang}
    />
  );
}
