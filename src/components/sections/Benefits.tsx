import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Section « Découvrez les bienfaits d'Anacaona »
// Panneau visuel caribéen (vectoriel, net à toute résolution) + 4 cartes.
// Conteneur clair, coins arrondis, sans cadre/fond sombre. Réservée au PC.
// ─────────────────────────────────────────────────────────────────────────────

const INK = "#0f0f2d";
const PURPLE = "#5b21b6";
const RED = "#dc2626";

const iconStroke = {
  fill: "none",
  stroke: PURPLE,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface Benefit {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
  href: string;
}

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

// Scène caribéenne vectorielle : ciel, soleil, mer turquoise, plage, palmiers.
// 100 % SVG → parfaitement nette quelle que soit la taille d'affichage.
function CaribbeanScene() {
  return (
    <svg
      viewBox="0 0 800 620"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3ea8e6" />
          <stop offset="0.6" stopColor="#8fd2f0" />
          <stop offset="1" stopColor="#dff3fb" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12b5c9" />
          <stop offset="0.55" stopColor="#25c7cf" />
          <stop offset="1" stopColor="#7fe6d6" />
        </linearGradient>
        <linearGradient id="shore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9f0e2" />
          <stop offset="1" stopColor="#f6ecc9" />
        </linearGradient>
        <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6ecc9" />
          <stop offset="1" stopColor="#e6d3a4" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff8e6" />
          <stop offset="0.5" stopColor="#ffe9a8" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ciel + soleil */}
      <rect x="0" y="0" width="800" height="360" fill="url(#sky)" />
      <circle cx="610" cy="120" r="140" fill="url(#sun)" />
      <circle cx="610" cy="120" r="46" fill="#fff4d6" />

      {/* montagnes lointaines */}
      <path d="M0 360 L120 268 L240 348 L360 250 L470 360 Z" fill="#7fb8cf" opacity="0.55" />
      <path d="M330 360 L470 262 L620 340 L740 286 L800 360 Z" fill="#6aa9c6" opacity="0.5" />

      {/* mer */}
      <rect x="0" y="352" width="800" height="150" fill="url(#sea)" />
      {/* reflets */}
      <path d="M60 430 q50 -10 100 0 M300 460 q60 -12 120 0 M540 420 q50 -10 100 0" stroke="#eafff9" strokeWidth="4" fill="none" opacity="0.5" strokeLinecap="round" />

      {/* bande de rivage + sable */}
      <path d="M0 470 Q400 440 800 486 L800 560 Q400 528 0 556 Z" fill="url(#shore)" />
      <path d="M0 552 Q400 524 800 556 L800 620 L0 620 Z" fill="url(#sand)" />

      {/* palmier gauche */}
      <g>
        <path d="M96 620 C86 520 92 430 108 372" stroke="#7a5a2e" strokeWidth="12" fill="none" strokeLinecap="round" />
        <g fill="#1f8f5f">
          <path d="M108 372 C70 344 40 342 12 356 C46 350 78 360 108 380 Z" />
          <path d="M108 372 C146 344 176 342 204 356 C170 350 138 360 108 380 Z" />
          <path d="M108 372 C86 330 70 300 66 268 C82 302 100 336 116 376 Z" />
          <path d="M108 372 C130 330 150 302 180 284 C154 314 130 342 116 378 Z" />
          <path d="M108 372 C96 340 96 316 104 286 C110 320 114 350 116 378 Z" />
        </g>
      </g>

      {/* petit palmier droit */}
      <g>
        <path d="M726 620 C722 556 726 500 736 462" stroke="#7a5a2e" strokeWidth="8" fill="none" strokeLinecap="round" />
        <g fill="#1c8256">
          <path d="M736 462 C712 446 692 446 674 456 C696 450 716 456 736 468 Z" />
          <path d="M736 462 C760 446 780 446 798 456 C776 450 756 456 736 468 Z" />
          <path d="M736 462 C724 436 718 414 720 392 C728 416 734 442 742 468 Z" />
        </g>
      </g>
    </svg>
  );
}

export default function Benefits() {
  return (
    <section className="benefits-desktop hz" style={{ padding: "10px 56px 40px" }}>
      <div
        style={{
          borderRadius: 28,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          background: "#f6f4fc",
          boxShadow: "0 20px 46px rgba(30,27,75,0.12)",
        }}
      >
        {/* Panneau visuel à gauche (vectoriel, net) */}
        <div style={{ position: "relative", minHeight: 470, overflow: "hidden" }}>
          <CaribbeanScene />
          {/* léger voile pour la lisibilité du texte */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(8,10,40,0.42) 0%, rgba(8,10,40,0.16) 45%, rgba(8,10,40,0) 72%)",
            }}
          />
          <div style={{ position: "absolute", left: 40, bottom: 46, right: 34 }}>
            <h2
              className="font-heading"
              style={{ color: "#fff", fontSize: 38, fontWeight: 800, lineHeight: 1.08, margin: 0, textShadow: "0 2px 14px rgba(0,0,0,0.35)" }}
            >
              Découvrez les bienfaits
              <br />
              d&rsquo;Anacaona
            </h2>
            <p style={{ color: "rgba(255,255,255,0.95)", fontSize: 16.5, lineHeight: 1.5, marginTop: 14, maxWidth: 420, textShadow: "0 1px 10px rgba(0,0,0,0.3)" }}>
              Voyagez malin, évitez les arnaques et profitez d&rsquo;un service fiable, transparent et humain.
            </p>
            <div style={{ width: 74, height: 4, borderRadius: 999, background: RED, marginTop: 18 }} />
          </div>
        </div>

        {/* Grille de 4 cartes à droite */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: 22 }}>
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "24px 22px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 6px 18px rgba(30,27,75,0.06)",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#f0eafe",
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
