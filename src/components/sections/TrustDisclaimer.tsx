import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Section discrète de confiance / disclaimer, juste avant le footer.
// Réservée au mobile (classe .trust-mobile). Texte petit, gris atténué.
// ─────────────────────────────────────────────────────────────────────────────
export default function TrustDisclaimer() {
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
        Caonabo Airlinje propose des vols directs et avec escale entre le Chili,
        Haïti, le Canada et le Pérou. Les prix, disponibilités, taxes et délais
        peuvent varier selon la période et sont toujours confirmés au moment du
        paiement. Les paiements sont traités de façon sécurisée — Caonabo ne
        stocke jamais vos données de carte complètes.
      </p>
      <Link
        href="/conditions-generales"
        style={{
          display: "inline-block",
          marginTop: 12,
          fontSize: 13.5,
          color: "#5c5c7a",
          textDecoration: "underline",
        }}
      >
        Conditions Générales
      </Link>
    </section>
  );
}
