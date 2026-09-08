import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().positive().optional(),
  images: z.array(z.string().url()).min(1).optional(),
  variants: z.array(z.string().min(1)).optional(),
  stock: z.number().int().min(0).optional(),
  type: z.enum(["CLOTHING", "TOY"]).optional(),
  featured: z.boolean().optional(),
  isUpcoming: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

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
    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") return NextResponse.json({ error: "This product no longer exists." }, { status: 404 });
      if (e.code === "P2002") {
        return NextResponse.json({ error: "Another product already uses this name/slug." }, { status: 409 });
      }
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Already gone - treat as success so the list just refreshes.
      if (e.code === "P2025") return NextResponse.json({ ok: true });
      if (e.code === "P2003" || e.code === "P2014") {
        return NextResponse.json(
          { error: "This product is still linked to other records and can't be deleted." },
          { status: 409 }
        );
      }
    }
    throw e;
  }
}
