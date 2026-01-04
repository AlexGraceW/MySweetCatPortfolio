import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export const runtime = "nodejs";

type Ctx = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, ctx: Ctx) {
  const { id: id_str } = await ctx.params;
  const id = Number(id_str);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof (body as any).title === "string") patch.title = (body as any).title.trim();
  if (typeof (body as any).description === "string") patch.description = (body as any).description;
  if (typeof (body as any).provider === "string") patch.provider = (body as any).provider.trim();
  if (typeof (body as any).videoUrl === "string") patch.videoUrl = (body as any).videoUrl.trim();
  if (typeof (body as any).sortOrder === "number") patch.sortOrder = (body as any).sortOrder;
  if (typeof (body as any).published === "boolean") patch.published = (body as any).published;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.workItem.update({
    where: { id },
    data: patch
  });

  return NextResponse.json({ ok: true, work: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id: id_str } = await ctx.params;
  const id = Number(id_str);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await prisma.workItem.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
