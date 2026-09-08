import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-2xl font-extrabold text-slate-900">Admin dashboard</h1>
      <div className="md:flex md:items-start md:gap-6">
        <AdminNav />
        {/* min-w-0 so wide tables/cards inside can scroll instead of stretching the flex row. */}
        <div className="mt-6 min-w-0 flex-1 md:mt-0">{children}</div>
      </div>
    </div>
  );
}
