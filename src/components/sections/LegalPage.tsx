import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Gabarit sobre pour les pages légales : en-tête, sommaire ancré, sections
// numérotées, encadré « dernière mise à jour » + retour accueil.

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

export default function LegalPage({
  active,
  eyebrow,
  title,
  intro,
  sections,
  lastUpdated,
}: {
  active: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  lastUpdated: string;
}) {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active={active} />

      <div className="hz" style={{ padding: "44px 56px 70px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* en-tête */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#5b21b6", marginBottom: 10 }}>
            {eyebrow}
          </div>
          <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 36, color: "#0f0f2d", margin: "0 0 12px", lineHeight: 1.2 }}>
            {title}
          </h1>
          <p style={{ color: "#5c5c7a", fontSize: 15.5, lineHeight: 1.7, margin: "0 0 28px", maxWidth: 720 }}>
            {intro}
          </p>

          {/* sommaire cliquable */}
          <nav
            aria-label="Sommaire"
            style={{
              background: "#f8f6ff",
              border: "1px solid #eae6fa",
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 40,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: "#3d1e8a", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 }}>
              Sommaire
            </div>
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }} className="legal-toc">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    style={{ color: "#4b4b63", fontSize: 14, textDecoration: "none", display: "flex", gap: 8 }}
                  >
                    <span style={{ color: "#5b21b6", fontWeight: 700 }}>{i + 1}.</span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} style={{ scrollMarginTop: 90 }}>
                <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 20, color: "#1e1b4b", margin: "0 0 12px" }}>
                  <span style={{ color: "#5b21b6" }}>{i + 1}.</span> {s.heading}
                </h2>
                <div style={{ color: "#3a3a55", fontSize: 15, lineHeight: 1.8 }}>{s.body}</div>
              </section>
            ))}
          </div>

          {/* encadré fin de page */}
          <div
            style={{
              marginTop: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              background: "#faf9fc",
              border: "1px solid #eceafa",
              borderRadius: 14,
              padding: "16px 22px",
            }}
          >
            <span style={{ fontSize: 13.5, color: "#8a8aa0" }}>
              Dernière mise à jour : <b style={{ color: "#5c5c7a" }}>{lastUpdated}</b>
            </span>
            <Link href="/" style={{ fontSize: 14, fontWeight: 700, color: "#3d1e8a", textDecoration: "none" }}>
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Petit helper : paragraphe standard pour le corps des sections.
export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 12px" }}>{children}</p>;
}

// Liste à puces standard.
export function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
      {items.map((it, i) => (
        <li key={i} style={{ marginBottom: 6 }}>
          {it}
        </li>
      ))}
    </ul>
  );
}
