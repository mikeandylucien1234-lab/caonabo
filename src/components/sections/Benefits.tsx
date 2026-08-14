import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Section « Découvrez les bienfaits d'Anacaona »
// Grande photo à gauche (texte en surimpression) + 4 cartes d'avantages à droite.
// Réservée au PC (masquée sur mobile via la classe .benefits-desktop).
// ─────────────────────────────────────────────────────────────────────────────

const INK = "#0f0f2d";
const PURPLE = "#5b21b6";
const RED = "#dc2626";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
  href: string;
}

const iconStroke = {
  fill: "none",
  stroke: PURPLE,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const BENEFITS: Benefit[] = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}>
        <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: "Évitez les arnaques",
    text: "Vos réservations sont vérifiées et sécurisées. Aucun frais caché, aucune mauvaise surprise.",
    cta: "Voyagez en confiance",
    href: "/notre-histoire",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}>
        <path d="M4 13v-1a8 8 0 0116 0v1" />
        <rect x="3" y="13" width="4" height="6" rx="1.5" />
        <rect x="17" y="13" width="4" height="6" rx="1.5" />
        <path d="M19 19a4 4 0 01-4 3h-2" />
      </svg>
    ),
    title: "Accompagnement 24/7",
    text: "Notre équipe est là pour vous avant, pendant et après votre voyage.",
    cta: "Nous contacter",
    href: "/contact",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}>
        <rect x="3" y="4" width="18" height="17" rx="2.5" />
        <path d="M3 9h18M8 2v4M16 2v4" />
        <path d="M9 15a3 3 0 105.7-1.3M15 12v2.4h-2.4" />
      </svg>
    ),
    title: "Flexibilité assurée",
    text: "Besoin de changer vos plans ? Modifiez ou annulez facilement selon nos conditions.",
    cta: "En savoir plus",
    href: "/conditions-generales",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" {...iconStroke}>
        <rect x="4" y="7" width="13" height="13" rx="2.5" />
        <path d="M8 7V5a2 2 0 012-2h1a2 2 0 012 2v2" />
        <path d="M20 12v4M22 14h-4" />
      </svg>
    ),
    title: "Offres exclusives",
    text: "Accédez à des tarifs spéciaux et à des destinations uniques, réservés à nos clients.",
    cta: "Voir les offres",
    href: "/destinations",
  },
];

export default function Benefits() {
  return (
    <section className="benefits-desktop hz" style={{ padding: "10px 56px 40px" }}>
      <div
        style={{
          background: "#0a0a12",
          borderRadius: 28,
          padding: 18,
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 18,
          boxShadow: "0 18px 50px rgba(10,8,30,0.25)",
        }}
      >
        {/* Panneau photo à gauche */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            minHeight: 470,
            backgroundImage: "url('/images/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(6,6,20,0.72) 0%, rgba(6,6,20,0.30) 55%, rgba(6,6,20,0.05) 100%)",
            }}
          />
          <div style={{ position: "absolute", left: 40, bottom: 46, right: 40 }}>
            <h2
              className="font-heading"
              style={{ color: "#fff", fontSize: 40, fontWeight: 800, lineHeight: 1.08, margin: 0 }}
            >
              Découvrez les bienfaits
              <br />
              d&rsquo;Anacaona
            </h2>
            <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 17, lineHeight: 1.5, marginTop: 14, maxWidth: 440 }}>
              Voyagez malin, évitez les arnaques et profitez d&rsquo;un service fiable, transparent et humain.
            </p>
            <div style={{ width: 74, height: 4, borderRadius: 999, background: RED, marginTop: 18 }} />
          </div>
        </div>

        {/* Grille de 4 cartes à droite */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#f3effe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {b.icon}
              </div>
              <div className="font-heading" style={{ color: INK, fontSize: 19, fontWeight: 800, marginBottom: 8 }}>
                {b.title}
              </div>
              <p style={{ color: "#5c5c7a", fontSize: 14.5, lineHeight: 1.5, margin: 0, flex: 1 }}>{b.text}</p>
              <Link
                href={b.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: PURPLE,
                  fontWeight: 700,
                  fontSize: 14.5,
                  marginTop: 18,
                  textDecoration: "none",
                }}
              >
                {b.cta}
                <span aria-hidden="true" style={{ fontSize: 16 }}>
                  ›
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
