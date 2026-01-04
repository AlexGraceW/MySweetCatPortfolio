import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const emailRaw = process.argv[2];
const password = process.argv[3];

if (!emailRaw || !password) {
  console.log('Usage: node scripts/create-admin.mjs "admin@example.com" "password"');
  process.exit(1);
}

const email = String(emailRaw).trim().toLowerCase();
const passwordHash = await bcrypt.hash(password, 10);

await prisma.adminUser.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash }
});

console.log("Admin user created/updated:", email);

await prisma.$disconnect();
