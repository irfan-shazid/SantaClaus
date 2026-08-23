import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-slate-800">Add product</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
