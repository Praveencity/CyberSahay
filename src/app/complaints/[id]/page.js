import Review from "../../../components/portal/Review";
export default async function Page({ params }) {
  return <Review id={(await params).id} />;
}
