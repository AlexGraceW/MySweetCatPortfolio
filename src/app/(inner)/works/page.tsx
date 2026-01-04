// src/app/works/page.tsx
// PUBLIC WORKS PAGE — 3 IN A ROW, NO THUMBNAILS

import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const page = await prisma.worksPage.findUnique({ where: { id: 1 } });
  const works = await prisma.workItem.findMany({
    where: { worksPageId: 1, published: true },
    orderBy: { sortOrder: "asc" }
  });

  const hero = page ?? {
    heroTitle: "Work",
    heroSubtitle: "Selected projects and edits",
    bannerImageUrl: "/uploads/works-banner.jpg"
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-banner works">
            <img src={hero.bannerImageUrl} alt="Works banner" />
            <div className="hero-text">
              <h1 className="hero-title">{hero.heroTitle}</h1>
              <p className="hero-subtitle">{hero.heroSubtitle}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {works.length === 0 ? (
            <div className="card">
              <h2 style={{ marginTop: 0 }}>No works yet</h2>
              <p className="muted">
                Add projects in <b>/admin/works</b>
              </p>
            </div>
          ) : (
            <div className="works-grid-3">
              {works.map((w) => (
                <div key={w.id} className="works-item-card">
                  <div className="works-item-title">{w.title}</div>
                  {w.description ? (
                    <div className="works-item-desc">{w.description}</div>
                  ) : null}

                  <div className="works-item-video">
                    <VideoEmbed provider={w.provider} url={w.videoUrl} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function VideoEmbed({ provider, url }: { provider: string; url: string }) {
  const u = (url || "").trim();
  if (!u) return <div className="muted">No video</div>;

  if (provider === "SELF") {
    return (
      <video
        src={u}
        controls
        style={{
          width: "100%",
          height: 220,
          borderRadius: 14,
          border: "1px solid var(--line)",
          background: "#0f1220",
          objectFit: "cover"
        }}
      />
    );
  }

  if (provider === "VIMEO") {
    const id = extract_vimeo_id(u);
    const src = id ? `https://player.vimeo.com/video/${id}` : u;

    return (
      <iframe
        src={src}
        title="Vimeo video"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{
          width: "100%",
          height: 220,
          border: "1px solid var(--line)",
          borderRadius: 14
        }}
      />
    );
  }

  const yt_id = extract_youtube_id(u);
  const yt_src = yt_id ? `https://www.youtube.com/embed/${yt_id}` : u;

  return (
    <iframe
      src={yt_src}
      title="YouTube video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      style={{
        width: "100%",
        height: 220,
        border: "1px solid var(--line)",
        borderRadius: 14
      }}
    />
  );
}

function extract_youtube_id(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "") || null;
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}

function extract_vimeo_id(input: string): string | null {
  const m = input.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}
