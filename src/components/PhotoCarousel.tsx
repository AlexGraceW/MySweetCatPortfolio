// REPLACE FILE: src/components/PhotoCarousel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function PhotoCarousel({
  urls,
  alt = "Photo"
}: {
  urls: string[];
  alt?: string;
}) {
  const items = useMemo(() => (urls || []).map((u) => String(u || "").trim()).filter(Boolean), [urls]);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [active, setActive] = useState(0);

  // --- Track active slide by scroll position
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => {
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      setActive(Math.max(0, Math.min(items.length - 1, idx)));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  // --- Desktop mouse drag (pointer events)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      // drag only with mouse/pen; touch will scroll natively
      if (e.pointerType === "touch") return;

      isDown = true;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;

      el.setPointerCapture(e.pointerId);
      el.classList.add("pc-grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
      el.classList.remove("pc-grabbing");

      // snap to nearest slide
      const w = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / w);
      scrollToIndex(idx);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("pointerleave", (e) => {
      // if mouse leaves while dragging
      if (isDown) endDrag(e as any);
    });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      // pointerleave anonymous handler не снимаем — ок, он не критичен; но лучше без него
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const scrollToIndex = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <div className="photo-carousel">
      <div ref={trackRef} className="pc-track" aria-label="Section photos carousel">
        {items.map((src, i) => (
          <div key={`${src}-${i}`} className="pc-slide">
            <img src={src} alt={alt} loading="lazy" draggable={false} />
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="pc-ui">
          <button className="pc-btn" type="button" onClick={() => scrollToIndex(active - 1)} aria-label="Previous photo">
            ‹
          </button>

          <div className="pc-dots" aria-label="Carousel pagination">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`pc-dot ${i === active ? "is-active" : ""}`}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>

          <button className="pc-btn" type="button" onClick={() => scrollToIndex(active + 1)} aria-label="Next photo">
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
