import Header from "@/components/layout/Header";
import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";
import { getNextFlightDate, getBaggagePolicy, type SiteMediaMap } from "@/lib/data/queries";
import MediaFill, { resolveMedia } from "@/components/MediaFill";
import HeroFlightCard from "@/components/HeroFlightCard";

/**
 * Section Hero : le média de fond (image OU vidéo, configurable depuis l'admin)
 * remplit le hero en cover, le header et le titre sont superposés, et une carte
 * « Prochain vol » compacte en verre dépoli flotte au-dessus du bas.
 */
export default async function Hero({ media }: { media?: SiteMediaMap }) {
  const [{ locale }, nextDeparture, policy] = await Promise.all([
    getPrefs(),
    getNextFlightDate("SCL", "CAP"),
    getBaggagePolicy(),
  ]);
  const t = getDictionary(locale);
  const bg = resolveMedia(media, "hero", {
    type: "image",
    src: "/images/hero-bg.png",
  });
  return (
    <div
      className="hero-wrap"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "0 0 32px 32px",
        background: "#eef0f6",
      }}
    >
      {/* fond : image ou vidéo qui remplit le hero (cover) */}
      <MediaFill
        media={bg}
        poster="/images/hero-bg.png"
        alt="Terre vue de l'espace, villes de la diaspora"
      />

      {/* calque superposé : header en haut + titre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(ellipse 700px 420px at center 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0) 75%)",
        }}
      >
        <Header variant="hero" active="/" />
        <div
          className="hero-headline"
          style={{ textAlign: "center", padding: "6% 40px 0" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(91,33,182,0.25)",
              color: "#5b21b6",
              fontWeight: 600,
              fontSize: 14,
              padding: "9px 20px",
              borderRadius: 999,
            }}
          >
            {t.hero.badge}
          </div>
          <h1
            className="font-heading hero-title"
            style={{
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.25,
              color: "#1e1b4b",
              margin: "20px auto 0",
              maxWidth: 820,
            }}
          >
            {t.hero.title1}
            <span style={{ color: "#5b21b6" }}>{t.hero.hi1}</span>
            {t.hero.title2}
            <span style={{ color: "#dc2626" }}>{t.hero.hi2}</span>.
          </h1>
        </div>
      </div>

      {/* carte « Prochain vol » compacte, en verre dépoli, flottant sur l'image */}
      <div className="hero-card-float">
        <HeroFlightCard nextDeparture={nextDeparture} policy={policy} />
      </div>
    </div>
  );
}
