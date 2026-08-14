"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrefs, setPrefCookie } from "@/components/PreferencesProvider";
import { LOCALES, LOCALE_FLAGS, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { OFFERED_CURRENCIES } from "@/lib/currency";

const NAV = [
  { key: "home", href: "/" },
  { key: "destinations", href: "/destinations" },
  { key: "checkin", href: "/check-in" },
  { key: "book", href: "/book" },
  { key: "contact", href: "/#contact" },
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
  const { locale, currency, dict } = usePrefs();
  const router = useRouter();
  function choose(name: "locale" | "currency", value: string) {
    setPrefCookie(name, value);
    router.refresh();
  }

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
                {dict.nav[item.key]}
              </Link>
            ))}

            {/* Langue + devise */}
            <div style={{ borderTop: "1px solid #eceafa", margin: "8px 0 6px", paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8aa0", padding: "0 4px 6px" }}>LANGUE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {LOCALES.map((l: Locale) => (
                  <button
                    key={l}
                    onClick={() => choose("locale", l)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 9,
                      border: l === locale ? "1.5px solid #5b21b6" : "1.5px solid #ececf4",
                      background: l === locale ? "#f3effe" : "#fff", color: "#1e1b4b", fontWeight: 600, fontSize: 13,
                    }}
                  >
                    <span>{LOCALE_FLAGS[l]}</span> {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8aa0", padding: "10px 4px 6px" }}>DEVISE</div>
              <div style={{ display: "flex", gap: 6 }}>
                {OFFERED_CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => choose("currency", c)}
                    style={{
                      flex: 1, padding: "8px 6px", borderRadius: 9,
                      border: c === currency ? "1.5px solid #5b21b6" : "1.5px solid #ececf4",
                      background: c === currency ? "#f3effe" : "#fff", color: "#1e1b4b", fontWeight: 700, fontSize: 13,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

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
