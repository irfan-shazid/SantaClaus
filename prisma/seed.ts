import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "@better-auth/core/db";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "santa@gmail.com";
const ADMIN_PASSWORD = "12345";

const ADMIN2_EMAIL = "admin@gmail.com";
const ADMIN2_PASSWORD = "12345";

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

  const babyBoy = await prisma.category.findUniqueOrThrow({ where: { slug: "baby-boy" } });
  const babyGirl = await prisma.category.findUniqueOrThrow({ where: { slug: "baby-girl" } });
  const tshirts = await prisma.category.findUniqueOrThrow({ where: { slug: "t-shirts" } });
  const winterWear = await prisma.category.findUniqueOrThrow({ where: { slug: "winter-wear" } });
  const softToys = await prisma.category.findUniqueOrThrow({ where: { slug: "soft-toys" } });
  const buildingBlocks = await prisma.category.findUniqueOrThrow({ where: { slug: "building-blocks" } });

  const products = [
    {
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
    },
    {
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
    },
    {
      name: "Dino Adventure Tee",
      slug: "dino-adventure-tee",
      description: "Fun dinosaur-themed cotton tee that sparks imagination. Durable stitching for active kids.",
      price: 480,
      images: ["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&h=800&fit=crop"],
      variants: ["3-4Y", "5-6Y", "7-8Y"],
      stock: 30,
      type: "CLOTHING" as const,
      featured: false,
      categoryId: tshirts.id,
    },
    {
      name: "Starlight Frock",
      slug: "starlight-frock",
      description: "Elegant cotton frock with star patterns. Perfect for parties and special occasions.",
      price: 750,
      images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&h=800&fit=crop"],
      variants: ["1-2Y", "3-4Y", "5-6Y"],
      stock: 20,
      type: "CLOTHING" as const,
      featured: true,
      categoryId: babyGirl.id,
    },
    {
      name: "Cozy Winter Hoodie",
      slug: "cozy-winter-hoodie",
      description: "Warm fleece-lined hoodie to keep little ones snug during cold weather. Machine washable.",
      price: 850,
      images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop"],
      variants: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
      stock: 18,
      type: "CLOTHING" as const,
      featured: false,
      categoryId: winterWear.id,
    },
    {
      name: "Wooden Building Set",
      slug: "wooden-building-set",
      description: "50-piece natural wood building blocks set. Develops motor skills and creativity.",
      price: 1200,
      images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=800&fit=crop"],
      variants: [],
      stock: 12,
      type: "TOY" as const,
      featured: true,
      categoryId: buildingBlocks.id,
    },
    {
      name: "Baby Elephant Romper",
      slug: "baby-elephant-romper",
      description: "Adorable elephant-print romper made from organic cotton. Gentle on sensitive skin.",
      price: 550,
      images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=800&fit=crop"],
      variants: ["0-3M", "3-6M", "6-12M"],
      stock: 22,
      type: "CLOTHING" as const,
      featured: false,
      categoryId: babyBoy.id,
    },
    {
      name: "Plush Bunny",
      slug: "plush-bunny",
      description: " floppy-eared plush bunny with a soft cotton body. Safe, non-toxic materials.",
      price: 580,
      images: ["https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=800&h=800&fit=crop"],
      variants: [],
      stock: 20,
      type: "TOY" as const,
      featured: false,
      categoryId: softToys.id,
    },
    {
      name: "Snowflake Knit Sweater",
      slug: "snowflake-knit-sweater",
      description: "Hand-knit wool sweater with classic snowflake pattern. Extra warm for winter outings.",
      price: 950,
      images: ["https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&h=800&fit=crop"],
      variants: ["3-4Y", "5-6Y", "7-8Y"],
      stock: 14,
      type: "CLOTHING" as const,
      featured: true,
      categoryId: winterWear.id,
    },
    {
      name: "Colorful Brick Kit",
      slug: "colorful-brick-kit",
      description: "200-piece interlocking brick set in vibrant colors. Compatible with major brands.",
      price: 1500,
      images: ["https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop"],
      variants: [],
      stock: 10,
      type: "TOY" as const,
      featured: false,
      categoryId: buildingBlocks.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product });
  }

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

  const existingAdmin2 = await prisma.user.findUnique({ where: { email: ADMIN2_EMAIL } });
  if (!existingAdmin2) {
    const passwordHash2 = await hashPassword(ADMIN2_PASSWORD);
    const admin2 = await prisma.user.create({
      data: { name: "Admin", email: ADMIN2_EMAIL, emailVerified: true, role: "ADMIN" },
    });
    await prisma.account.create({
      data: {
        accountId: admin2.id,
        providerId: "credential",
        issuer: createLocalAccountIssuer("credential"),
        userId: admin2.id,
        password: passwordHash2,
      },
    });
    console.log(`Admin account created: ${ADMIN2_EMAIL} / ${ADMIN2_PASSWORD}`);
  } else if (existingAdmin2.role !== "ADMIN") {
    await prisma.user.update({ where: { email: ADMIN2_EMAIL }, data: { role: "ADMIN" } });
    console.log(`Promoted existing ${ADMIN2_EMAIL} to ADMIN.`);
  } else {
    console.log(`Admin account already exists: ${ADMIN2_EMAIL}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
