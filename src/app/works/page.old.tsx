import { prisma } from "../../lib/prisma";

export default async function WorksPage() {
  const works = await prisma.work.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }]
  });

  return (
    <section className="section">
      <div className="container">
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Work</h1>
          <p className="muted">This page will be managed from the admin panel.</p>
          <p className="muted">Published items: {works.length}</p>
        </div>
      </div>
    </section>
  );
}
