// src/components/HeroBanner.tsx
import React from "react";

export function HeroBanner({
  variant, // "home" | "works" | "contacts"
  imageUrl,
  title,
  subtitle,
  children
}: {
  variant: "home" | "works" | "contacts";
  imageUrl: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode; // например, аватар на Home
}) {
  return (
    <section className="hero">
      <div className="container">
        <div className={`hero-banner ${variant}`}>
          <img src={imageUrl} alt="Banner" />

          {/* ВАЖНО: единая структура для ВСЕХ страниц */}
          <div className="hero-text hero-text--split">
            <div className="hero-title-wrap">
              <h1 className="hero-title">{title}</h1>
            </div>

            <div className="hero-subtitle-wrap">
              <p className="hero-subtitle">{subtitle}</p>
            </div>
          </div>

          {/* Слои поверх баннера (только где нужно) */}
          {children}
        </div>
      </div>
    </section>
  );
}
