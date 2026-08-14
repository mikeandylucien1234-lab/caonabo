"use client";

import { useState } from "react";
import Link from "next/link";

const NAV = [
  { label: "Accueil", href: "/" },
  { label: "Destinations", href: "/destinations" },
  { label: "Check In", href: "/check-in" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/#contact" },
];

/**
 * Navigation mobile : bouton hamburger (rond violet) + menu déroulant.
 * Rendue uniquement sur mobile (masquée en CSS sur desktop via .mobile-nav).
 */
export default function MobileNav({
  firstName,
}: {
  firstName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav" style={{ position: "relative", alignItems: "center", gap: 10 }}>
      {/* bouton « Se connecter » (ou compte) à gauche du menu */}
      <Link
        href={firstName ? "/account" : "/login"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#3d1e8a",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          padding: "10px 16px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {firstName ? `👤 ${firstName}` : "Se connecter"}
      </Link>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        style={{
          width: 46,
          height: 46,
          borderRadius: 999,
          background: "#3d1e8a",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <span style={barStyle(open, 1)} />
        <span style={barStyle(open, 2)} />
        <span style={barStyle(open, 3)} />
      </button>

      {open && (
        <>
          {/* voile de fermeture */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <nav
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              zIndex: 50,
              width: 240,
              background: "#fff",
              border: "1px solid #eceafa",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(20,10,60,0.18)",
              padding: 10,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  color: "#1e1b4b",
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={firstName ? "/account" : "/login"}
              onClick={() => setOpen(false)}
              style={{
                marginTop: 6,
                padding: "12px 14px",
                borderRadius: 10,
                background: "#3d1e8a",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {firstName ? `👤 ${firstName}` : "Connexion"}
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}

function barStyle(open: boolean, i: number): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "block",
    width: 20,
    height: 2,
    background: "#fff",
    borderRadius: 2,
    transition: "transform .2s, opacity .2s",
  };
  if (!open) return base;
  if (i === 1) return { ...base, transform: "translateY(7px) rotate(45deg)" };
  if (i === 2) return { ...base, opacity: 0 };
  return { ...base, transform: "translateY(-7px) rotate(-45deg)" };
}
