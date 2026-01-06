import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

export const runtime = "nodejs";

function json_error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Разрешаем:
// - любые image/* (png/jpg/webp/gif/svg/heic/heif и т.д.)
// - любые video/* (если вдруг позже понадобится)
// - application/octet-stream (часто так приходит с некоторых устройств/браузеров)
function isAllowedMime(mime: string) {
  if (!mime) return true;
  if (mime.startsWith("image/")) return true;
  if (mime.startsWith("video/")) return true;
  if (mime === "application/octet-stream") return true;
  return false;
}

function safeExtFromName(name: string) {
  const ext = path.extname(name || "").toLowerCase();
  // ext может быть пустым — это ок
  // но убираем всё подозрительное (на всякий)
  if (!ext || ext.length > 10) return "";
  if (!/^\.[a-z0-9]+$/.test(ext)) return "";
  return ext;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return json_error("No file provided.");
    }

    // Ограничение размера (можешь увеличить при необходимости)
    const MAX_MB = 50;
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      return json_error(`File too large. Max ${MAX_MB} MB.`);
    }

    const mime = file.type || "";
    if (!isAllowedMime(mime)) {
      return json_error(`Unsupported file type: ${mime || "unknown"}`);
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name || "upload";
    const ext = safeExtFromName(originalName);

    // Уникальное имя файла
    const id = crypto.randomUUID();
    const filename = `${id}${ext}`;
    const outPath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(outPath, Buffer.from(bytes));

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (e: any) {
    return json_error(e?.message || "Upload failed", 500);
  }
}
