import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/HeroBanner";

type Provider = "YOUTUBE" | "VIMEO" | "SELF";
export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const page = await prisma.worksPage.findUnique({
    where: { id: 1 },
    include: { works: { orderBy: { sortOrder: "asc" } } }
  });

  if (!page) {
    return (
      <section className="section">
        <div className="container">
          <div className="card">
            <h1>Not configured yet</h1>
            <p className="muted">Please configure Works in admin.</p>
          </div>
        </div>
      </section>
    );
  }

  const works = page.works.filter((w) => w.published);

  return (
    <>
      <HeroBanner
        variant="works"
        imageUrl={page.bannerImageUrl}
        title={page.heroTitle}
        subtitle={page.heroSubtitle}
      />

      <section className="section">
        <div className="container">
          <div className="works-grid-3">
            {works.map((w) => (
              <div key={w.id} className="works-item-card">
                <div className="works-item-title">{w.title}</div>
                {w.description ? <div className="works-item-desc">{w.description}</div> : null}

                <div className="works-item-video">
                  <VideoEmbed provider={w.provider as Provider} url={w.videoUrl} />
                </div>
              </div>
            ))}
          </div>
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
