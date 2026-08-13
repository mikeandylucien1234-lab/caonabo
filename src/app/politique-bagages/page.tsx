import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getBaggageOptions } from "@/lib/data/queries";
import { formatPrice } from "@/lib/currency";
import { pageBadge, pageCard, pageH2 } from "@/lib/pageStyles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Politique de Bagages — Caonabo Airlinje" };

// Franchises incluses par classe (le PRIX des suppléments vient de la base).
const CLASSES = [
  { name: "Économique", color: "#5b21b6", cabin: "1 × 8 kg (55 × 40 × 20 cm)", hold: "Non inclus" },
  { name: "Premium", color: "#7c4dd6", cabin: "1 × 10 kg (55 × 40 × 20 cm)", hold: "1 × 23 kg inclus" },
  { name: "Business", color: "#dc2626", cabin: "2 × 10 kg (55 × 40 × 20 cm)", hold: "2 × 23 kg inclus" },
];

const FORBIDDEN = [
  "Batteries au lithium et power banks en soute (autorisées en cabine uniquement)",
  "Liquides de plus de 100 ml dans le bagage cabine",
  "Objets tranchants ou contondants en cabine (couteaux, ciseaux, outils)",
  "Matières inflammables, explosives ou corrosives",
  "Armes, munitions et répliques",
  "Produits périssables non emballés et substances illicites",
];

export default async function BaggagePolicyPage() {
  const options = await getBaggageOptions();
  const paidOptions = options.filter((o) => o.priceCents > 0);

  const th: React.CSSProperties = { textAlign: "left", padding: "14px 18px", fontSize: 13, color: "#8a8aa0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 };
  const td: React.CSSProperties = { padding: "16px 18px", fontSize: 14.5, color: "#3a3a55", borderTop: "1px solid #f0eef7", verticalAlign: "top" };

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/politique-bagages" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>🧳 BAGAGES</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Politique de <span style={{ color: "#5b21b6" }}>Bagages</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Ce qui est inclus selon votre classe, et le tarif des bagages supplémentaires —
          les mêmes que ceux proposés lors de la réservation.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Tableau par classe */}
        <section style={{ ...pageCard, padding: "10px 10px" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr>
                  <th style={th}>Classe</th>
                  <th style={th}>Bagage cabine inclus</th>
                  <th style={th}>Bagage soute inclus</th>
                </tr>
              </thead>
              <tbody>
                {CLASSES.map((c) => (
                  <tr key={c.name}>
                    <td style={td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, color: "#1e1b4b" }}>
                        <span style={{ width: 12, height: 12, borderRadius: 4, background: c.color }} />
                        {c.name}
                      </span>
                    </td>
                    <td style={td}>🧳 {c.cabin}</td>
                    <td style={td}>{c.hold === "Non inclus" ? <span style={{ color: "#8a8aa0" }}>— {c.hold}</span> : `🧳 ${c.hold}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bagages supplémentaires (tarifs = BaggageOption) */}
        <section style={pageCard}>
          <h2 className="font-heading" style={pageH2}>Bagages en soute supplémentaires</h2>
          <p style={{ fontSize: 14.5, color: "#5c5c7a", margin: "0 0 18px" }}>
            Ajoutez des bagages en soute à tout moment, au même prix que dans le tunnel de
            réservation :
          </p>
          <div className="grid-2 bag-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {paidOptions.map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #eceafa", borderRadius: 14, padding: "16px 20px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>🧳</span>
                  <span style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>{o.label}</span>
                </span>
                <span style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 18 }}>+ {formatPrice(o.priceCents, "USD")}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Objets interdits */}
        <section style={{ background: "#fff7f2", border: "1.5px solid #f6d9c7", borderRadius: 20, padding: "26px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: "#fde4d6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚠️</span>
            <h2 className="font-heading" style={{ ...pageH2, margin: 0, color: "#b5480f" }}>Objets interdits</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: 4, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }} className="forbidden-grid">
            {FORBIDDEN.map((f) => (
              <li key={f} style={{ display: "flex", gap: 10, fontSize: 14.5, color: "#7a4a30", lineHeight: 1.5 }}>
                <span style={{ color: "#dc2626", fontWeight: 800 }}>✕</span> {f}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Footer />
    </div>
  );
}
