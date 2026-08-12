import Header from "@/components/layout/Header";

/**
 * Section Hero (page d'accueil) : image de fond, dégradé, header transparent,
 * titre et carte de recherche flottante. Reproduit le prototype à l'identique.
 * La carte flottante renvoie vers la section de recherche interactive (#recherche).
 */
export default function Hero() {
  return (
    <div
      className="hero-wrap"
      style={{
        position: "relative",
        minHeight: 960,
        overflow: "hidden",
        borderRadius: "0 0 32px 32px",
      }}
    >
      {/* fond */}
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 700px 420px at center 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0) 75%)",
        }}
      />

      <Header variant="hero" active="/" />

      {/* badge + titre */}
      <div
        style={{
          position: "relative",
          zIndex: 4,
          textAlign: "center",
          padding: "60px 40px 0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(91,33,182,0.25)",
            color: "#5b21b6",
            fontWeight: 600,
            fontSize: 14,
            padding: "9px 20px",
            borderRadius: 999,
          }}
        >
          <span>✈</span> VOLS DIRECTS &amp; AVEC ESCALE
        </div>
        <h1
          className="font-heading hero-title"
          style={{
            fontWeight: 800,
            fontSize: 62,
            lineHeight: 1.3,
            color: "#1e1b4b",
            margin: "22px auto 0",
            maxWidth: 820,
          }}
        >
          Voyagez <span style={{ color: "#5b21b6" }}>Plus Loin</span>,<br />
          Vivez <span style={{ color: "#dc2626" }}>Plus Fort</span>.
        </h1>
      </div>

      {/* carte de recherche flottante */}
      <div
        className="hero-card"
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 30,
          zIndex: 6,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(10px)",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(20,10,60,0.18)",
          padding: "22px 28px",
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              background: "#3d1e8a",
              color: "#fff",
            }}
          >
            <span>✈</span>Vols
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              background: "transparent",
              color: "#3d1e8a",
            }}
          >
            <span>🛡</span>Assurance
          </span>
        </div>
        <div
          className="hero-card-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1.4fr 1fr 1fr 1fr auto",
            gap: 18,
            alignItems: "end",
          }}
        >
          <HeroField className="hc-full" label="Depuis" icon="📍" value="Santiago, Chili" />
          <HeroField className="hc-full" label="Vers" icon="📍" value="Port-au-Prince, Haïti" />
          <HeroField label="Date aller" icon="📅" value="26 Mai 2025" />
          <HeroField label="Date retour" icon="📅" value="02 Juin 2025" />
          <HeroField className="hc-full" label="Passagers" icon="👤" value="1 Adulte" />
          <a
            href="#recherche"
            className="hc-full"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#3d1e8a",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              padding: "14px 22px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Rechercher <span>🔍</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function HeroField({
  label,
  icon,
  value,
  className,
}: {
  label: string;
  icon: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
          color: "#1e1b4b",
          fontSize: 15,
        }}
      >
        <span>{icon}</span>
        {value}
      </div>
    </div>
  );
}
