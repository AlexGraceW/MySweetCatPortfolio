import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const title = typeof body?.title === "string" ? body.title.trim() : "Background";
  const html = typeof body?.html === "string" ? body.html : "<p>Write your text here...</p>";
  const photoUrl = typeof body?.photoUrl === "string" ? body.photoUrl.trim() : "/uploads/placeholder.jpg";

  const max = await prisma.homeSection.aggregate({
    where: { homeId: 1 },
    _max: { sortOrder: true }
  });

  const nextSort = (max._max.sortOrder ?? 0) + 10;

  const created = await prisma.homeSection.create({
    data: {
      homeId: 1,
      title,
      html,
      photoUrl,
      sortOrder: nextSort
    }
  });

  return NextResponse.json({ ok: true, section: created });
}
