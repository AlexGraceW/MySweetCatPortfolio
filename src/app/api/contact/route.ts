import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || email.length < 5 || message.length < 10) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || undefined;
  const userAgent = req.headers.get("user-agent") || undefined;

  await prisma.contactMessage.create({
    data: { name, email, message, ip, userAgent }
  });

  return NextResponse.json({ ok: true });
}
