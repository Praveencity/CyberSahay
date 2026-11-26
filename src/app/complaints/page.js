import Listing from "../../components/portal/Listing";
export default async function Page({ searchParams }) {
  const { filter } = await searchParams;
  return <Listing key={filter} filter={filter} />;
}
