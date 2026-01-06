import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/HeroBanner";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const page = await prisma.contactsPage.findUnique({ where: { id: 1 } });

  if (!page) {
    return (
      <section className="section">
        <div className="container">
          <div className="card">
            <h1>Not configured yet</h1>
            <p className="muted">Please configure Contacts in admin.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <HeroBanner
        variant="contacts"
        imageUrl={page.bannerImageUrl}
        title={page.heroTitle}
        subtitle={page.heroSubtitle}
      />

      <section className="section">
        <div className="container contacts-grid">
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Message</h2>
            <ContactForm />
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Contact</h2>
            <p className="muted">For inquiries, collaborations, or general questions.</p>
          </div>
        </div>
      </section>
    </>
  );
}
