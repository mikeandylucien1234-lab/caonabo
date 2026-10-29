import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPromotions } from "@/lib/data/queries";
import { pageBadge } from "@/lib/pageStyles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explorer les Caraïbes — Caonabo Airlinje" };

// Descriptions inspirationnelles par destination (réutilise les images des promos).
const DESC: Record<string, string> = {
  labadee:
    "Plages turquoise et cocotiers sur la côte nord d'Haïti — le refuge balnéaire préféré de la diaspora.",
  "ile-a-rat":
    "Un banc de sable désert cerné d'eaux cristallines, à quelques minutes de bateau du Cap-Haïtien.",
  "citadelle-laferriere":
    "La plus grande forteresse des Caraïbes, symbole de la liberté haïtienne, perchée dans les montagnes.",
  "cap-haitien":
    "La perle du Nord : architecture coloniale, vie nocturne animée et porte d'entrée vers les merveilles alentour.",
};

const ORDER = ["labadee", "ile-a-rat", "citadelle-laferriere", "cap-haitien"];

export default async function ExploreCaribbeanPage() {
  const promos = await getPromotions();
  const selected = ORDER.map((slug) => promos.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/explorer-caraibes" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>🌴 INSPIRATION</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Explorer les <span style={{ color: "#5b21b6" }}>Caraïbes</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Des plages secrètes aux forteresses légendaires : laissez-vous inspirer par les
          trésors qui vous attendent au bout du vol.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px" }}>
        <div className="grid-2 explore-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
          {selected.map((p) => (
            <article
              key={p.slug}
              style={{
                borderRadius: 22,
                overflow: "hidden",
                background: "#fff",
                border: "1px solid #eceafa",
                boxShadow: "0 8px 28px rgba(20,10,60,0.10)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ position: "relative", height: 240 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,10,45,0.72) 0%, rgba(15,10,45,0) 55%)" }} />
                <h2 className="font-heading" style={{ position: "absolute", left: 22, bottom: 16, right: 22, color: "#fff", fontWeight: 800, fontSize: 26, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                  {p.title}
                </h2>
              </div>
              <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                <p style={{ fontSize: 15, color: "#4b4b63", lineHeight: 1.65, margin: 0, flex: 1 }}>
                  {DESC[p.slug] ?? p.routeLabel}
                </p>
                <Link
                  href={`/book?origin=${p.originCode}&destination=${p.destinationCode}`}
                  style={{
                    alignSelf: "flex-start",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#3d1e8a",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14.5,
                    padding: "12px 22px",
                    borderRadius: 12,
                    textDecoration: "none",
                  }}
                >
                  Voir les vols <span>✈</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
