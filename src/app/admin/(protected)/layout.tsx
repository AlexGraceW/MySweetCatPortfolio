import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

const COOKIE_NAME = "session_id";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookie_store = await cookies();
  const sessionId = cookie_store.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    redirect("/admin/login");
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session || session.expiresAt < new Date()) {
    redirect("/admin/login");
  }

  return (
    <section className="section">
      <div className="container">{children}</div>
    </section>
  );
}
