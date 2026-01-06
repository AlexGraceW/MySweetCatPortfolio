import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const rawEmail = process.argv[2];
const rawPassword = process.argv[3];

if (!rawEmail || !rawPassword) {
  console.log('Usage: node scripts/create-admin.mjs "admin@example.com" "password"');
  process.exit(1);
}

const email = String(rawEmail).trim().toLowerCase();
const password = String(rawPassword);

const passwordHash = await bcrypt.hash(password, 10);

await prisma.adminUser.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash }
});

console.log("Admin user created/updated:", email);

await prisma.$disconnect();
