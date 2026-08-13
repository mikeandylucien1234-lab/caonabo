import LoadingIndicator from "@/components/LoadingIndicator";

// Écran de chargement affiché pendant le rendu serveur des pages dynamiques
// (accueil : destinations, promotions, FAQ… ; offres ; etc.).
export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <LoadingIndicator label="Chargement…" size={170} />
    </div>
  );
}
