import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";
import type { SiteMediaMap } from "@/lib/data/queries";
import MediaFill, { resolveMedia } from "@/components/MediaFill";

// ─────────────────────────────────────────────────────────────────────────────
// Bannière pleine largeur (avant « Préparez-vous à voyager »).
// Média de fond en boucle (vidéo OU image, configurable depuis l'admin) +
// voile sombre pour la lisibilité + titre/texte. Poster de secours.
// ─────────────────────────────────────────────────────────────────────────────
export default async function VideoBanner({ media }: { media?: SiteMediaMap }) {
  const { locale } = await getPrefs();
  const t = getDictionary(locale);
  const bg = resolveMedia(media, "video-banner", {
    type: "video",
    src: "/videos/banner-voyage.mp4",
  });
  // Format « hero » : bannière haute, coins arrondis, média en premier plan
  // (voile léger pour laisser la vidéo bien visible) + texte lisible en bas.
  const H = "clamp(440px, 58vw, 480px)";
  return (
    <section style={{ padding: "10px 0 44px" }}>
      <div style={{ position: "relative", width: "100%", minHeight: H, borderRadius: 28, overflow: "hidden", background: "#0f0a2d" }}>
        {/* média de fond (vidéo ou image), au premier plan */}
        <MediaFill media={bg} poster="/images/hero-bg.png" ariaHidden />

        {/* voile léger : dégradé bas → haut pour la lisibilité du texte, la vidéo
            reste bien visible (au premier plan) */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,10,45,0.05) 0%, rgba(15,10,45,0.12) 45%, rgba(15,10,45,0.72) 100%)" }} />

        {/* contenu : titre + texte ancrés en bas */}
        <div style={{ position: "relative", padding: "clamp(28px, 6vw, 56px)", maxWidth: 720, minHeight: H, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <h2 className="font-heading" style={{ color: "#fff", fontSize: "clamp(28px, 4.2vw, 44px)", fontWeight: 800, lineHeight: 1.12, margin: "0 0 12px", textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}>
            {t.videoBanner.title}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.94)", fontSize: "clamp(15px, 1.5vw, 18px)", lineHeight: 1.55, margin: 0, textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}>
            {t.videoBanner.text}
          </p>
        </div>
      </div>
    </section>
  );
}
