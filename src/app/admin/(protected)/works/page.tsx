"use client";

import { useEffect, useMemo, useState } from "react";

type WorksPageDto = {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  bannerImageUrl: string;
};

type WorkDto = {
  id: number;
  title: string;
  slug: string;
  description: string;
  provider: string; // YOUTUBE | VIMEO | SELF
  videoUrl: string;
  sortOrder: number;
  published: boolean;
};

export default function AdminWorksPage() {
  const [page, setPage] = useState<WorksPageDto | null>(null);
  const [works, setWorks] = useState<WorkDto[]>([]);
  const [status, setStatus] = useState("");

  const sorted = useMemo(
    () => [...works].sort((a, b) => a.sortOrder - b.sortOrder),
    [works]
  );

  async function load() {
    setStatus("");
    const res = await fetch("/api/admin/works");
    const data = await res.json();
    setPage(data.page);
    setWorks(data.works);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save_page() {
    if (!page) return;
    setStatus("Saving page...");
    const res = await fetch("/api/admin/works-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page)
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(d?.error || "Failed to save");
      return;
    }

    setStatus("Saved");
    await load();
  }

  async function add_work() {
    setStatus("Adding...");
    const res = await fetch("/api/admin/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New work",
        description: "Short description...",
        provider: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        published: true
      })
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(d?.error || "Failed to add");
      return;
    }

    setStatus("Added");
    await load();
  }

  async function patch_work(id: number, patch: Partial<WorkDto>) {
    const res = await fetch(`/api/admin/works/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d?.error || "Failed to save work");
  }

  async function delete_work(id: number) {
    setStatus("Deleting...");
    await fetch(`/api/admin/works/${id}`, { method: "DELETE" });
    setStatus("Deleted");
    await load();
  }

  async function move(id: number, dir: -1 | 1) {
    const list = sorted;
    const idx = list.findIndex((w) => w.id === id);
    if (idx < 0) return;

    const swap = idx + dir;
    if (swap < 0 || swap >= list.length) return;

    const a = list[idx];
    const b = list[swap];

    await patch_work(a.id, { sortOrder: b.sortOrder });
    await patch_work(b.id, { sortOrder: a.sortOrder });

    await load();
  }

  if (!page) {
    return (
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Works</h1>
        <div className="muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* PAGE SETTINGS */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap"
          }}
        >
          <div>
            <h1 style={{ marginTop: 0 }}>Works Page</h1>
            <div className="muted">Hero banner and gallery</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={load}>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={save_page}>
              Save page
            </button>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 14, alignItems: "start" }}>
          <div className="grid" style={{ gap: 10 }}>
            <input
              className="input"
              value={page.heroTitle}
              onChange={(e) => setPage({ ...page, heroTitle: e.target.value })}
              placeholder="Hero title"
            />
            <input
              className="input"
              value={page.heroSubtitle}
              onChange={(e) => setPage({ ...page, heroSubtitle: e.target.value })}
              placeholder="Hero subtitle"
            />
            <input
              className="input"
              value={page.bannerImageUrl}
              onChange={(e) => setPage({ ...page, bannerImageUrl: e.target.value })}
              placeholder="Banner image URL"
            />
          </div>

          <div className="card" style={{ padding: 10 }}>
            <div className="muted" style={{ marginBottom: 8 }}>
              Banner preview
            </div>
            <img
              src={page.bannerImageUrl}
              alt="Works banner preview"
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "#0f1220"
              }}
            />
          </div>
        </div>

        {status && <div className="muted" style={{ marginTop: 10 }}>{status}</div>}
      </div>

      {/* WORKS */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap"
          }}
        >
          <h2 style={{ marginTop: 0 }}>Works gallery</h2>
          <button className="btn btn-primary" onClick={add_work}>
            Add work
          </button>
        </div>

        <div className="grid" style={{ gap: 12, marginTop: 12 }}>
          {sorted.map((w) => (
            <WorkEditor
              key={w.id}
              work={w}
              onMoveUp={() => move(w.id, -1)}
              onMoveDown={() => move(w.id, 1)}
              onDelete={() => delete_work(w.id)}
              onSave={async (patch) => {
                setStatus("Saving...");
                try {
                  await patch_work(w.id, patch);
                  setStatus("Saved");
                  await load();
                } catch (e: any) {
                  setStatus(e?.message || "Failed to save");
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkEditor({
  work,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSave
}: {
  work: WorkDto;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onSave: (patch: Partial<WorkDto>) => Promise<void>;
}) {
  const [title, setTitle] = useState(work.title);
  const [description, setDescription] = useState(work.description);
  const [provider, setProvider] = useState(work.provider);
  const [videoUrl, setVideoUrl] = useState(work.videoUrl);
  const [published, setPublished] = useState(work.published);

  useEffect(() => {
    setTitle(work.title);
    setDescription(work.description);
    setProvider(work.provider);
    setVideoUrl(work.videoUrl);
    setPublished(work.published);
  }, [work.id, work.title, work.description, work.provider, work.videoUrl, work.published]);

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap"
        }}
      >
        <div style={{ fontWeight: 600 }}>
          #{work.id} — {work.slug}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={onMoveUp}>
            Up
          </button>
          <button className="btn" onClick={onMoveDown}>
            Down
          </button>
          <button className="btn" onClick={onDelete}>
            Delete
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onSave({
                title,
                description,
                provider,
                videoUrl,
                published
              })
            }
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid" style={{ gap: 10, marginTop: 12 }}>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <textarea
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
        />

        <div className="grid grid-2">
          <input
            className="input"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Provider: YOUTUBE | VIMEO | SELF"
          />
          <input
            className="input"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Video URL"
          />
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span className="muted">Published</span>
        </label>

        {/* PREVIEW */}
        <div className="card" style={{ padding: 10 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Preview
          </div>
          <VideoPreview provider={provider} url={videoUrl} />
        </div>
      </div>
    </div>
  );
}

function VideoPreview({ provider, url }: { provider: string; url: string }) {
  const u = (url || "").trim();
  if (!u) return <div className="muted">No video URL</div>;

  if (provider === "SELF") {
    return (
      <video
        src={u}
        controls
        style={{
          width: "100%",
          height: 260,
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
        title="Vimeo preview"
        allow="autoplay; fullscreen; picture-in-picture"
        style={{
          width: "100%",
          height: 260,
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
      title="YouTube preview"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      style={{
        width: "100%",
        height: 260,
        border: "1px solid var(--line)",
        borderRadius: 14
      }}
    />
  );
}

function extract_youtube_id(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || null;
    }
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

function extract_vimeo_id(input: string): string | null {
  const m = input.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}
