import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DELIVERY_CHARGE } from "@/lib/delivery";
import { checkRateLimit, orderLimiter, getClientIp } from "@/lib/rate-limit";

const createOrderSchema = z.object({
  customerName: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  address: z.string().min(5).max(400),
  zone: z.enum(["INSIDE_DHAKA", "OUTSIDE_DHAKA"]),
  accountType: z.enum(["BKASH", "NAGAD", "ROCKET"]),
  bkashNumber: z.string().min(6).max(20),
  transactionId: z.string().min(3).max(40),
  deliveryChargePaid: z.literal(true, "Please confirm you've sent the delivery charge before placing your order."),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variant: z.string().nullable().optional(),
        quantity: z.number().int().positive().max(50),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to place an order." }, { status: 401 });

  const { success } = await checkRateLimit(orderLimiter, `order:${user.id}:${getClientIp(req)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many order attempts. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  // Validate cart contents against live product data up front, so a stale cart (e.g. a
  // product removed since it was added) fails with a precise, actionable error instead of
  // a generic one - and the client can drop just the bad line(s) rather than the whole cart.
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const liveProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const liveProductMap = new Map(liveProducts.map((p) => [p.id, p]));

  const invalidProductIds = data.items
    .filter((item) => !liveProductMap.has(item.productId))
    .map((item) => item.productId);
  if (invalidProductIds.length > 0) {
    return NextResponse.json(
      {
        error: "Some items in your cart are no longer available and were removed. Please review your cart and try again.",
        invalidProductIds,
      },
      { status: 409 }
    );
  }

  const outOfStockItem = data.items.find((item) => liveProductMap.get(item.productId)!.stock < item.quantity);
  if (outOfStockItem) {
    const product = liveProductMap.get(outOfStockItem.productId)!;
    return NextResponse.json(
      { error: `"${product.name}" only has ${product.stock} left in stock.`, invalidProductIds: [product.id] },
      { status: 409 }
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = [...new Set(data.items.map((i) => i.productId))];
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsData = data.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new Error(`"${product.name}" only has ${product.stock} left in stock.`);
        }
        subtotal += product.price * item.quantity;
        return {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] ?? null,
          variant: item.variant ?? null,
          price: product.price,
          quantity: item.quantity,
        };
      });

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const deliveryCharge = DELIVERY_CHARGE[data.zone];
      const total = subtotal + deliveryCharge;

      return tx.order.create({
        data: {
          userId: user.id,
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          zone: data.zone,
          deliveryCharge,
          accountType: data.accountType,
          bkashNumber: data.bkashNumber,
          transactionId: data.transactionId,
          deliveryChargePaid: data.deliveryChargePaid,
          subtotal,
          total,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (user.role === "ADMIN") {
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: { select: { name: true, email: true } } },
    });
    return NextResponse.json(orders);
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json(orders);
}
