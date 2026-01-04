import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

const COOKIE_NAME = "session_id";

export const runtime = "nodejs";

export async function POST() {
  const cookie_store = await cookies();
  const sid = cookie_store.get(COOKIE_NAME)?.value;

  if (sid) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => null);
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });

  return res;
}
