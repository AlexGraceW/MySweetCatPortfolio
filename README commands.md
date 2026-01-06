# MySweetCatPortfolio

Production-ready portfolio built with **Next.js + Prisma + PostgreSQL (Railway)**.

This README explains the **correct development & deployment workflow**, so database, admin access, and deployments never break.

---

## 🧱 Stack

- **Next.js (App Router)**
- **Prisma ORM**
- **PostgreSQL**
- **Railway (hosting + database)**
- **Node.js**

---

## 📂 Project Structure (important parts)

```
prisma/
  schema.prisma
  migrations/
scripts/
  create-admin.mjs
src/
  app/
  lib/
```

---

## 🔐 Environment Variables

### Local (`.env`)

```env
DATABASE_URL="postgresql://portfolio_user:password@localhost:5432/portfolio"
AUTH_SECRET="your_secret_here"
```

### Railway

Configured **inside Railway dashboard** or via linked Postgres service:

- `DATABASE_URL` → from Railway Postgres
- `AUTH_SECRET` → same value as local (recommended)

---

## 📜 NPM Scripts (Core Workflow)

### Development

```bash
npm run dev
```
Runs the Next.js dev server.

---

## 🗄️ Database Workflow (VERY IMPORTANT)

### ✅ Local development (SAFE to reset)

```bash
npm run db:migrate:dev
```

Use when:
- Editing `schema.prisma`
- Working locally

⚠️ This **may reset your local DB**. This is expected.

---

### 🚫 Never do this on Railway

```bash
prisma migrate dev
```

❌ DO NOT run this against production.

---

### ✅ Production / Railway migration (SAFE)

```bash
npm run railway:migrate
```

What it does:
- Runs `prisma migrate deploy`
- Uses Railway's `DATABASE_URL`
- **Does NOT delete data**

This is the **ONLY correct way** to migrate Railway.

---

## 👤 Admin User Management

Admin users are **NOT seeded automatically**.
They are created via script so they can always be restored.

### Create admin locally

```bash
npm run admin:create
```

Creates an admin user in **local database**.

---

### Create admin on Railway (production)

```bash
npm run railway:admin:create
```

Creates admin user directly inside **Railway database**.

Use this when:
- Login stops working
- Database was reset
- New environment created

---

## 🔍 Prisma Studio

```bash
npm run db:studio
```

Open Prisma Studio at:

```
http://localhost:5555
```

Use it to:
- Inspect data
- Debug issues
- Verify migrations

---

## 🚀 Deployment Flow (Railway)

1. Commit & push to GitHub
2. Railway auto-deploys application
3. Run migrations (if schema changed):

```bash
npm run railway:migrate
```

4. Ensure admin exists:

```bash
npm run railway:admin:create
```

---

## ❗ Golden Rules

- ❌ Never run `prisma migrate dev` on Railway
- ✅ Always use `railway run prisma migrate deploy`
- ❌ Never rely on seed data for production
- ✅ Always create admin via script
- ✅ Treat **local DB and Railway DB as separate worlds**

---

## 🧠 Mental Model

- **Local DB** = disposable sandbox
- **Railway DB** = source of truth
- Migrations = schema only
- Admin creation = manual, explicit, safe

---

## 🛟 Recovery Checklist

If something breaks in production:

```bash
npm run railway:migrate
npm run railway:admin:create
```

99% of issues are fixed by this.

---

## ✅ Status

This project follows a **production-safe Prisma workflow**.

You can:
- Work offline
- Deploy confidently
- Restore access instantly

---

Happy shipping 🚀

