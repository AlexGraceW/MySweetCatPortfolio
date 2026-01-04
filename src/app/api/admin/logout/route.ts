// REPLACE FILE: src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clear_session_cookie, get_session_cookie } from "@/lib/auth";

export async function POST() {
  const session_id = await get_session_cookie();

  if (session_id) {
    await prisma.session.delete({ where: { id: session_id } }).catch(() => undefined);
  }

  await clear_session_cookie();

  return NextResponse.json({ ok: true });
}
