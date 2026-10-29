// Indicateur de chargement unique du site : l'avion Caonabo animé + un texte
// optionnel en dessous. Remplace tous les spinners génériques (public + admin).
// Utilisable en composant serveur comme client (aucun hook).

export default function LoadingIndicator({
  label,
  size = 150,
  style,
}: {
  label?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "24px 16px",
        width: "100%",
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/loading-plane.gif"
        alt=""
        aria-hidden="true"
        style={{ width: size, maxWidth: "70%", height: "auto" }}
      />
      {label ? (
        <div style={{ fontSize: 14, color: "#7a7a92", fontWeight: 600, textAlign: "center" }}>{label}</div>
      ) : null}
    </div>
  );
}
