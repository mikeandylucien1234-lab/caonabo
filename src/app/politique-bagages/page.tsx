import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getBaggagePolicy } from "@/lib/data/queries";
import { formatPrice } from "@/lib/currency";
import { pageBadge, pageCard, pageH2 } from "@/lib/pageStyles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Politique de Bagages — Caonabo Airlinje" };

const FORBIDDEN = [
  "Batteries au lithium et power banks en soute (autorisées en cabine uniquement)",
  "Liquides de plus de 100 ml dans le bagage cabine",
  "Objets tranchants ou contondants en cabine (couteaux, ciseaux, outils)",
  "Matières inflammables, explosives ou corrosives",
  "Armes, munitions et répliques",
  "Produits périssables non emballés et substances illicites",
];

export default async function BaggagePolicyPage() {
  const policy = await getBaggagePolicy();

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/politique-bagages" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>🧳 BAGAGES</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Politique de <span style={{ color: "#5b21b6" }}>Bagages</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Les mêmes conditions pour tous les passagers de notre Boeing 737-400 —
          identiques à celles proposées lors de la réservation.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Franchise incluse pour tous */}
        <section style={pageCard}>
          <h2 className="font-heading" style={pageH2}>Inclus pour chaque passager</h2>
          <p style={{ fontSize: 14.5, color: "#5c5c7a", margin: "6px 0 18px" }}>
            Chaque billet comprend, sans supplément :
          </p>
          <div className="grid-2 bag-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <IncludedCard
              icon="🧳"
              title="1 bagage en soute"
              value={`Jusqu'à ${policy.includedCheckedKg} kg`}
            />
            <IncludedCard
              icon="🎒"
              title="1 bagage cabine"
              value={`Jusqu'à ${policy.includedCabinKg} kg`}
            />
          </div>
        </section>

        {/* Suppléments */}
        <section style={pageCard}>
          <h2 className="font-heading" style={pageH2}>Bagages supplémentaires</h2>
          <p style={{ fontSize: 14.5, color: "#5c5c7a", margin: "6px 0 18px" }}>
            Au-delà de la franchise incluse, aux mêmes tarifs que dans le tunnel de
            réservation :
          </p>
          <div className="grid-2 bag-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <SupplementCard
              icon="⚖️"
              title="Poids supplémentaire"
              desc={`Au-delà des ${policy.includedCheckedKg} kg inclus en soute`}
              price={`${formatPrice(policy.extraKgPriceCents, "USD")} / kg`}
            />
            <SupplementCard
              icon="🧳"
              title="Valise entière supplémentaire"
              desc="Un second bagage en soute complet"
              price={`${formatPrice(policy.extraBagPriceCents, "USD")} / valise`}
            />
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

function IncludedCard({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, border: "1.5px solid #cbe8d3", background: "#f2fbf5", borderRadius: 14, padding: "18px 20px" }}>
      <span style={{ width: 46, height: 46, borderRadius: 12, background: "#dbf3e3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 15.5 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: "#2f6b46", fontWeight: 600, marginTop: 2 }}>✓ {value} · inclus</div>
      </div>
    </div>
  );
}

function SupplementCard({ icon, title, desc, price }: { icon: string; title: string; desc: string; price: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid #eceafa", borderRadius: 14, padding: "16px 20px" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</span>
        <span>
          <span style={{ display: "block", fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>{title}</span>
          <span style={{ display: "block", fontSize: 12.5, color: "#8a8aa0", marginTop: 2 }}>{desc}</span>
        </span>
      </span>
      <span style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 16, whiteSpace: "nowrap" }}>+ {price}</span>
    </div>
  );
}
