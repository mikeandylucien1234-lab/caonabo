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
  return (
    <section style={{ padding: "10px 0 44px" }}>
      <div style={{ position: "relative", width: "100%", minHeight: "clamp(300px, 42vw, 440px)", borderRadius: 28, overflow: "hidden", background: "#0f0a2d" }}>
        {/* média de fond (vidéo ou image) */}
        <MediaFill media={bg} poster="/images/hero-bg.png" ariaHidden />

        {/* voile sombre (cohérent avec le hero) */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(15,10,45,0.74) 0%, rgba(15,10,45,0.48) 55%, rgba(15,10,45,0.28) 100%)" }} />

        {/* contenu */}
        <div style={{ position: "relative", padding: "clamp(36px, 6vw, 64px) clamp(22px, 6vw, 56px)", maxWidth: 660, minHeight: "clamp(300px, 42vw, 440px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 className="font-heading" style={{ color: "#fff", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, lineHeight: 1.12, margin: "0 0 14px" }}>
            {t.videoBanner.title}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "clamp(15px, 1.4vw, 17px)", lineHeight: 1.55, margin: 0 }}>
            {t.videoBanner.text}
          </p>
        </div>
      </div>
    </section>
  );
}
