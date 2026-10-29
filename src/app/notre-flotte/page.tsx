import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { pageBadge, pageCard, pageH2, pageP } from "@/lib/pageStyles";

export const metadata = { title: "Notre Flotte — Caonabo Airlinje" };

// Appareil unique de la compagnie : Boeing 737-400 en affrètement complet.
const AIRCRAFT = {
  name: "Boeing 737-400",
  kind: "Affrètement complet",
  capacity: "150 passagers",
  layout: "12 Première classe + 138 Économique",
  desc: "Caonabo Airlinje opère l'ensemble de ses liaisons avec un unique Boeing 737-400 affrété en totalité. Un appareil éprouvé, fiable et parfaitement dimensionné pour relier sans détour les communautés de la diaspora — chaque vol est intégralement réservé à nos passagers.",
};

const CABINS = [
  { name: "Première classe", color: "#a9820f", seats: "12 sièges · disposition 2-2", desc: "À l'avant de l'appareil : plus d'espace, embarquement prioritaire et service attentionné pour un voyage tout confort." },
  { name: "Économique", color: "#5b21b6", seats: "138 sièges · disposition 3-3", desc: "Des sièges confortables, en-cas et boissons offerts, et la franchise bagages incluse (1 soute 23 kg + 1 cabine 8 kg)." },
];

export default function FleetPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/notre-flotte" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>🛩 NOTRE FLOTTE</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Notre <span style={{ color: "#5b21b6" }}>Flotte</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Un appareil unique, entièrement affrété, choisi pour relier confortablement
          chaque communauté de la diaspora.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 60px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Appareil unique */}
        <section style={pageCard}>
          <div className="fleet-row" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 32, alignItems: "center" }}>
            <div style={{ background: "#f7f5fd", borderRadius: 16, padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlaneSilhouette />
            </div>
            <div>
              <div style={{ display: "inline-block", background: "#f0ecfb", color: "#5b21b6", fontWeight: 700, fontSize: 12, padding: "5px 12px", borderRadius: 999, marginBottom: 10 }}>
                {AIRCRAFT.kind}
              </div>
              <h2 className="font-heading" style={{ ...pageH2, marginBottom: 8 }}>{AIRCRAFT.name}</h2>
              <p style={{ ...pageP, marginBottom: 16 }}>{AIRCRAFT.desc}</p>
              <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
                <Spec icon="👥" label="Capacité totale" value={AIRCRAFT.capacity} />
                <Spec icon="🪑" label="Configuration" value={AIRCRAFT.layout} />
                <Spec icon="✈️" label="Exploitation" value="Affrètement complet" />
              </div>
            </div>
          </div>
        </section>

        {/* Classes à bord */}
        <section style={pageCard}>
          <h2 className="font-heading" style={pageH2}>Les classes à bord</h2>
          <p style={{ ...pageP, marginTop: 6, marginBottom: 4 }}>
            Deux classes réparties dans une même cabine de 150 places.
          </p>
          <div className="grid-2 cabin-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 12 }}>
            {CABINS.map((c) => (
              <div key={c.name} style={{ border: "1px solid #eceafa", borderRadius: 16, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color }} />
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#1e1b4b" }}>{c.name}</div>
                </div>
                <div style={{ fontSize: 12.5, color: "#8a8aa0", fontWeight: 700, marginBottom: 10 }}>{c.seats}</div>
                <p style={{ fontSize: 14, color: "#5c5c7a", lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

function Spec({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#8a8aa0", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 15, color: "#1e1b4b", fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

// Silhouette d'avion de profil (aplat violet, charte Caonabo)
function PlaneSilhouette() {
  return (
    <svg viewBox="0 0 360 150" width="100%" style={{ maxWidth: 360, height: "auto" }} role="img" aria-label="Silhouette d'avion Caonabo">
      {/* aile avant (claire) */}
      <path d="M150 84 L120 128 L142 128 L196 90 Z" fill="#c9b8ef" />
      {/* fuselage */}
      <ellipse cx="182" cy="80" rx="158" ry="20" fill="#5b21b6" />
      {/* dérive (empennage vertical) */}
      <path d="M300 80 L342 32 L322 78 Z" fill="#3d1e8a" />
      {/* stabilisateur horizontal */}
      <path d="M296 74 L332 62 L318 80 Z" fill="#3d1e8a" />
      {/* aile principale (foncée, vers l'arrière) */}
      <path d="M172 96 L232 130 L252 128 L200 92 Z" fill="#3d1e8a" />
      {/* réacteur */}
      <ellipse cx="176" cy="102" rx="17" ry="7" fill="#2a1466" />
      {/* cockpit */}
      <path d="M32 74 q-10 6 2 13 l14 -3 q-6 -7 -2 -12 z" fill="#3d1e8a" />
      {/* hublots */}
      {Array.from({ length: 11 }).map((_, i) => (
        <circle key={i} cx={80 + i * 19} cy={77} r="2.6" fill="#efeafc" />
      ))}
      {/* logo de dérive */}
      <circle cx="322" cy="52" r="5" fill="#dc2626" />
    </svg>
  );
}
