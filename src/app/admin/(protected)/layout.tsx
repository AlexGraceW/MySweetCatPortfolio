// REPLACE FILE: src/app/admin/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { get_session_cookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function require_admin_session(): Promise<void> {
  const session_id = await get_session_cookie();

  if (!session_id) {
    redirect("/admin/login");
  }

  const session = await prisma.session.findUnique({
    where: { id: session_id },
    select: { id: true, expiresAt: true }
  });

  if (!session) {
    redirect("/admin/login");
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session_id } }).catch(() => undefined);
    redirect("/admin/login");
  }
}

export default async function AdminProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await require_admin_session();

  return <>{children}</>;
}
