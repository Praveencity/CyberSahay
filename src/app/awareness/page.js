import { Awareness } from "@/components/Resources";

export default async function Page({ searchParams }) {
  const { group, lang } = await searchParams;
  return (
    <Awareness selectedGroup={typeof group === "string" ? group : "all"} requestedLanguage={lang} />
  );
}
