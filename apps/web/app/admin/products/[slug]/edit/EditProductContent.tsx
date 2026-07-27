import { notFound } from "next/navigation";
import { getProductForEdit } from "@/actions/adminActions";
import { ProductForm } from "@/components/admin/ProductForm";

export async function EditProductContent({ slug }: { slug: string }) {
  const result = await getProductForEdit(slug);
  if (!result.success || !result.data) notFound();

  return <ProductForm initialData={result.data} />;
}
