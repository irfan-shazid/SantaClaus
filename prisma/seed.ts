import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "@better-auth/core/db";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "money@santa.com";
const ADMIN_PASSWORD = "santa@&77";
const ADMIN_NAME = "Admin";

/**
 * Seeds a single admin account and nothing else - no categories, products or
 * orders. The store settings row is created by the app on first use.
 *
 * The password is written straight to the Account row using Better Auth's own
 * hasher, which is how a credential account is stored; signing in then works
 * exactly as it would after a normal sign-up.
 */
async function main() {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (!existing) {
    const admin = await prisma.user.create({
      data: { name: ADMIN_NAME, email: ADMIN_EMAIL, emailVerified: true, role: "ADMIN" },
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
    console.log(`Admin created: ${ADMIN_EMAIL}`);
    return;
  }

  // Re-running the seed keeps the account in the intended state rather than failing.
  await prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN", emailVerified: true } });
  const credential = await prisma.account.findFirst({
    where: { userId: existing.id, providerId: "credential" },
  });
  if (credential) {
    await prisma.account.update({ where: { id: credential.id }, data: { password: passwordHash } });
  } else {
    await prisma.account.create({
      data: {
        accountId: existing.id,
        providerId: "credential",
        issuer: createLocalAccountIssuer("credential"),
        userId: existing.id,
        password: passwordHash,
      },
    });
  }
  console.log(`Admin already existed - role and password reset: ${ADMIN_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
