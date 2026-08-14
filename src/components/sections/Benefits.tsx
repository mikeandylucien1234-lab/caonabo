// ─────────────────────────────────────────────────────────────────────────────
// Section « Découvrez les bienfaits d'Anacaona »
// Affiche uniquement l'image fournie, telle quelle.
// Réservée au PC (masquée sur mobile via la classe .benefits-desktop).
// ─────────────────────────────────────────────────────────────────────────────
export default function Benefits() {
  return (
    <section className="benefits-desktop hz" style={{ padding: "10px 56px 40px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/bienfaits-anacaona.jpg"
        alt="Découvrez les bienfaits d'Anacaona : évitez les arnaques, accompagnement 24/7, flexibilité assurée, offres exclusives."
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 24 }}
      />
    </section>
  );
}
