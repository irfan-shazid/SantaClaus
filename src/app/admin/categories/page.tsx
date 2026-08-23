import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return <CategoryManager initialCategories={categories} />;
}
