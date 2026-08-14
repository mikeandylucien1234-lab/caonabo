// ─────────────────────────────────────────────────────────────────────────────
// Bandeau « À bord, Haïti vous accompagne » (repas + connectivité Caonabo).
// Affiche l'image fournie (haute résolution, coins arrondis transparents),
// telle quelle et sans perte de qualité.
// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardBanner() {
  return (
    <section className="hz" style={{ padding: "10px 56px 50px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/a-bord.webp"
        alt="À bord, Haïti vous accompagne : plats 100 % haïtiens et connectivité pendant le vol."
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </section>
  );
}
