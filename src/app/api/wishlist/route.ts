import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// Returns the current user's wishlisted product ids (empty array when signed out).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ productIds: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  return NextResponse.json({ productIds: items.map((i) => i.productId) });
}

const addSchema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in to use the wishlist." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    update: {},
    create: { userId: user.id, productId: parsed.data.productId },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
