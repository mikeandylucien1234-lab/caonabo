"use client";

import { useState } from "react";

// Pied de page — 5 colonnes (desktop, identique au prototype).
// Sur mobile : chaque colonne devient un accordéon repliable, + un bloc
// logo / réseaux sociaux / copyright (mobile uniquement).

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

// Cibles des liens qui pointent vers une vraie page (sinon ancre "#").
const LINK_HREFS: Record<string, string> = {
  "Notre Histoire": "/notre-histoire",
  "Contactez-nous": "/contact",
  "Voyages de Groupe": "/voyages-de-groupe",
  Destinations: "/destinations",
  "Notre Flotte": "/notre-flotte",
  "Informations Check-In": "/informations-checkin",
  "Politique de Bagages": "/politique-bagages",
  "Informations Aéroport": "/informations-aeroport",
  "Courrier et Cargo": "/cargo",
  "Explorer les Caraïbes": "/explorer-caraibes",
};

export default function Footer() {
  return (
    <footer style={{ background: "#1e1b4b" }}>
      <div
        className="hz footer-grid"
        style={{
          padding: "56px 56px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1.3fr 1fr",
          gap: 32,
        }}
      >
        {COLUMNS.map((col) => (
          <FooterColumn key={col.title} title={col.title} links={col.links} />
        ))}
      </div>

      {/* Bloc mobile uniquement : logo + réseaux sociaux + copyright */}
      <div className="footer-extra">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt="Caonabo Airlinje"
          style={{ height: 70, width: "auto", marginBottom: 18 }}
        />
        <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
          <Social label="Facebook">
            <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5C16.5 5.4 15.6 5.3 14.6 5.3c-2.1 0-3.6 1.3-3.6 3.7v2.2H8.6V14H11v7h2.5z" />
          </Social>
          <Social label="Instagram">
            <path d="M12 8.9A3.1 3.1 0 1 0 12 15.1 3.1 3.1 0 0 0 12 8.9zm0 5.1a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.2-5.2a.72.72 0 1 1-1.44 0 .72.72 0 0 1 1.44 0zM17.5 8a3.6 3.6 0 0 0-1-2.5 3.6 3.6 0 0 0-2.5-1c-1-.06-3.9-.06-4.9 0a3.6 3.6 0 0 0-2.5 1 3.6 3.6 0 0 0-1 2.5c-.06 1-.06 3.9 0 4.9a3.6 3.6 0 0 0 1 2.5 3.6 3.6 0 0 0 2.5 1c1 .06 3.9.06 4.9 0a3.6 3.6 0 0 0 2.5-1 3.6 3.6 0 0 0 1-2.5c.06-1 .06-3.9 0-4.9zm-1.3 6a2 2 0 0 1-1.2 1.2c-.8.3-2.7.24-3.6.24s-2.8.06-3.6-.24A2 2 0 0 1 6.6 14c-.3-.8-.24-2.7-.24-3.6S6.3 7.6 6.6 6.8A2 2 0 0 1 7.8 5.6c.8-.3 2.7-.24 3.6-.24s2.8-.06 3.6.24A2 2 0 0 1 16.2 6.8c.3.8.24 2.7.24 3.6s.06 2.8-.24 3.6z" />
          </Social>
          <Social label="Twitter">
            <path d="M18.9 7.6c-.5.24-1.1.4-1.7.47a3 3 0 0 0 1.3-1.65 6 6 0 0 1-1.9.72 3 3 0 0 0-5.1 2.7 8.4 8.4 0 0 1-6.1-3.1 3 3 0 0 0 .9 4 3 3 0 0 1-1.35-.37v.04a3 3 0 0 0 2.4 2.9 3 3 0 0 1-1.34.05 3 3 0 0 0 2.8 2.1A6 6 0 0 1 4 19.05a8.4 8.4 0 0 0 4.55 1.33c5.46 0 8.44-4.52 8.44-8.44v-.38a6 6 0 0 0 1.48-1.53z" />
          </Social>
        </div>
        <div style={{ color: "#a9a6c8", fontSize: 13, lineHeight: 1.6 }}>
          © 2025 Caonabo Airlines. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="footer-col">
      <div
        onClick={() => setOpen((o) => !o)}
        className="footer-col-title"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#dc2626",
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 18,
          cursor: "pointer",
        }}
      >
        {title}
        <span
          className="footer-chevron"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
          }}
        >
          ⌄
        </span>
      </div>
      <div className={`footer-links${open ? " open" : ""}`}>
        {links.map((link) => (
          <a
            key={link}
            href={LINK_HREFS[link] ?? "#"}
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
    </div>
  );
}

function Social({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        background: "rgba(255,255,255,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
        {children}
      </svg>
    </a>
  );
}
