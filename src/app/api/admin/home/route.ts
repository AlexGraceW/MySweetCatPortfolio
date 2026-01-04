import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const home = await prisma.homePage.findUnique({ where: { id: 1 } });
  const sections = await prisma.homeSection.findMany({
    where: { homeId: 1 },
    orderBy: { sortOrder: "asc" }
  });

  return NextResponse.json({
    home: home || {
      id: 1,
      heroTitle: "Video Editor & Director",
      heroSubtitle: "Story-driven editing for brands, artists, and documentaries",
      bannerImageUrl: "/uploads/banner.jpg",
      directorName: "John Doe",
      directorRole: "Video Editor / Director",
      directorAvatarUrl: "/uploads/avatar.jpg",
      introProvider: "YOUTUBE",
      introVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      aboutTitle: "About",
      aboutHtml: "<p>Write a short director statement here.</p>"
    },
    sections
  });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = {
    heroTitle: String((body as any).heroTitle || "").trim(),
    heroSubtitle: String((body as any).heroSubtitle || "").trim(),
    bannerImageUrl: String((body as any).bannerImageUrl || "").trim(),
    directorName: String((body as any).directorName || "").trim(),
    directorRole: String((body as any).directorRole || "").trim(),
    directorAvatarUrl: String((body as any).directorAvatarUrl || "").trim(),
    introProvider: String((body as any).introProvider || "").trim(),
    introVideoUrl: String((body as any).introVideoUrl || "").trim(),
    aboutTitle: String((body as any).aboutTitle || "").trim(),
    aboutHtml: String((body as any).aboutHtml || "").trim()
  };

  if (!data.heroTitle || !data.bannerImageUrl || !data.directorName) {
    return NextResponse.json({ error: "Please fill required fields." }, { status: 400 });
  }

  await prisma.homePage.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });

  return NextResponse.json({ ok: true });
}
