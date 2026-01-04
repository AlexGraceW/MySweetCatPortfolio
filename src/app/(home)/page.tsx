import { prisma } from "../../lib/prisma";

type Provider = "YOUTUBE" | "VIMEO" | "SELF";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await prisma.homePage.findUnique({
    where: { id: 1 },
    include: { sections: { orderBy: { sortOrder: "asc" } } }
  });

  if (!home) {
    return (
      <section className="section">
        <div className="container">
          <div className="card">
            <h1>Not configured yet</h1>
            <p className="muted">Please login to the admin panel and add content.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-banner home">
            <img src={home.bannerImageUrl} alt="Banner" />
            <div className="hero-text">
              <h1 className="hero-title">{home.heroTitle}</h1>
              <p className="hero-subtitle">{home.heroSubtitle}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card">
            <div className="profile-row" style={{ alignItems: "center" }}>
              <div className="avatar-wrap">
                <img className="avatar-img" src={home.directorAvatarUrl} alt="Avatar" />
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{home.directorName}</div>
                <div className="muted">{home.directorRole}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 16, alignItems: "start" }}>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Intro video</h3>
              <VideoEmbed provider={home.introProvider as Provider} url={home.introVideoUrl} />
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>{home.aboutTitle}</h3>
              <div
                className="muted"
                style={{ lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: home.aboutHtml }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {home.sections.map((s, idx) => {
            const reverse = idx % 2 === 1;

            return (
              <div
                key={s.id}
                className={`home-row ${reverse ? "home-row--reverse" : ""}`}
                style={{ marginTop: idx === 0 ? 0 : 16 }}
              >
                <div className="card">
                  <h2 style={{ marginTop: 0 }}>{s.title}</h2>
                  <div
                    className="muted"
                    style={{ lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: s.html }}
                  />
                </div>

                <div className="card section-photo-card">
                  <div className="section-photo-wrap">
                    <img src={s.photoUrl} alt={s.title} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function VideoEmbed({ provider, url }: { provider: Provider; url: string }) {
  const u = (url || "").trim();
  if (!u) return <div className="muted">No video URL</div>;

  if (provider === "SELF") {
    return (
      <video
        src={u}
        controls
        style={{
          width: "100%",
          borderRadius: 14,
          border: "1px solid var(--line)",
          background: "#0f1220"
        }}
      />
    );
  }

  if (provider === "VIMEO") {
    const id = extractVimeoId(u);
    const src = id ? `https://player.vimeo.com/video/${id}` : u;

    return (
      <iframe
        src={src}
        title="Vimeo video"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{
          width: "100%",
          height: 340,
          border: "1px solid var(--line)",
          borderRadius: 14
        }}
      />
    );
  }

  const ytId = extractYoutubeId(u);
  const ytSrc = ytId ? `https://www.youtube.com/embed/${ytId}` : u;

  return (
    <iframe
      src={ytSrc}
      title="YouTube video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      style={{
        width: "100%",
        height: 340,
        border: "1px solid var(--line)",
        borderRadius: 14
      }}
    />
  );
}

function extractYoutubeId(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "") || null;
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}

function extractVimeoId(input: string): string | null {
  const m = input.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}
