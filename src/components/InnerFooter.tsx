import { readFile } from "node:fs/promises";
import path from "node:path";

type SocialImage = {
  src: string;
  width: number;
  height: number;
};

type SocialLink = {
  key: string;
  href: string;
  icon: SocialImage;
  nameImage: SocialImage;
};

async function load_social_links(): Promise<SocialLink[]> {
  try {
    const file_path = path.join(
      process.cwd(),
      "public",
      "uploads",
      "social-links.json"
    );

    const raw = await readFile(file_path, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is SocialLink => {
      if (typeof item !== "object" || item === null) return false;

      const i = item as Partial<SocialLink>;
      return (
        typeof i.key === "string" &&
        typeof i.href === "string" &&
        typeof i.icon?.src === "string" &&
        typeof i.icon?.width === "number" &&
        typeof i.icon?.height === "number" &&
        typeof i.nameImage?.src === "string" &&
        typeof i.nameImage?.width === "number" &&
        typeof i.nameImage?.height === "number"
      );
    });
  } catch {
    return [];
  }
}

export async function InnerFooter() {
  const social_links = await load_social_links();

  return (
    <footer className="site-footer site-footer--inner">
      <div className="container">
        <div className="footer-card">
          {/* TOP */}
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">VP</div>
              <div>
                <div className="footer-brand-title">Director / Video Editor</div>
                <div className="footer-brand-subtitle">
                  Story-first edits • Brand films • Documentaries
                </div>
              </div>
            </div>

            <div className="footer-cta">
              <div className="footer-cta-title">Let’s work together</div>
              <div className="footer-cta-subtitle">
                Available for remote projects and on-site productions in the US.
              </div>

              <div className="footer-cta-actions">
                <a
                  href="/contacts"
                  className="footer-btn footer-btn-primary footer-btn-lg"
                >
                  Get in touch
                </a>
                <a
                  href="mailto:hello@example.com"
                  className="footer-btn footer-btn-outline footer-btn-lg"
                >
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          {/* SOCIAL (ONE LINE, NO FRAMES) */}
          <div className="footer-social-row">
            {social_links.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
              >
                <img
                  src={s.icon.src}
                  alt={`${s.key} icon`}
                  width={s.icon.width}
                  height={s.icon.height}
                  style={{ width: s.icon.width, height: s.icon.height }}
                />
                <img
                  src={s.nameImage.src}
                  alt={`${s.key} name`}
                  width={s.nameImage.width}
                  height={s.nameImage.height}
                  style={{ width: s.nameImage.width, height: s.nameImage.height }}
                />
              </a>
            ))}
          </div>

          {/* CONTACTS ROW */}
          <div className="footer-contacts-row">
            <span>Myrtle Beach, SC 29575 (available worldwide)</span>
            <span className="footer-sep">•</span>
            <a href="tel:+12135551234">+1 (213) 555-1234</a>
            <span className="footer-sep">•</span>
            <a href="mailto:hello@example.com">hello@example.com</a>
          </div>

          <div className="footer-bottom">© {new Date().getFullYear()} Portfolio</div>
        </div>
      </div>
    </footer>
  );
}
