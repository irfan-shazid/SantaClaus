import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { bdDayStart } from "@/lib/date-range";

const createSchema = z.object({
  type: z.enum(["COST", "EXTERNAL_INCOME"]),
  name: z.string().min(1).max(120),
  amount: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick a valid date."),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in a name, a positive amount and a date." }, { status: 400 });
  }

  const entry = await prisma.accountEntry.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.name.trim(),
      amount: parsed.data.amount,
      date: bdDayStart(parsed.data.date),
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
