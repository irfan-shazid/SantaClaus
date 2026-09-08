import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  // deleteMany so removing an already-deleted entry is a no-op rather than a throw.
  await prisma.accountEntry.deleteMany({ where: { id } });

  return NextResponse.json({ ok: true });
}
