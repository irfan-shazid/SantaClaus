import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to use the wishlist." }, { status: 401 });

  const { productId } = await params;
  // deleteMany (not delete) so removing an item that's already gone is a no-op, not a throw.
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } });

  return NextResponse.json({ ok: true });
}
