import Evidence from "@/components/portal/Evidence";

export default async function Page({ params }) {
  const { id } = await params;
  return <Evidence key={id} id={id} />;
}
