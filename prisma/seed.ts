import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "@better-auth/core/db";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345";

const CATEGORIES = [
  { name: "Baby Boy", slug: "baby-boy", logoUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop", order: 1 },
  { name: "Baby Girl", slug: "baby-girl", logoUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop", order: 2 },
  { name: "T-Shirts", slug: "t-shirts", logoUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=200&h=200&fit=crop", order: 3 },
  { name: "Winter Wear", slug: "winter-wear", logoUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&h=200&fit=crop", order: 4 },
  { name: "Soft Toys", slug: "soft-toys", logoUrl: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=200&h=200&fit=crop", order: 5 },
  { name: "Building Blocks", slug: "building-blocks", logoUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200&h=200&fit=crop", order: 6 },
];

async function main() {
  await prisma.settings.upsert({
    where: { id: "store" },
    update: {},
    create: { id: "store", bkashNumber: "01700000000" },
  });

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat });
  }

  const tshirts = await prisma.category.findUniqueOrThrow({ where: { slug: "t-shirts" } });
  const softToys = await prisma.category.findUniqueOrThrow({ where: { slug: "soft-toys" } });

  const rainbowTee = {
    name: "Rainbow Cotton Tee",
    slug: "rainbow-cotton-tee",
    description: "Soft, breathable 100% cotton t-shirt with a playful rainbow print. Machine washable.",
    price: 450,
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&h=800&fit=crop"],
    variants: ["2-3Y", "4-5Y", "6-7Y"],
    stock: 25,
    type: "CLOTHING" as const,
    featured: true,
    categoryId: tshirts.id,
  };
  await prisma.product.upsert({ where: { slug: rainbowTee.slug }, update: rainbowTee, create: rainbowTee });

  const teddyBear = {
    name: "Cuddly Bear Plush",
    slug: "cuddly-bear-plush",
    description: "Super soft plush teddy bear, safe for all ages. A perfect cuddle buddy.",
    price: 650,
    images: ["https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&h=800&fit=crop"],
    variants: [],
    stock: 15,
    type: "TOY" as const,
    featured: true,
    categoryId: softToys.id,
  };
  await prisma.product.upsert({ where: { slug: teddyBear.slug }, update: teddyBear, create: teddyBear });

  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    const admin = await prisma.user.create({
      data: { name: "Admin", email: ADMIN_EMAIL, emailVerified: true, role: "ADMIN" },
    });
    await prisma.account.create({
      data: {
        accountId: admin.id,
        providerId: "credential",
        issuer: createLocalAccountIssuer("credential"),
        userId: admin.id,
        password: passwordHash,
      },
    });
    console.log(`Admin account created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else if (existingAdmin.role !== "ADMIN") {
    await prisma.user.update({ where: { email: ADMIN_EMAIL }, data: { role: "ADMIN" } });
    console.log(`Promoted existing ${ADMIN_EMAIL} to ADMIN.`);
  } else {
    console.log(`Admin account already exists: ${ADMIN_EMAIL}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
