import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/sections/ContactForm";

export const metadata = { title: "Contactez-nous — Caonabo Airlinje" };

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/contact" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={badge}>💬 SUPPORT CLIENT</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Contactez-<span style={{ color: "#5b21b6" }}>nous</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 640 }}>
          Une question sur votre réservation, une réclamation ou une demande presse ?
          Notre équipe vous répond avec le sourire.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px" }}>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24, alignItems: "start" }}>
          {/* formulaire */}
          <section style={card}>
            <h2 className="font-heading" style={h2}>Écrivez-nous</h2>
            <ContactForm />
          </section>

          {/* coordonnées + illustration */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ ...card, textAlign: "center", padding: "28px 24px" }}>
              <SupportAvatar />
              <h3 className="font-heading" style={{ fontWeight: 800, fontSize: 19, color: "#1e1b4b", margin: "14px 0 6px" }}>
                Une équipe à votre écoute
              </h3>
              <p style={{ fontSize: 14, color: "#5c5c7a", margin: 0, lineHeight: 1.6 }}>
                Basée à Santiago, disponible pour toute la diaspora.
              </p>
            </div>

            <div style={card}>
              <InfoRow icon="✉️" label="Email support" value="support@caonabo-airlinje.com" />
              <div style={divider} />
              <InfoRow icon="📞" label="Téléphone" value="+56 2 2345 6789" />
              <div style={divider} />
              <InfoRow
                icon="🕒"
                label="Horaires"
                value="Lun–Ven 8h–20h · Sam 9h–14h (heure du Chili)"
              />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SupportAvatar() {
  return (
    <svg viewBox="0 0 200 200" width="150" height="150" role="img" aria-label="Conseiller support avec casque" style={{ display: "block", margin: "0 auto" }}>
      <circle cx="100" cy="100" r="94" fill="#f0ecfb" />
      {/* buste */}
      <path d="M44 176c0-31 25-52 56-52s56 21 56 52v6H44z" fill="#5b21b6" />
      {/* col */}
      <path d="M78 128h44v18c0 6-10 12-22 12s-22-6-22-12z" fill="#7c4dd6" />
      {/* tête */}
      <circle cx="100" cy="92" r="34" fill="#7c4dd6" />
      {/* cheveux */}
      <path d="M66 90a34 34 0 0 1 68 0c0-4-3-9-6-9-4-14-56-14-56 9z" fill="#3d1e8a" />
      {/* casque : arceau */}
      <path d="M60 96a40 40 0 0 1 80 0" fill="none" stroke="#1e1b4b" strokeWidth="7" strokeLinecap="round" />
      {/* écouteurs */}
      <rect x="52" y="92" width="16" height="26" rx="7" fill="#dc2626" />
      <rect x="132" y="92" width="16" height="26" rx="7" fill="#dc2626" />
      {/* micro */}
      <path d="M136 116c0 18-14 24-24 25" fill="none" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
      <circle cx="110" cy="142" r="6" fill="#dc2626" />
    </svg>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "6px 0" }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12.5, color: "#8a8aa0", fontWeight: 600, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 15, color: "#1e1b4b", fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}

const badge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#f0ecfb",
  color: "#5b21b6",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 1,
  padding: "8px 16px",
  borderRadius: 999,
};
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eceafa",
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(30,27,75,0.06)",
  padding: "28px 32px",
};
const h2: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 22,
  color: "#1e1b4b",
  margin: "0 0 18px",
};
const divider: React.CSSProperties = {
  height: 1,
  background: "#f0eef7",
  margin: "6px 0",
};
