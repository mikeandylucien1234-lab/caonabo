// ─────────────────────────────────────────────────────────────────────────────
// Section « Réservez votre vol avec l'accompagnement d'experts »
// 2 colonnes : gros titre à gauche (sans encadré) + carte WhatsApp à droite.
// Réservée au PC (masquée sur mobile via la classe .wa-desktop).
// ─────────────────────────────────────────────────────────────────────────────

import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";
import { WHATSAPP_NUMBER } from "@/lib/contactInfo";

const INK = "#1e1b4b";
const RED = "#dc2626";
const PURPLE = "#5b21b6";

export default async function ContactWhatsapp() {
  const { locale } = await getPrefs();
  const t = getDictionary(locale);
  return (
    <section className="wa-desktop hz" style={{ padding: "30px 56px 70px" }}>
      <div
        className="wa-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.05fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* GAUCHE : titre */}
        <h2
          className="font-heading"
          style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.14, margin: 0, color: INK }}
        >
          {t.whatsapp.titleA}
          <br />
          <span style={{ color: RED }}>{t.whatsapp.titleHi}</span>
        </h2>

        {/* DROITE : carte WhatsApp */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #eceafa",
            borderRadius: 26,
            padding: "34px 34px",
            boxShadow: "0 10px 30px rgba(30,27,75,0.06)",
          }}
        >
          {/* badge icône */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 999,
              background: "#f0ecfb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill={PURPLE} aria-hidden="true">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4.4 15.4 4 13.7 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z" />
              <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
            </svg>
          </div>

          <div className="font-heading" style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 10 }}>
            {t.whatsapp.cardTitle}
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 1.55, color: "#5c5c7a", margin: 0, maxWidth: 420 }}>
            {t.whatsapp.text}
          </p>

          {/* horaires */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, color: "#5c5c7a", fontSize: 14.5 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            <span style={{ fontWeight: 600 }}>{t.whatsapp.hours}</span>
          </div>

          {/* bouton bordé */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              marginTop: 26,
              padding: "14px 24px",
              borderRadius: 14,
              border: `1.5px solid ${PURPLE}`,
              color: PURPLE,
              background: "#fff",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            {t.whatsapp.cta}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6" />
              <path d="M20 4l-9 9" />
              <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
