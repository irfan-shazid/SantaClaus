import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { invalidateCatalog } from "@/lib/catalog-cache";

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  logoUrl: z.string().url().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    invalidateCatalog();
    return NextResponse.json(category);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return NextResponse.json({ error: "This category no longer exists." }, { status: 404 });
      if (e.code === "P2002") {
        return NextResponse.json({ error: "Another category already uses this name." }, { status: 409 });
      }
    }
    throw e;
  }
}

/**
 * Every product needs a category, so a category that still has products can't
 * simply vanish. The caller says what happens to them:
 *   ?moveTo=<categoryId>   reassign them to another category, then delete
 *   ?deleteProducts=true   delete them too (past orders keep their snapshot)
 * With neither, a category that has products answers 409 with the count, so
 * the admin UI can ask.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const search = new URL(req.url).searchParams;
  const moveTo = search.get("moveTo");
  const deleteProducts = search.get("deleteProducts") === "true";

  if (moveTo && deleteProducts) {
    return NextResponse.json({ error: "Choose either moving or deleting the products, not both." }, { status: 400 });
  }
  if (moveTo === id) {
    return NextResponse.json({ error: "Pick a different category to move the products to." }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!category) {
    // Already gone - treat as success so the list just refreshes.
    return NextResponse.json({ ok: true, moved: 0, deleted: 0 });
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0 && !moveTo && !deleteProducts) {
    return NextResponse.json(
      { error: `This category has ${productCount} product(s). Choose whether to move or delete them.`, productCount },
      { status: 409 }
    );
  }

  if (moveTo) {
    const target = await prisma.category.findUnique({ where: { id: moveTo }, select: { id: true } });
    if (!target) {
      return NextResponse.json({ error: "The category you picked no longer exists." }, { status: 400 });
    }
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Acting on categoryId (not the count above) catches every product in the
        // category at this moment, including any added since the count.
        const moved = moveTo
          ? (await tx.product.updateMany({ where: { categoryId: id }, data: { categoryId: moveTo } })).count
          : 0;
        // Order lines keep their own name/image/price snapshot and wishlist
        // entries cascade, so deleting products never breaks order history.
        const deleted = deleteProducts ? (await tx.product.deleteMany({ where: { categoryId: id } })).count : 0;
        await tx.category.delete({ where: { id } });
        return { moved, deleted };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );

    invalidateCatalog();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // A product was added to this category mid-delete; nothing was committed.
      if (e.code === "P2003" || e.code === "P2014") {
        return NextResponse.json(
          { error: "A product was just added to this category. Please try again." },
          { status: 409 }
        );
      }
      if (e.code === "P2025") return NextResponse.json({ ok: true, moved: 0, deleted: 0 });
      if (e.code === "P2028") {
        return NextResponse.json({ error: "The server is busy. Please try again." }, { status: 409 });
      }
    }
    throw e;
  }
}
