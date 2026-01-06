"use client";

import { useEffect, useMemo, useState } from "react";

type HomeDto = {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  bannerImageUrl: string;
  directorName: string;
  directorRole: string;
  directorAvatarUrl: string;

  // ✅ NEW (optional)
  profileBgImageUrl?: string | null;

  introProvider: string;
  introVideoUrl: string;
  aboutTitle: string;
  aboutHtml: string;
};

type SectionDto = {
  id: number;
  title: string;
  html: string;
  photoUrl: string;
  sortOrder: number;
};

export default function AdminHomePage() {
  const [home, setHome] = useState<HomeDto | null>(null);
  const [sections, setSections] = useState<SectionDto[]>([]);
  const [status, setStatus] = useState("");

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.sortOrder - b.sortOrder),
    [sections]
  );

  async function load() {
    setStatus("");
    const res = await fetch("/api/admin/home");
    const data = await res.json();
    setHome(data.home);
    setSections(data.sections);
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveHome() {
    if (!home) return;
    setStatus("Saving...");
    const res = await fetch("/api/admin/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(home)
    });

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(d?.error || "Failed to save");
      return;
    }

    setStatus("Saved");
    await load();
  }

  async function addSection() {
    setStatus("Adding section...");
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Background",
        html: "<p>Write your text here...</p>",
        photoUrl: "/uploads/placeholder.jpg"
      })
    });

    if (!res.ok) setStatus("Failed to add section");
    else setStatus("Section added");
    await load();
  }

  async function deleteSection(id: number) {
    setStatus("Deleting...");
    await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    setStatus("Deleted");
    await load();
  }

  async function updateSection(id: number, patch: Partial<SectionDto>) {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d?.error || "Failed to save section");
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const list = sortedSections;
    const idx = list.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    const a = list[idx];
    const b = list[swapIdx];

    await updateSection(a.id, { sortOrder: b.sortOrder });
    await updateSection(b.id, { sortOrder: a.sortOrder });
    await load();
  }

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url as string;
  }

  if (!home) {
    return (
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <div className="muted">Loading...</div>
      </div>
    );
  }

  const profile_bg_value = (home.profileBgImageUrl || "").toString();

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ marginTop: 0 }}>Home</h1>
            <div className="muted">Edit hero + intro + About + sections.</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn"
              onClick={() =>
                fetch("/api/admin/logout", { method: "POST" }).then(() =>
                  location.replace("/admin/login")
                )
              }
            >
              Logout
            </button>
            <button className="btn btn-primary" onClick={saveHome}>
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 14, alignItems: "start" }}>
          <div className="grid" style={{ gap: 10 }}>
            <input
              className="input"
              value={home.heroTitle}
              onChange={(e) => setHome({ ...home, heroTitle: e.target.value })}
              placeholder="Hero title"
            />
            <input
              className="input"
              value={home.heroSubtitle}
              onChange={(e) => setHome({ ...home, heroSubtitle: e.target.value })}
              placeholder="Hero subtitle"
            />

            <input
              className="input"
              value={home.bannerImageUrl}
              onChange={(e) => setHome({ ...home, bannerImageUrl: e.target.value })}
              placeholder="Banner URL"
            />
            <div className="card" style={{ padding: 10 }}>
              <div className="muted" style={{ marginBottom: 8 }}>
                Banner preview
              </div>
              <img
                src={home.bannerImageUrl}
                alt="Banner preview"
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: "1px solid var(--line)"
                }}
              />
            </div>

            <input
              className="input"
              value={home.directorName}
              onChange={(e) => setHome({ ...home, directorName: e.target.value })}
              placeholder="Name"
            />
            <input
              className="input"
              value={home.directorRole}
              onChange={(e) => setHome({ ...home, directorRole: e.target.value })}
              placeholder="Role"
            />

            <input
              className="input"
              value={home.directorAvatarUrl}
              onChange={(e) => setHome({ ...home, directorAvatarUrl: e.target.value })}
              placeholder="Avatar URL"
            />
            <div className="card" style={{ padding: 10 }}>
              <div className="muted" style={{ marginBottom: 8 }}>
                Avatar preview
              </div>
              <img
                src={home.directorAvatarUrl}
                alt="Avatar preview"
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "cover",
                  borderRadius: 999,
                  border: "1px solid var(--line)"
                }}
              />
            </div>

            {/* ✅ NEW: Profile background image */}
            <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "10px 0" }} />
            <div className="muted" style={{ marginTop: -2 }}>
              Avatar section background (optional)
            </div>

            <input
              className="input"
              value={profile_bg_value}
              onChange={(e) => setHome({ ...home, profileBgImageUrl: e.target.value })}
              placeholder="Profile background URL (optional)"
            />

            <div className="grid grid-2" style={{ alignItems: "start", gap: 10 }}>
              <div className="card" style={{ padding: 10 }}>
                <div className="muted" style={{ marginBottom: 8 }}>
                  Background preview
                </div>
                {profile_bg_value ? (
                  <img
                    src={profile_bg_value}
                    alt="Profile background preview"
                    style={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid var(--line)"
                    }}
                  />
                ) : (
                  <div className="muted">No background image</div>
                )}
              </div>

              <div className="card" style={{ padding: 10 }}>
                <div className="muted" style={{ marginBottom: 8 }}>
                  Upload & set background
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;

                    setStatus("Uploading...");
                    try {
                      const url = await uploadFile(f);
                      setHome({ ...home, profileBgImageUrl: url });
                      setStatus(`Uploaded: ${url}`);
                    } catch (err: any) {
                      setStatus(err?.message || "Upload error");
                    } finally {
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <div className="muted" style={{ marginTop: 8 }}>
                  Tip: upload → it auto-fills Profile background URL.
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "10px 0" }} />

            <input
              className="input"
              value={home.introProvider}
              onChange={(e) => setHome({ ...home, introProvider: e.target.value })}
              placeholder='Intro provider: "YOUTUBE" | "VIMEO" | "SELF"'
            />
            <input
              className="input"
              value={home.introVideoUrl}
              onChange={(e) => setHome({ ...home, introVideoUrl: e.target.value })}
              placeholder="Intro video URL"
            />

            <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "10px 0" }} />

            <input
              className="input"
              value={home.aboutTitle}
              onChange={(e) => setHome({ ...home, aboutTitle: e.target.value })}
              placeholder="About title"
            />
            <textarea
              className="textarea"
              value={home.aboutHtml}
              onChange={(e) => setHome({ ...home, aboutHtml: e.target.value })}
              placeholder='About HTML, e.g. <p>...</p>'
            />
          </div>

          <div className="card" style={{ borderRadius: 18 }}>
            <h3 style={{ marginTop: 0 }}>Upload</h3>
            <div className="muted">
              Upload image/video to <b>/public/uploads</b> → get <b>/uploads/...</b>
            </div>

            <div style={{ marginTop: 10 }}>
              <input
                type="file"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;

                  setStatus("Uploading...");
                  try {
                    const url = await uploadFile(f);
                    setStatus(`Uploaded: ${url}`);
                  } catch (err: any) {
                    setStatus(err?.message || "Upload error");
                  } finally {
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>

            <div className="card" style={{ padding: 10, marginTop: 12 }}>
              <div className="muted" style={{ marginBottom: 8 }}>
                About preview
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{home.aboutTitle}</div>
              <div
                className="muted"
                style={{ lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: home.aboutHtml }}
              />
            </div>
          </div>
        </div>

        {status && <div className="muted" style={{ marginTop: 10 }}>{status}</div>}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ marginTop: 0 }}>Sections</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={load}>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={addSection}>
              Add section
            </button>
          </div>
        </div>

        <div className="grid" style={{ gap: 12, marginTop: 12 }}>
          {sortedSections.map((s) => (
            <SectionEditor
              key={s.id}
              section={s}
              onDelete={() => deleteSection(s.id)}
              onMoveUp={() => move(s.id, -1)}
              onMoveDown={() => move(s.id, 1)}
              onSave={async (next) => {
                setStatus("Saving section...");
                try {
                  await updateSection(s.id, next);
                  setStatus("Saved");
                  await load();
                } catch (e: any) {
                  setStatus(e?.message || "Failed to save");
                }
              }}
              onUpload={async (file) => {
                setStatus("Uploading...");
                const url = await uploadFile(file);
                setStatus(`Uploaded: ${url}`);
                return url;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSave,
  onUpload
}: {
  section: SectionDto;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: (patch: Partial<SectionDto>) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}) {
  const [title, setTitle] = useState(section.title);
  const [photoUrl, setPhotoUrl] = useState(section.photoUrl);
  const [html, setHtml] = useState(section.html);

  useEffect(() => {
    setTitle(section.title);
    setPhotoUrl(section.photoUrl);
    setHtml(section.html);
  }, [section.id, section.title, section.photoUrl, section.html]);

  return (
    <div className="card" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700 }}>Section #{section.id}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={onMoveUp}>
            Up
          </button>
          <button className="btn" onClick={onMoveDown}>
            Down
          </button>
          <button className="btn" onClick={onDelete}>
            Delete
          </button>
          <button className="btn btn-primary" onClick={() => onSave({ title, photoUrl, html })}>
            Save section
          </button>
        </div>
      </div>

      <div className="grid" style={{ gap: 10, marginTop: 10 }}>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="grid" style={{ gap: 10 }}>
            <input className="input" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            <input
              type="file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await onUpload(f);
                setPhotoUrl(url);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <div className="card" style={{ padding: 10 }}>
            <div className="muted" style={{ marginBottom: 8 }}>
              Photo preview
            </div>
            <img
              src={photoUrl}
              alt="Section preview"
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
                borderRadius: 12,
                border: "1px solid var(--line)"
              }}
            />
          </div>
        </div>

        <textarea className="textarea" value={html} onChange={(e) => setHtml(e.target.value)} />
      </div>
    </div>
  );
}
