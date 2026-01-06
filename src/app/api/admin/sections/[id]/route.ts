import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function json_error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id: idStr } = await params; // ✅ ВАЖНО: params = Promise
  const id = Number(idStr);
  if (!Number.isFinite(id)) return json_error("Invalid id", 400);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return json_error("Invalid payload", 400);

  const patch: any = {};

  if ("title" in (body as any)) patch.title = String((body as any).title ?? "").trim();
  if ("html" in (body as any)) patch.html = String((body as any).html ?? "").trim();

  // legacy fallback
  if ("photoUrl" in (body as any)) patch.photoUrl = String((body as any).photoUrl ?? "").trim();

  // NEW: массив фоток
  if ("photoUrls" in (body as any)) {
    const arr = Array.isArray((body as any).photoUrls) ? (body as any).photoUrls : [];
    const clean = arr
      .map((x: any) => String(x || "").trim())
      .filter((x: string) => x.length > 0);

    patch.photoUrlsJson = JSON.stringify(clean);

    // если прислали массив — сделаем photoUrl = first (fallback)
    if (clean.length > 0) {
      patch.photoUrl = clean[0];
    }
  }

  if ("sortOrder" in (body as any)) {
    const n = Number((body as any).sortOrder);
    if (Number.isFinite(n)) patch.sortOrder = n;
  }

  await prisma.homeSection.update({
    where: { id },
    data: patch
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id: idStr } = await params; // ✅ ВАЖНО: params = Promise
  const id = Number(idStr);
  if (!Number.isFinite(id)) return json_error("Invalid id", 400);

  await prisma.homeSection.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
