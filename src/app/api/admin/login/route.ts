import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "../../../../lib/prisma";

const COOKIE_NAME = "session_id";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || password.length < 4) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionId = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt
      }
    });

    const res = NextResponse.json({ ok: true });

    // ✅ СТАВИМ COOKIE НА ОТВЕТЕ (самый надежный способ)
    res.cookies.set(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt
    });

    return res;
  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

