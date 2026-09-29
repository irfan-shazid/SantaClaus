import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: "store" },
    update: {},
    create: { id: "store" },
  });
  return NextResponse.json(settings);
}

const updateSchema = z.object({ bkashNumber: z.string().min(6).max(20) });

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const settings = await prisma.settings.upsert({
    where: { id: "store" },
    update: { bkashNumber: parsed.data.bkashNumber },
    create: { id: "store", bkashNumber: parsed.data.bkashNumber },
  });
  return NextResponse.json(settings);
}
