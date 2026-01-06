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

  const profile_bg = String((home as any).profileBgImageUrl || "").trim();

  return (
    <>
      {/* HERO */}
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

      {/* PROFILE + INTRO/ABOUT */}
      <section className="section">
        <div className="container">
          <div className={`card ${profile_bg ? "profile-card" : ""}`}>
            {profile_bg ? (
              <div className="profile-bg" aria-hidden="true">
                <img src={profile_bg} alt="" />
                <div className="profile-bg-overlay" />
              </div>
            ) : null}

            <div className={`profile-row profile-row--center ${profile_bg ? "profile-foreground" : ""}`}>
              <div className="avatar-wrap">
                <img className="avatar-img" src={home.directorAvatarUrl} alt="Avatar" />
              </div>

              <div className="profile-text">
                <div className="profile-title">{home.directorName}</div>
                <div className="profile-subtitle muted">{home.directorRole}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-2 home-intro-grid">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Intro video</h3>
              <VideoEmbed provider={home.introProvider as Provider} url={home.introVideoUrl} />
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>{home.aboutTitle}</h3>
              <div className="muted home-about-html" dangerouslySetInnerHTML={{ __html: home.aboutHtml }} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTIONS (ALTERNATING) */}
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
                  <div className="muted home-section-html" dangerouslySetInnerHTML={{ __html: s.html }} />
                </div>

                <div className="home-photo">
                  <img src={s.photoUrl} alt={s.title} loading="lazy" />
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
    return <video className="video-player" src={u} controls preload="metadata" />;
  }

  if (provider === "VIMEO") {
    const id = extractVimeoId(u);
    const src = id ? `https://player.vimeo.com/video/${id}` : u;

    return (
      <div className="embed-16x9">
        <iframe
          src={src}
          title="Vimeo video"
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const ytId = extractYoutubeId(u);
  const ytSrc = ytId ? `https://www.youtube.com/embed/${ytId}` : u;

  return (
    <div className="embed-16x9">
      <iframe
        src={ytSrc}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
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
