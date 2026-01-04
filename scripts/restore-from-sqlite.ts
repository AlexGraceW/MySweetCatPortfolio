import Database from "better-sqlite3";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function to_date(v: unknown): Date | undefined {
  if (v === null || v === undefined) return undefined;

  if (v instanceof Date) return v;

  if (typeof v === "number") {
    // Assume milliseconds since epoch
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  if (typeof v === "bigint") {
    const d = new Date(Number(v));
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  if (typeof v === "string") {
    // ISO string
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  return undefined;
}

function to_bool(v: unknown): boolean | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "bigint") return v !== 0n;
  if (typeof v === "string") return v === "true" || v === "1";
  return undefined;
}

async function main() {
  const sqlite_path = path.resolve("prisma", "dev.db");
  const sqlite = new Database(sqlite_path, { readonly: true });

  const prisma = new PrismaClient();

  console.log("SQLite:", sqlite_path);

  // -----------------------------
  // 0) Read rows from SQLite
  // -----------------------------

  const admin_users = sqlite.prepare(`SELECT * FROM "AdminUser";`).all() as Array<any>;
  const home_pages = sqlite.prepare(`SELECT * FROM "HomePage";`).all() as Array<any>;
  const home_sections = sqlite.prepare(`SELECT * FROM "HomeSection";`).all() as Array<any>;
  const works_pages = sqlite.prepare(`SELECT * FROM "WorksPage";`).all() as Array<any>;
  const work_items = sqlite.prepare(`SELECT * FROM "WorkItem";`).all() as Array<any>;
  const contacts_pages = sqlite.prepare(`SELECT * FROM "ContactsPage";`).all() as Array<any>;
  const contact_messages = sqlite
    .prepare(`SELECT * FROM "ContactMessage";`)
    .all() as Array<any>;
  const sessions = sqlite.prepare(`SELECT * FROM "Session";`).all() as Array<any>;

  // -----------------------------
  // 1) Clear Postgres tables
  // -----------------------------
  // Order matters because of FK constraints
  await prisma.session.deleteMany().catch(() => undefined);
  await prisma.contactMessage.deleteMany().catch(() => undefined);
  await prisma.homeSection.deleteMany().catch(() => undefined);
  await prisma.workItem.deleteMany().catch(() => undefined);

  await prisma.contactsPage.deleteMany().catch(() => undefined);
  await prisma.worksPage.deleteMany().catch(() => undefined);
  await prisma.homePage.deleteMany().catch(() => undefined);

  // AdminUser usually parent
  await prisma.adminUser.deleteMany().catch(() => undefined);

  // -----------------------------
  // 2) Insert with type conversion
  // -----------------------------

  if (admin_users.length) {
    await prisma.adminUser.createMany({
      data: admin_users.map((r) => ({
        id: r.id,
        email: r.email,
        passwordHash: r.passwordHash,
        createdAt: to_date(r.createdAt),
        updatedAt: to_date(r.updatedAt)
      }))
    });
    console.log("Imported AdminUser:", admin_users.length);
  } else {
    console.log("AdminUser: empty");
  }

  if (home_pages.length) {
    // If schema uses singleton id=1, keep it
    await prisma.homePage.createMany({
      data: home_pages.map((r) => ({
        id: r.id,
        heroTitle: r.heroTitle,
        heroSubtitle: r.heroSubtitle,
        bannerImageUrl: r.bannerImageUrl,
        avatarImageUrl: r.avatarImageUrl,
        aboutTitle: r.aboutTitle,
        aboutHtml: r.aboutHtml,
        aboutVideoUrl: r.aboutVideoUrl,
        createdAt: to_date(r.createdAt),
        updatedAt: to_date(r.updatedAt)
      }))
    });
    console.log("Imported HomePage:", home_pages.length);
  } else {
    console.log("HomePage: empty");
  }

  if (home_sections.length) {
    await prisma.homeSection.createMany({
      data: home_sections.map((r) => ({
        id: r.id,
        pageId: r.pageId,
        order: r.order,
        title: r.title,
        html: r.html,
        photoUrl: r.photoUrl,
        createdAt: to_date(r.createdAt),
        updatedAt: to_date(r.updatedAt)
      }))
    });
    console.log("Imported HomeSection:", home_sections.length);
  } else {
    console.log("HomeSection: empty");
  }

  if (works_pages.length) {
    await prisma.worksPage.createMany({
      data: works_pages.map((r) => ({
        id: r.id,
        heroTitle: r.heroTitle,
        heroSubtitle: r.heroSubtitle,
        bannerImageUrl: r.bannerImageUrl,
        createdAt: to_date(r.createdAt),
        updatedAt: to_date(r.updatedAt)
      }))
    });
    console.log("Imported WorksPage:", works_pages.length);
  } else {
    console.log("WorksPage: empty");
  }

  if (work_items.length) {
    await prisma.workItem.createMany({
      data: work_items.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        provider: r.provider,
        videoUrl: r.videoUrl,
        // thumbnailUrl removed in your schema
        published: to_bool(r.published) ?? false,
        order: r.order,
        createdAt: to_date(r.createdAt),
        updatedAt: to_date(r.updatedAt)
      }))
    });
    console.log("Imported WorkItem:", work_items.length);
  } else {
    console.log("WorkItem: empty");
  }

  if (contacts_pages.length) {
    await prisma.contactsPage.createMany({
      data: contacts_pages.map((r) => ({
        id: r.id,
        heroTitle: r.heroTitle,
        heroSubtitle: r.heroSubtitle,
        bannerImageUrl: r.bannerImageUrl,
        createdAt: to_date(r.createdAt),
        updatedAt: to_date(r.updatedAt)
      }))
    });
    console.log("Imported ContactsPage:", contacts_pages.length);
  } else {
    console.log("ContactsPage: empty");
  }

  if (contact_messages.length) {
    await prisma.contactMessage.createMany({
      data: contact_messages.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        message: r.message,
        createdAt: to_date(r.createdAt)
      }))
    });
    console.log("Imported ContactMessage:", contact_messages.length);
  } else {
    console.log("ContactMessage: empty");
  }

  if (sessions.length) {
    // Your current schema has id String @default(cuid()), but we can still insert old ids explicitly
    await prisma.session.createMany({
      data: sessions.map((r) => ({
        id: r.id,
        userId: r.userId,
        expiresAt: to_date(r.expiresAt) ?? new Date(Date.now() + 7 * 86400 * 1000)
      }))
    });
    console.log("Imported Session:", sessions.length);
  } else {
    console.log("Session: empty");
  }

  await prisma.$disconnect();
  sqlite.close();

  console.log("DONE. Now refresh the site.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
