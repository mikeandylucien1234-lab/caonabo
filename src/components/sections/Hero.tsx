import Header from "@/components/layout/Header";
import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";

/**
 * Section Hero : l'image de fond est affichée EN ENTIER (jamais rognée), le
 * header et le titre sont superposés, et une carte « Prochain vol » compacte en
 * verre dépoli flotte au-dessus du bas de l'image.
 */
export default async function Hero() {
  const { locale } = await getPrefs();
  const t = getDictionary(locale);
  return (
    <div
      className="hero-wrap"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "0 0 32px 32px",
        background: "#eef0f6",
      }}
    >
      {/* fond : image qui remplit le hero (format précédent, cover) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-bg.png"
        alt="Terre vue de l'espace, villes de la diaspora"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* calque superposé : header en haut + titre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(ellipse 700px 420px at center 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0) 75%)",
        }}
      >
        <Header variant="hero" active="/" />
        <div
          className="hero-headline"
          style={{ textAlign: "center", padding: "6% 40px 0" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(91,33,182,0.25)",
              color: "#5b21b6",
              fontWeight: 600,
              fontSize: 14,
              padding: "9px 20px",
              borderRadius: 999,
            }}
          >
            {t.hero.badge}
          </div>
          <h1
            className="font-heading hero-title"
            style={{
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.25,
              color: "#1e1b4b",
              margin: "20px auto 0",
              maxWidth: 820,
            }}
          >
            {t.hero.title1}
            <span style={{ color: "#5b21b6" }}>{t.hero.hi1}</span>
            {t.hero.title2}
            <span style={{ color: "#dc2626" }}>{t.hero.hi2}</span>.
          </h1>
        </div>
      </div>

      {/* carte « Prochain vol » compacte, en verre dépoli, flottant sur l'image */}
      <div className="hero-card-float">
        <FlightTeaserCard />
      </div>
    </div>
  );
}

function FlightTeaserCard() {
  return (
    <div
      className="hero-flightcard"
      style={{
        width: "min(560px, 92vw)",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 22,
        boxShadow: "0 24px 60px rgba(20,10,60,0.22)",
        padding: "20px 22px",
      }}
    >
      {/* onglets */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: "#3d1e8a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "11px 20px",
            borderRadius: 14,
          }}
        >
          <IconPlane color="#fff" size={18} /> Prochain vol
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            color: "#3d1e8a",
            fontWeight: 700,
            fontSize: 15,
            padding: "11px 12px",
          }}
        >
          <IconSuitcase /> Bagage
        </span>
      </div>

      {/* Depuis / Vers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div style={labelStyle}>Depuis</div>
          <div style={valueRow}>
            <IconPin /> <span>Santiago, Chili</span>
          </div>
        </div>
        <div style={{ color: "#4b4b63", marginTop: 18 }}>
          <IconPlaneSide />
        </div>
        <div>
          <div style={labelStyle}>Vers</div>
          <div style={valueRow}>
            <IconPin /> <span>Port-au-Prince, Haïti</span>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "#e6e4f0", margin: "16px 0" }} />

      {/* Départ / Retour */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CalendarRed />
          <div>
            <div style={labelStyle}>Départ</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
              12 septembre 2026
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderLeft: "1px solid #e6e4f0",
            paddingLeft: 16,
          }}
        >
          <IconCalPurple />
          <div>
            <div style={labelStyle}>Retour</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#1a1a2e" }}>
              Selon votre choix
            </div>
          </div>
        </div>
      </div>

      {/* bouton */}
      <a
        href="#recherche"
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.6)",
          border: "1px solid #e6e4f0",
          borderRadius: 14,
          padding: "15px 20px",
          fontWeight: 800,
          fontSize: 16,
          color: "#1a1a2e",
          textDecoration: "none",
        }}
      >
        Voir les détails <IconChevron />
      </a>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b6b80",
  marginBottom: 6,
};
const valueRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 800,
  fontSize: 18,
  color: "#1a1a2e",
};

// ── Icônes (SVG en ligne) ────────────────────────────────────────────────────
function IconPlane({ color = "currentColor", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden>
      <path d="M2.5 14.5l19-6.2c.9-.3.9-1.6 0-1.9L2.5 0.2 2.4 6l12 1.4-12 1.4z" transform="translate(0 4)" />
    </svg>
  );
}
function IconSuitcase() {
  return (
    <svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="#3d1e8a" strokeWidth={2} aria-hidden>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 11v5" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden style={{ flexShrink: 0 }}>
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" fill="#e11d2a" />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
    </svg>
  );
}
function IconPlaneSide() {
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} fill="#4b4b63" aria-hidden>
      <path d="M21 15.5v-1.6l-7.5-4.7V4.2c0-.9-.7-1.6-1.5-1.6s-1.5.7-1.5 1.6v5L3 13.9v1.6l7.5-2.3v4.6l-2 1.4v1.2l3.5-1 3.5 1v-1.2l-2-1.4v-4.6z" />
    </svg>
  );
}
function CalendarRed() {
  return (
    <div
      aria-hidden
      style={{
        width: 44,
        height: 44,
        borderRadius: 9,
        overflow: "hidden",
        border: "1px solid #ececf2",
        boxShadow: "0 2px 6px rgba(20,10,60,0.12)",
        flexShrink: 0,
        background: "#fff",
      }}
    >
      <div style={{ background: "#e11d2a", color: "#fff", fontSize: 9, fontWeight: 800, textAlign: "center", padding: "3px 0 2px", letterSpacing: 0.3 }}>
        SEPT.
      </div>
      <div style={{ color: "#1a1a2e", fontWeight: 800, fontSize: 18, textAlign: "center", lineHeight: 1, paddingTop: 3 }}>
        12
      </div>
    </div>
  );
}
function IconCalPurple() {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} fill="none" stroke="#5b21b6" strokeWidth={2} aria-hidden style={{ flexShrink: 0 }}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#1a1a2e" strokeWidth={2.5} aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
