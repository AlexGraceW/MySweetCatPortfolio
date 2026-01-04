import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export const runtime = "nodejs";

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, ctx: Ctx) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof (body as any).title === "string") patch.title = (body as any).title;
  if (typeof (body as any).html === "string") patch.html = (body as any).html;
  if (typeof (body as any).photoUrl === "string") patch.photoUrl = (body as any).photoUrl;
  if (typeof (body as any).sortOrder === "number") patch.sortOrder = (body as any).sortOrder;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.homeSection.update({
    where: { id },
    data: patch
  });

  return NextResponse.json({ ok: true, section: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.homeSection.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
