"use client";

import { useEffect, useState } from "react";

type ContactsPageDto = {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  bannerImageUrl: string;
};

export default function AdminContactsPage() {
  const [page, setPage] = useState<ContactsPageDto | null>(null);
  const [status, setStatus] = useState("");

  async function load() {
    setStatus("");
    const res = await fetch("/api/admin/contacts-page");
    const data = await res.json();
    setPage(data.page);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save_page() {
    if (!page) return;

    setStatus("Saving...");
    const res = await fetch("/api/admin/contacts-page", {
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

  if (!page) {
    return (
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Contacts</h1>
        <div className="muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
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
            <h1 style={{ marginTop: 0 }}>Contacts Page</h1>
            <div className="muted">Hero banner settings</div>
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
              alt="Contacts banner preview"
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
    </div>
  );
}
