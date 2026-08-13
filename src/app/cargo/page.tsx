import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CargoTracker from "@/components/sections/CargoTracker";
import { pageBadge, pageCard, pageH2, pageP } from "@/lib/pageStyles";

export const metadata = { title: "Courrier et Cargo — Caonabo Airlinje" };

const TYPES = [
  { icon: <IconDoc />, title: "Documents & courrier", desc: "Plis, contrats et documents urgents acheminés sur nos vols réguliers, de la diaspora vers Haïti et retour." },
  { icon: <IconBox />, title: "Colis standard", desc: "Jusqu'à 30 kg par colis, suivis de bout en bout entre toutes nos destinations passagers." },
  { icon: <IconSpecial />, title: "Marchandises spéciales", desc: "Denrées, produits pharmaceutiques ou objets fragiles avec emballage et manutention dédiés." },
];

export default function CargoPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/cargo" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>📦 FRET AÉRIEN</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Courrier et <span style={{ color: "#5b21b6" }}>Cargo</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Envoyez colis et courrier sur le même réseau que nos passagers — entre le Chili,
          Haïti, le Canada et l'Amérique du Sud.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Types d'envois */}
        <div className="grid-2 cargo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {TYPES.map((t) => (
            <section key={t.title} style={pageCard}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {t.icon}
              </div>
              <h2 className="font-heading" style={{ ...pageH2, fontSize: 19 }}>{t.title}</h2>
              <p style={{ ...pageP, margin: 0, fontSize: 14.5 }}>{t.desc}</p>
            </section>
          ))}
        </div>

        {/* Suivi d'envoi */}
        <section style={pageCard}>
          <h2 className="font-heading" style={pageH2}>Suivre mon envoi</h2>
          <p style={{ ...pageP, marginTop: 0 }}>
            Entrez votre numéro de suivi pour connaître l'état d'acheminement de votre colis.
          </p>
          <CargoTracker />
        </section>
      </div>

      <Footer />
    </div>
  );
}

function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
function IconSpecial() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 6v6c0 5 3.4 8 8 10 4.6-2 8-5 8-10V6z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  );
}
