// Section "À bord" — bandeau sombre arrondi : photo repas (gauche) +
// deux atouts à bord (droite). Placée après les Promotions. Responsive.
// La photo est chargée depuis /images/onboard-meal.jpg ; en son absence, un
// dégradé sombre chaleureux s'affiche (jamais d'image cassée).

const GOLD = "#c8a45e";

export default function OnboardExperience() {
  return (
    <div className="hz" style={{ padding: "0 56px 88px" }}>
      <div
        className="onboard"
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 1fr",
          background: "#0b0b10",
          borderRadius: 26,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(10,5,25,0.28)",
        }}
      >
        {/* visuel repas + lockup logo */}
        <div
          className="onboard-img"
          style={{
            position: "relative",
            minHeight: 380,
            backgroundImage: "url('/images/onboard-meal.jpg'), linear-gradient(135deg,#1c130a 0%,#0b0b10 70%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div style={{ position: "absolute", top: 26, left: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <TainoHead />
            <div style={{ fontFamily: "var(--font-heading), serif", color: GOLD, fontWeight: 800, fontSize: 21, lineHeight: 1.05 }}>
              Caonabo
              <br />
              Airlines
            </div>
            <div style={{ borderLeft: `1px solid ${GOLD}66`, paddingLeft: 14, color: GOLD, fontSize: 10.5, letterSpacing: 1.2, lineHeight: 1.5 }}>
              À VOTRE SERVICE,
              <br />
              NOTRE FIERTÉ.
            </div>
          </div>
        </div>

        {/* atouts à bord */}
        <div className="onboard-body" style={{ padding: "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          <Feature icon={<Cloa />} title={<>À bord, Haïti<br />vous accompagne.</>} text="Savourez des plats 100 % haïtiens, préparés avec les saveurs authentiques du pays." />
          <div style={{ height: 1, background: `${GOLD}44` }} />
          <Feature icon={<Battery />} title={<>Restez connecté<br />à bord.</>} text="Rechargez facilement votre téléphone ou votre appareil pendant le vol." />
          <a
            href="/notre-flotte"
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 4,
              padding: "13px 26px",
              borderRadius: 999,
              border: `1.5px solid ${GOLD}`,
              color: GOLD,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Découvrir notre menu <span style={{ fontSize: 18, lineHeight: 1 }}>›</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
      <span style={{ flexShrink: 0, width: 50, height: 50, borderRadius: 999, border: `1.5px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </span>
      <div>
        <h3 className="font-heading" style={{ color: "#fff", fontWeight: 800, fontSize: 26, margin: "0 0 8px", lineHeight: 1.15 }}>
          {title}
        </h3>
        <p style={{ color: "#b7b7c2", fontSize: 14.5, lineHeight: 1.55, margin: 0, maxWidth: 340 }}>{text}</p>
      </div>
    </div>
  );
}

// ── icônes (SVG or, style charte) ────────────────────────────────────────────
function TainoHead() {
  return (
    <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M24 8c-7 0-12 5-12 12 0 6 4 9 4 14h16c0-5 4-8 4-14 0-7-5-12-12-12z" />
      <path d="M18 20c2-2 10-2 12 0M20 26h8" />
      <path d="M14 12c4-3 16-3 20 0" />
    </svg>
  );
}
function Cloa() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 18h17" />
      <path d="M5 18a7 7 0 0 1 14 0" />
      <path d="M12 8V6" />
      <circle cx="12" cy="5" r="1" fill={GOLD} stroke="none" />
    </svg>
  );
}
function Battery() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="8" width="15" height="9" rx="2.5" />
      <path d="M21 11.5v3" />
      <path d="M11.5 10.5 9.5 13h2.5l-2 2.5" stroke={GOLD} />
    </svg>
  );
}
