import Link from "next/link";
import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";

// ─────────────────────────────────────────────────────────────────────────────
// Section discrète de confiance / disclaimer, juste avant le footer.
// Réservée au mobile (classe .trust-mobile). Texte petit, gris atténué.
// ─────────────────────────────────────────────────────────────────────────────
export default async function TrustDisclaimer() {
  const { locale } = await getPrefs();
  const t = getDictionary(locale);
  return (
    <section
      className="trust-mobile hz"
      style={{
        padding: "26px 56px 34px",
        borderTop: "1px solid #ececf2",
      }}
    >
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.65,
          color: "#5c5c7a",
          textAlign: "left",
          margin: 0,
          maxWidth: 760,
        }}
      >
        {t.trust.text}
      </p>
      <Link
        href="/conditions-generales"
        style={{
          display: "inline-block",
          marginTop: 12,
          fontSize: 13.5,
          color: "#5b21b6",
          fontWeight: 600,
          textDecoration: "underline",
        }}
      >
        {t.trust.cgv}
      </Link>
    </section>
  );
}
