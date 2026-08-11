// Pied de page — reprend exactement les 5 colonnes du prototype.

const COLUMNS: { title: string; links: string[] }[] = [
  { title: "À Propos", links: ["Notre Histoire"] },
  { title: "Support & Contact", links: ["Contactez-nous", "FAQ"] },
  {
    title: "Réservation & Voyage",
    links: ["Vols Nolisés", "Voyages de Groupe", "Destinations"],
  },
  {
    title: "Informations & Services",
    links: [
      "Notre Flotte",
      "Informations Check-In",
      "Politique de Bagages",
      "Informations Aéroport",
      "Courrier et Cargo",
      "Explorer les Caraïbes",
    ],
  },
  {
    title: "Informations Légales",
    links: [
      "Conditions Générales",
      "Conditions de Transport",
      "Moyens de Paiement",
      "Politique de Confidentialité",
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="hz footer-grid"
      style={{
        background: "#1e1b4b",
        padding: "56px 56px 64px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1.3fr 1fr",
        gap: 32,
      }}
    >
      {COLUMNS.map((col) => (
        <div key={col.title}>
          <div
            style={{
              color: "#dc2626",
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 18,
            }}
          >
            {col.title}
          </div>
          {col.links.map((link) => (
            <a
              key={link}
              href="#"
              style={{
                display: "block",
                color: "#e6e4f2",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {link}
            </a>
          ))}
        </div>
      ))}
    </footer>
  );
}
