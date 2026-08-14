"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrefs, setPrefCookie } from "@/components/PreferencesProvider";
import { LOCALES, LOCALE_LABELS, LOCALE_FLAGS, type Locale } from "@/lib/i18n";
import { OFFERED_CURRENCIES, CURRENCY_LABELS } from "@/lib/prefs";

/**
 * Sélecteur langue + devise (cookie + rafraîchissement du rendu serveur).
 * `tone` adapte les couleurs pour le hero (transparent) ou l'en-tête blanc.
 */
export default function LocaleCurrencySwitcher({ tone = "solid" }: { tone?: "hero" | "solid" }) {
  const { locale, currency } = usePrefs();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function choose(name: "locale" | "currency", value: string) {
    setPrefCookie(name, value);
    router.refresh();
  }

  const triggerColor = tone === "hero" ? "#1e1b4b" : "#1e1b4b";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Langue et devise"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: tone === "hero" ? "rgba(255,255,255,0.6)" : "#f4f2fb",
          border: "1px solid #e0dcf0",
          color: triggerColor,
          fontWeight: 700,
          fontSize: 13.5,
          padding: "9px 14px",
          borderRadius: 999,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span>{locale.toUpperCase()}</span>
        <span style={{ color: "#8a8aa0" }}>·</span>
        <span>{currency}</span>
        <span style={{ fontSize: 10, color: "#8a8aa0" }}>▼</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              zIndex: 50,
              width: 250,
              background: "#fff",
              border: "1px solid #eceafa",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(20,10,60,0.18)",
              padding: 14,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8aa0", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Langue</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
              {LOCALES.map((l: Locale) => {
                const active = l === locale;
                return (
                  <button
                    key={l}
                    onClick={() => choose("locale", l)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "9px 10px", borderRadius: 10,
                      border: active ? "1.5px solid #5b21b6" : "1.5px solid #ececf4",
                      background: active ? "#f3effe" : "#fff", color: "#1e1b4b", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    <span>{LOCALE_FLAGS[l]}</span> {LOCALE_LABELS[l]}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8aa0", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Devise</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {OFFERED_CURRENCIES.map((c) => {
                const active = c === currency;
                return (
                  <button
                    key={c}
                    onClick={() => choose("currency", c)}
                    style={{
                      textAlign: "left", padding: "9px 12px", borderRadius: 10,
                      border: active ? "1.5px solid #5b21b6" : "1.5px solid #ececf4",
                      background: active ? "#f3effe" : "#fff", color: "#1e1b4b", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}
                  >
                    {CURRENCY_LABELS[c] ?? c}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
