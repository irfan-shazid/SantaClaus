import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "GIVEN_TO_RIDER", "DELIVERED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // A cancelled order's stock has already been returned, so moving it back into
  // the pipeline here would let the shop oversell. The condition makes that
  // check-and-write atomic. (Cancelling itself goes through /cancel, which
  // records the reason and restores stock.)
  const updated = await prisma.order.updateMany({
    where: { id, status: { not: "CANCELLED" } },
    data: { status: parsed.data.status },
  });

  if (updated.count === 0) {
    const exists = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    return exists
      ? NextResponse.json({ error: "Cancelled orders can't be moved back into the pipeline." }, { status: 400 })
      : NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  return NextResponse.json(order);
}
