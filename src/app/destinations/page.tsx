import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCities } from "@/lib/data/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nos Destinations — Caonabo Airlinje" };

// Détails éditoriaux par code IATA (la LISTE des villes vient de la table Airport).
const DETAILS: Record<string, { description: string; image?: string }> = {
  SCL: { description: "Notre hub principal, avec des connexions vers Port-au-Prince, Toronto et au-delà." },
  PAP: { description: "La capitale d'Haïti. Vols directs et connexions vers Cap-Haïtien.", image: "/images/dest-port-au-prince.webp" },
  YYZ: { description: "Vols directs reliant Haïti et le Chili au Canada, porte d'entrée pour la diaspora.", image: "/images/dest-toronto.webp" },
  LIM: { description: "Ville majeure avec une escale, idéale pour découvrir les Andes." },
  CAP: { description: "Ville historique du nord, porte vers la Citadelle Laferrière.", image: "/images/promo-cap-haitien.webp" },
  YUL: { description: "Connexion directe avec un fort lien culturel avec la diaspora haïtienne." },
};

// Ordre d'affichage préféré (les autres villes suivent).
const ORDER = ["SCL", "PAP", "YYZ", "LIM", "CAP", "YUL"];

export default async function DestinationsPage() {
  const cities = await getCities();
  const sorted = [...cities].sort((a, b) => {
    const ia = ORDER.indexOf(a.code);
    const ib = ORDER.indexOf(b.code);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/destinations" />

      <div className="hz" style={{ padding: "48px 56px 90px" }}>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 40, color: "#1e1b4b", margin: 0 }}>
          Nos Destinations
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, lineHeight: 1.7, margin: "14px 0 36px", maxWidth: 760 }}>
          Caonabo Airlinje relie le Chili, Haïti, le Canada et au-delà avec des vols sûrs et
          abordables. Découvrez nos principales destinations et réservez votre prochaine aventure.
        </p>

        <div className="dest-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26 }}>
          {sorted.map((c) => {
            const d = DETAILS[c.code];
            return (
              <article
                key={c.code}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  borderLeft: "5px solid #dc2626",
                  boxShadow: "0 6px 24px rgba(20,10,60,0.08)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* visuel */}
                <div style={{ position: "relative", height: 200, background: "#eef0f5" }}>
                  {d?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.image} alt={`${c.city}, ${c.country}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg,#efeafc 0%,#e7effa 100%)" }}>
                      <ImageGlyph />
                      <span style={{ fontSize: 13, color: "#8a8aa0", fontWeight: 600 }}>{c.city}, {c.country}</span>
                    </div>
                  )}
                </div>

                {/* contenu */}
                <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 21, color: "#1e1b4b", margin: 0 }}>
                    {c.city}
                  </h2>
                  <div style={{ fontSize: 14, color: "#5c5c7a" }}>
                    <b style={{ color: "#3a3a55" }}>Pays :</b> {c.country}
                  </div>
                  <p style={{ fontSize: 14.5, color: "#6b6b80", lineHeight: 1.6, margin: "2px 0 4px", flex: 1 }}>
                    {d?.description ?? `Vols Caonabo Airlinje vers ${c.city}.`}
                  </p>
                  <Link
                    href={`/book?destination=${c.code}`}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#dc2626", fontWeight: 700, fontSize: 14.5, textDecoration: "none" }}
                  >
                    Réserver un vol →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ImageGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#b7b2d0" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M21 16l-5-5-7 7" />
    </svg>
  );
}
