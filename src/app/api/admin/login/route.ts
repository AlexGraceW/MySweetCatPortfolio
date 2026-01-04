// REPLACE FILE: src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { set_session_cookie } from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
};

function json_error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginBody | null;

  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";

  if (!email || !password) {
    return json_error("Email and password are required.", 400);
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true }
  });

  if (!user) {
    return json_error("Invalid credentials.", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return json_error("Invalid credentials.", 401);
  }

  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: expires_at
    },
    select: { id: true }
  });

  await set_session_cookie(session.id, expires_at);

  return NextResponse.json({ ok: true });
}
