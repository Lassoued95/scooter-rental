import { redirect } from "next/navigation";

export default async function AdminPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}/admin/products`);
}
