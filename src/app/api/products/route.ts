import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = { slug: category };
  if (type === "CLOTHING" || type === "TOY") where.type = type;
  if (featured === "true") where.featured = true;
  if (q) where.name = { contains: q, mode: "insensitive" };

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, slug: true } } },
  });

  return NextResponse.json(products);
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  price: z.number().int().positive(),
  images: z.array(z.string().url()).min(1),
  variants: z.array(z.string().min(1)).default([]),
  stock: z.number().int().min(0),
  type: z.enum(["CLOTHING", "TOY"]),
  featured: z.boolean().default(false),
  categoryId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}
