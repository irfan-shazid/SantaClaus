import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const cancelSchema = z.object({
  reason: z.string().trim().min(1, "Please write a reason for the customer.").max(500),
});

// Anything that hasn't reached the customer yet can still be cancelled.
const CANCELLABLE = ["PENDING", "CONFIRMED", "GIVEN_TO_RIDER"] as const;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = cancelSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please write a reason for the customer." },
      { status: 400 }
    );
  }

  let result: { status: number; error?: string };
  try {
    result = await cancelOrder(id, parsed.data.reason);
  } catch (e) {
    // Another request held the transaction slot for too long (e.g. a double
    // submit). Nothing was written, so it's safe to ask the admin to retry.
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2028" || e.code === "P2034")) {
      return NextResponse.json({ error: "This order is being updated. Refresh and try again." }, { status: 409 });
    }
    throw e;
  }

  if (result.status !== 200) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

function cancelOrder(id: string, reason: string) {
  return prisma.$transaction(
    async (tx): Promise<{ status: number; error?: string }> => {
      const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!order) return { status: 404, error: "Order not found." };
      if (order.status === "CANCELLED") return { status: 400, error: "This order is already cancelled." };
      if (order.status === "DELIVERED") return { status: 400, error: "Delivered orders can't be cancelled." };

      // Conditional update so a concurrent cancel/status change can't slip in between
      // the read above and this write - only one request ever wins the transition,
      // which also means stock is restored exactly once.
      const updated = await tx.order.updateMany({
        where: { id, status: { in: [...CANCELLABLE] } },
        data: { status: "CANCELLED", cancelReason: reason, cancelledAt: new Date() },
      });
      if (updated.count === 0) {
        return { status: 409, error: "This order was just updated. Refresh and try again." };
      }

      // Return the reserved stock. Lines whose product has since been deleted have
      // a null productId and nothing to restore.
      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return { status: 200 };
    },
    // Prisma's defaults (2s to acquire, 5s to run) are tight against Neon's latency;
    // a request queued behind a concurrent one needs room to wait its turn.
    { maxWait: 10_000, timeout: 20_000 }
  );
}
