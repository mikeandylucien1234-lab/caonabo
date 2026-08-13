import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Notre Histoire — Caonabo Airlinje" };

const MILESTONES: { x: number; year: string; l1: string; l2: string }[] = [
  { x: 130, year: "2019", l1: "Fondation", l2: "à Santiago" },
  { x: 370, year: "2021", l1: "1re route", l2: "Chili–Haïti" },
  { x: 610, year: "2023", l1: "Expansion", l2: "vers le Canada" },
  { x: 850, year: "2026", l1: "Aujourd'hui", l2: "6 destinations" },
];

export default function HistoryPage() {
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/notre-histoire" />

      {/* en-tête de section */}
      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={badge}>🌺 À PROPOS DE NOUS</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Notre <span style={{ color: "#5b21b6" }}>Histoire</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Une compagnie née de la diaspora, pour la diaspora — reliant le Chili, Haïti,
          le Canada et l'Amérique du Sud.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Nos origines */}
        <section style={card}>
          <h2 className="font-heading" style={h2}>Nos origines</h2>
          <p style={p}>
            Caonabo Airlinje est née d'un constat simple : la diaspora haïtienne, dispersée
            entre le Chili, Haïti, le Canada et le reste de l'Amérique, manquait de liaisons
            aériennes pensées pour elle. En 2019, à Santiago, un groupe de voyageurs et
            d'entrepreneurs de la communauté décide de créer une compagnie capable de
            rapprocher les familles que les distances et les frontières avaient séparées.
          </p>
          <p style={{ ...p, marginBottom: 0 }}>
            Le nom n'a pas été choisi au hasard. <b>Caonabo</b> était l'un des grands caciques
            taïnos d'<i>Ayiti</i>, la terre précolombienne qui allait devenir Haïti. Figure de
            résistance et de dignité, il incarne le lien indéfectible avec les racines. Porter
            son nom, c'est rappeler à chaque passager d'où il vient — et lui donner les ailes
            pour y retourner.
          </p>
        </section>

        {/* Frise chronologique (illustration SVG, style aplat violet) */}
        <section style={card}>
          <h2 className="font-heading" style={h2}>Notre parcours</h2>
          <div style={{ overflowX: "auto", paddingBottom: 6 }}>
            <svg viewBox="0 0 980 240" width="100%" style={{ minWidth: 720, height: "auto", display: "block" }} role="img" aria-label="Frise chronologique de Caonabo Airlinje">
              {/* ligne de base */}
              <line x1="130" y1="120" x2="850" y2="120" stroke="#ded9f5" strokeWidth="6" strokeLinecap="round" />
              <line x1="130" y1="120" x2="850" y2="120" stroke="#5b21b6" strokeWidth="6" strokeLinecap="round" strokeDasharray="0" opacity="0.9" />
              {/* petit avion sur la ligne */}
              <g transform="translate(838 104) scale(1.1)">
                <path d="M0 8 L22 2 C24 1.5 24 4.5 22.5 5.2 L14 9 L15 15 L12 16 L9 10 L3 12 L2 15 L0 15 L0.6 10 L0 8 Z" fill="#dc2626" />
              </g>

              {MILESTONES.map((m) => (
                <g key={m.year}>
                  {/* année au-dessus */}
                  <text x={m.x} y="54" textAnchor="middle" fontSize="24" fontWeight="800" fill="#1e1b4b">
                    {m.year}
                  </text>
                  {/* nœud */}
                  <circle cx={m.x} cy="120" r="26" fill="#f0ecfb" />
                  <circle cx={m.x} cy="120" r="15" fill="#5b21b6" />
                  <circle cx={m.x} cy="120" r="6" fill="#fff" />
                  {/* libellé sous le nœud */}
                  <text x={m.x} y="180" textAnchor="middle" fontSize="16" fontWeight="700" fill="#3d1e8a">
                    {m.l1}
                  </text>
                  <text x={m.x} y="202" textAnchor="middle" fontSize="14" fill="#7a7a92">
                    {m.l2}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Mission + Vision */}
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <section style={card}>
            <div style={iconCircle}>🎯</div>
            <h2 className="font-heading" style={h2}>Notre mission</h2>
            <p style={{ ...p, marginBottom: 0 }}>
              Relier les membres de la diaspora à leurs proches et à leur terre d'origine, avec
              des vols directs et avec escale entre le Chili, Haïti, le Canada et l'Amérique du
              Sud. Nous voulons un voyage accessible et chaleureux, fidèle à l'esprit haïtien :
              l'hospitalité, la solidarité et la fierté des racines — à bord comme au sol.
            </p>
          </section>
          <section style={card}>
            <div style={iconCircle}>🚀</div>
            <h2 className="font-heading" style={h2}>Notre vision</h2>
            <p style={{ ...p, marginBottom: 0 }}>
              Devenir la compagnie de référence de la diaspora caribéenne dans les Amériques.
              Nous imaginons un réseau qui reliera demain chaque grande communauté haïtienne du
              continent, tout en soutenant le tourisme et les échanges vers Haïti. Voyager plus
              loin, pour vivre plus fort — et n'oublier jamais le chemin du retour.
            </p>
          </section>
        </div>
      </div>

      <Footer />
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
  fontSize: 24,
  marginBottom: 16,
};
