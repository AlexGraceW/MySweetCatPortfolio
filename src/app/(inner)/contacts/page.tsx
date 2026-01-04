// src/app/contacts/page.tsx

import { prisma } from "../../../lib/prisma";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const page = await prisma.contactsPage.findUnique({ where: { id: 1 } });

  const hero = page ?? {
    heroTitle: "Contact",
    heroSubtitle: "For inquiries, collaborations, or general questions.",
    bannerImageUrl: "/uploads/contacts-banner.jpg"
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-banner contacts">
            <img src={hero.bannerImageUrl} alt="Contacts banner" />
            <div className="hero-text">
              <h1 className="hero-title">{hero.heroTitle}</h1>
              <p className="hero-subtitle">{hero.heroSubtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Get in touch</h2>
            <p className="muted">
              Fill out the form — your message will be delivered to the inbox and saved in the database.
            </p>
            <p className="muted" style={{ marginBottom: 0 }}>
              Typical reply time: within 24 hours.
            </p>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
