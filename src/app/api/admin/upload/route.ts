import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

function sanitizeExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4"]);
  return allowed.has(ext) ? ext : "";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const ext = sanitizeExt(file.name);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base = randomBytes(12).toString("hex");
  const filename = `${base}${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const fullPath = path.join(uploadsDir, filename);
  await writeFile(fullPath, bytes);

  return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
}
