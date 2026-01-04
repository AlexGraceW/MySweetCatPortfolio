import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function unique_slug(base: string): Promise<string> {
  let s = base || "work";
  let i = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = i === 0 ? s : `${s}-${i}`;
    const exists = await prisma.workItem.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    i += 1;
  }
}

export async function GET() {
  const page = await prisma.worksPage.findUnique({ where: { id: 1 } });
  const works = await prisma.workItem.findMany({
    where: { worksPageId: 1 },
    orderBy: { sortOrder: "asc" }
  });

  return NextResponse.json({
    page: page || {
      id: 1,
      heroTitle: "Work",
      heroSubtitle: "Selected projects and edits",
      bannerImageUrl: "/uploads/works-banner.jpg"
    },
    works
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const title = String((body as any).title || "").trim();
  const description = String((body as any).description || "").trim();
  const provider = String((body as any).provider || "YOUTUBE").trim();
  const videoUrl = String((body as any).videoUrl || "").trim();
  const published = Boolean((body as any).published ?? true);

  if (!title || !videoUrl) {
    return NextResponse.json({ error: "Title and videoUrl are required." }, { status: 400 });
  }

  const base_slug = slugify(String((body as any).slug || title));
  const slug = await unique_slug(base_slug);

  const max_sort = await prisma.workItem.aggregate({
    where: { worksPageId: 1 },
    _max: { sortOrder: true }
  });

  const next_sort = (max_sort._max.sortOrder ?? 0) + 10;

  const created = await prisma.workItem.create({
    data: {
      worksPageId: 1,
      title,
      slug,
      description,
      provider,
      videoUrl,
      published,
      sortOrder: next_sort
    }
  });

  return NextResponse.json({ ok: true, work: created });
}
