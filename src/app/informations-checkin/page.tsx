import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { pageBadge, pageCard, pageH2, pageP } from "@/lib/pageStyles";

export const metadata = { title: "Informations Check-In — Caonabo Airlinje" };

const STEPS = [
  { icon: "🔎", title: "Retrouvez votre réservation", desc: "Saisissez votre référence (PNR) et le nom du passager pour ouvrir votre dossier." },
  { icon: "🪪", title: "Confirmez votre identité", desc: "Vérifiez vos informations et celles de vos documents de voyage." },
  { icon: "💺", title: "Choisissez votre siège", desc: "Sélectionnez ou confirmez votre place à bord parmi les sièges disponibles." },
  { icon: "🎫", title: "Obtenez votre carte d'embarquement", desc: "Recevez votre carte d'embarquement à présenter à l'aéroport, sur mobile ou imprimée." },
];

const OPTIONS = [
  { icon: "📱", title: "Web Check-In", desc: "Disponible de 24 heures à 2 heures avant le départ. La façon la plus rapide : plus de file d'attente au comptoir." },
  { icon: "🏢", title: "Comptoir à l'aéroport", desc: "Nos agents vous enregistrent sur place. Ouvrez le comptoir 3 heures avant les vols internationaux." },
];

export default function CheckinInfoPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/informations-checkin" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>🧳 ENREGISTREMENT</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Informations <span style={{ color: "#5b21b6" }}>Check-In</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Enregistrez-vous en ligne en quelques minutes, ou au comptoir à l'aéroport.
          Voici comment ça marche.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Deux options */}
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {OPTIONS.map((o) => (
            <section key={o.title} style={pageCard}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>
                {o.icon}
              </div>
              <h2 className="font-heading" style={{ ...pageH2, fontSize: 21 }}>{o.title}</h2>
              <p style={{ ...pageP, margin: 0 }}>{o.desc}</p>
            </section>
          ))}
        </div>

        {/* Étapes numérotées */}
        <section style={pageCard}>
          <h2 className="font-heading" style={pageH2}>Le check-in en ligne, étape par étape</h2>
          <div className="grid-2 checkin-steps" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 6 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ display: "flex", gap: 16, border: "1px solid #eceafa", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {s.icon}
                  </div>
                  <div style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 999, background: "#5b21b6", color: "#fff", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i + 1}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1e1b4b", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: "#5c5c7a", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/check-in"
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#3d1e8a",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 28px",
              borderRadius: 12,
              textDecoration: "none",
            }}
          >
            Faire mon check-in maintenant <span>→</span>
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
}
