// REPLACE FILE: src/app/(home)/page.tsx

import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/HeroBanner";
import PhotoCarousel from "@/components/PhotoCarousel";

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
      {/* HERO */}
      <HeroBanner variant="home" imageUrl={home.bannerImageUrl} title={home.heroTitle} subtitle={home.heroSubtitle}>
        {/* Avatar on hero-banner */}
        <div className="hero-avatar">
          <img src={home.directorAvatarUrl} alt="Avatar" />
        </div>
      </HeroBanner>

      {/* INTRO / ABOUT */}
      <section className="section">
        <div className="container">
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

      {/* SECTIONS */}
      <section className="section">
        <div className="container">
          {home.sections.map((s, idx) => {
            const reverse = idx % 2 === 1;

            const photoUrls = getSectionPhotoUrls(s as any); // supports new + legacy

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
                  {photoUrls.length > 1 ? (
                    <PhotoCarousel urls={photoUrls} alt={s.title} />
                  ) : (
                    <img src={photoUrls[0] || ""} alt={s.title} loading="lazy" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

/**
 * Supports:
 * - NEW: section.photoUrlsJson (stringified array of URLs)
 * - LEGACY: section.photoUrl (single URL)
 */
function getSectionPhotoUrls(section: { photoUrlsJson?: string | null; photoUrl?: string | null }): string[] {
  // 1) try JSON array
  const raw = (section.photoUrlsJson || "").trim();
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        const cleaned = arr.map((x) => String(x || "").trim()).filter(Boolean);
        if (cleaned.length) return cleaned;
      }
    } catch {
      // ignore
    }
  }

  // 2) fallback to legacy single photoUrl
  const one = String(section.photoUrl || "").trim();
  return one ? [one] : [];
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
