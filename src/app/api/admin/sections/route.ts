import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const title = String((body as any).title || "Section").trim();
  const html = String((body as any).html || "<p>Write your text here...</p>").trim();
  const photoUrl = String((body as any).photoUrl || "").trim();

  const created = await prisma.homeSection.create({
    data: {
      homeId: 1,
      title,
      html,
      photoUrl,
      photoUrlsJson: "[]",
      sortOrder: 0
    },
    select: { id: true }
  });

  return NextResponse.json({ ok: true, id: created.id });
}
