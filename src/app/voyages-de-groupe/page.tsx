import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GroupRequestForm from "@/components/sections/GroupRequestForm";

export const metadata = { title: "Voyages de Groupe — Caonabo Airlinje" };

const ADVANTAGES: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <IconTag />,
    title: "Tarifs dégressifs",
    desc: "Plus vous êtes nombreux, plus le prix par personne baisse. Des remises automatiques s'appliquent dès 10 voyageurs sur une même réservation.",
  },
  {
    icon: <IconAgent />,
    title: "Un interlocuteur dédié",
    desc: "Un conseiller Caonabo unique suit votre dossier de A à Z : itinéraire, sièges, bagages, noms des passagers et modifications de dernière minute.",
  },
  {
    icon: <IconWallet />,
    title: "Flexibilité de paiement",
    desc: "Bloquez vos places avec un acompte, réglez en plusieurs fois et ajustez la liste des voyageurs jusqu'à quelques jours avant le départ.",
  },
];

export default function GroupTravelPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/voyages-de-groupe" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={badge}>👥 VOYAGES DE GROUPE</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Voyagez <span style={{ color: "#5b21b6" }}>ensemble</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Familles élargies, groupes religieux, voyages scolaires ou retours au pays
          organisés : Caonabo vous fait voyager à plusieurs, plus simplement et moins cher.
        </p>
      </div>

      <div className="hz" style={{ padding: "28px 56px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Hero illustration + intro */}
        <section style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div className="grid-2 group-hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, alignItems: "stretch" }}>
            <div style={{ padding: "34px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h2 className="font-heading" style={h2}>Pourquoi partir en groupe ?</h2>
              <p style={{ ...p, marginBottom: 0 }}>
                Réunir toute une famille pour un mariage à Cap-Haïtien, emmener une chorale
                d'église d'une rive à l'autre du continent, organiser un voyage scolaire ou
                coordonner un grand retour au pays : à plusieurs, chaque détail compte.
                Caonabo négocie pour vous des <b>tarifs préférentiels dès 10 personnes</b>,
                centralise la réservation et vous évite la logistique — pour que vous n'ayez
                à penser qu'aux retrouvailles.
              </p>
            </div>
            <div style={{ background: "#f0ecfb", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <GroupHero />
            </div>
          </div>
        </section>

        {/* 3 avantages */}
        <div className="grid-2 group-adv" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {ADVANTAGES.map((a) => (
            <section key={a.title} style={card}>
              <div style={iconCircle}>{a.icon}</div>
              <h3 className="font-heading" style={{ fontWeight: 800, fontSize: 19, color: "#1e1b4b", margin: "0 0 8px" }}>
                {a.title}
              </h3>
              <p style={{ fontSize: 14.5, color: "#5c5c7a", lineHeight: 1.65, margin: 0 }}>{a.desc}</p>
            </section>
          ))}
        </div>

        {/* Formulaire de devis */}
        <section style={card}>
          <h2 className="font-heading" style={h2}>Demandez votre devis groupe</h2>
          <p style={{ ...p, marginTop: 0 }}>
            Indiquez-nous votre projet : nous revenons vers vous avec une proposition sur mesure.
          </p>
          <GroupRequestForm />
        </section>
      </div>

      <Footer />
    </div>
  );
}

// ── Illustration hero (silhouettes + avion, aplat violet) ────────────────────
function GroupHero() {
  return (
    <svg viewBox="0 0 420 220" width="100%" style={{ maxWidth: 420, height: "auto" }} role="img" aria-label="Groupe de voyageurs et avion">
      {/* avion */}
      <g transform="translate(250 26)">
        <path d="M0 26 L92 6 C99 4 100 14 94 17 L60 33 L64 56 L52 60 L40 38 L14 46 L8 60 L0 60 L2 40 L0 26 Z" fill="#5b21b6" />
        <circle cx="150" cy="20" r="6" fill="#dc2626" />
        <circle cx="176" cy="34" r="4" fill="#c9b8ef" />
      </g>
      {/* sol */}
      <rect x="20" y="188" width="380" height="8" rx="4" fill="#ded9f5" />
      {/* silhouettes */}
      {[
        { x: 60, h: 74, head: "#7c4dd6", body: "#5b21b6" },
        { x: 110, h: 92, head: "#5b21b6", body: "#3d1e8a" },
        { x: 165, h: 66, head: "#9a6ee0", body: "#7c4dd6" },
        { x: 214, h: 100, head: "#3d1e8a", body: "#2a1466" },
        { x: 272, h: 78, head: "#7c4dd6", body: "#5b21b6" },
        { x: 322, h: 60, head: "#9a6ee0", body: "#7c4dd6" },
      ].map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={188 - s.h} r={13} fill={s.head} />
          <path
            d={`M${s.x - 17} 188 C${s.x - 17} ${188 - s.h + 20} ${s.x + 17} ${188 - s.h + 20} ${s.x + 17} 188 Z`}
            fill={s.body}
          />
        </g>
      ))}
    </svg>
  );
}

// ── Icônes avantages (SVG aplat violet) ──────────────────────────────────────
function IconTag() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="#5b21b6" />
    </svg>
  );
}
function IconAgent() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 0 1 16 0" />
      <rect x="3" y="12" width="4" height="6" rx="2" fill="#5b21b6" stroke="none" />
      <rect x="17" y="12" width="4" height="6" rx="2" fill="#5b21b6" stroke="none" />
      <path d="M20 18a4 4 0 0 1-4 3h-2" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.5" fill="#5b21b6" stroke="none" />
    </svg>
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
  fontSize: 24,
  color: "#1e1b4b",
  margin: "0 0 14px",
};
const p: React.CSSProperties = {
  fontSize: 15.5,
  color: "#4b4b63",
  lineHeight: 1.75,
  margin: "0 0 16px",
};
const iconCircle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "#f0ecfb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
};
