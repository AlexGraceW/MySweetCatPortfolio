import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const page = await prisma.contactsPage.findUnique({ where: { id: 1 } });

  return NextResponse.json({
    page: page || {
      id: 1,
      heroTitle: "Contact",
      heroSubtitle: "Tell me about your project — I’ll reply within 24 hours.",
      bannerImageUrl: "/uploads/contacts-banner.jpg"
    }
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
    bannerImageUrl: String((body as any).bannerImageUrl || "").trim()
  };

  if (!data.heroTitle || !data.bannerImageUrl) {
    return NextResponse.json(
      { error: "Please fill required fields (title, bannerImageUrl)." },
      { status: 400 }
    );
  }

  await prisma.contactsPage.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });

  return NextResponse.json({ ok: true });
}
