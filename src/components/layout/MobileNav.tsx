"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePrefs } from "@/components/PreferencesProvider";
import LocaleCurrencySwitcher from "@/components/LocaleCurrencySwitcher";

const NAV = [
  { key: "home", href: "/" },
  { key: "destinations", href: "/destinations" },
  { key: "checkin", href: "/check-in" },
  { key: "book", href: "/book" },
  { key: "contact", href: "/contact" },
] as const;

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
  const [mounted, setMounted] = useState(false);
  const { dict } = usePrefs();
  useEffect(() => setMounted(true), []);

  return (
    <div className="mobile-nav" style={{ position: "relative", alignItems: "center", gap: 8 }}>
      {/* sélecteur langue + devise (compact) */}
      <LocaleCurrencySwitcher compact />

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
          fontSize: 13.5,
          padding: "9px 14px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {firstName ? `👤 ${firstName}` : dict.login}
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

      {open && mounted && createPortal(
        <>
          {/* voile de fermeture (surdimensionné pour couvrir malgré le zoom mobile) */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", top: "-25vh", left: "-25vw", width: "150vw", height: "150vh", zIndex: 9998 }}
          />
          {/* Menu rendu via PORTAL sur <body> + position fixe + z-index élevé :
              il sort de la pile du hero et passe AU-DESSUS de la carte (qui,
              autrement, masque les dernières options). */}
          <nav
            style={{
              position: "fixed",
              top: 84,
              right: 14,
              zIndex: 9999,
              width: "min(320px, 84vw)",
              maxHeight: "calc(100vh - 104px)",
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #eceafa",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(20,10,60,0.22)",
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
                {dict.nav[item.key]}
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
              {firstName ? `👤 ${firstName}` : dict.login}
            </Link>
          </nav>
        </>,
        document.body,
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
