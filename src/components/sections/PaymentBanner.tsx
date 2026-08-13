// Bandeau "Moyens de paiement" — GIF animé en boucle infinie (marquee de cartes
// acceptées). Placé après la FAQ. Le GIF boucle nativement dans <img> ; les
// marges blanches du visuel sont masquées via object-fit: cover.

export default function PaymentBanner() {
  return (
    <div className="hz pay-section" style={{ padding: "8px 56px 40px" }}>
      <div
        style={{
          borderRadius: 22,
          border: "1px solid #eceafa",
          background: "#fff",
          boxShadow: "0 6px 26px rgba(30,27,75,0.06)",
          overflow: "hidden",
          textAlign: "center",
          padding: "26px 20px 8px",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#5b21b6",
            marginBottom: 6,
          }}
        >
          PAIEMENTS 100 % SÉCURISÉS
        </div>
        <h2
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 26, color: "#0f0f2d", margin: "0 0 6px" }}
        >
          Moyens de paiement acceptés
        </h2>
        <p style={{ fontSize: 14, color: "#5c5c7a", margin: "0 auto 6px", maxWidth: 520 }}>
          Réglez vos billets en toute confiance avec les principales cartes bancaires.
        </p>

        {/* GIF animé en boucle — marges blanches rognées par object-fit */}
        <div
          className="pay-strip"
          style={{
            width: "100%",
            height: 190,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/moyens-paiement.gif"
            alt="Cartes de paiement acceptées défilant en continu"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      </div>
    </div>
  );
}
