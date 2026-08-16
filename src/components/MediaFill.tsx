import type { SiteMediaEntry, SiteMediaMap } from "@/lib/data/queries";

export interface ResolvedMedia {
  type: "image" | "video";
  src: string;
}

/**
 * Résout le média à afficher pour une section : l'override admin (SiteMedia)
 * s'il existe, sinon le média par défaut fourni (fichier /public).
 */
export function resolveMedia(
  map: SiteMediaMap | undefined,
  key: string,
  fallback: ResolvedMedia,
): ResolvedMedia {
  const o: SiteMediaEntry | undefined = map?.[key];
  if (o && o.url) return { type: o.type, src: o.url };
  return fallback;
}

/**
 * Remplit son conteneur (position absolue, cover) avec une vidéo en boucle
 * OU une image, selon le type du média. Utilisé par Hero, les cartes
 * destinations et la bannière vidéo — le type est piloté par la base.
 */
export default function MediaFill({
  media,
  poster,
  alt = "",
  ariaHidden = false,
  style,
}: {
  media: ResolvedMedia;
  poster?: string;
  alt?: string;
  ariaHidden?: boolean;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...style,
  };

  if (media.type === "video") {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        aria-hidden={ariaHidden || undefined}
        aria-label={ariaHidden ? undefined : alt || undefined}
        style={base}
      >
        <source src={media.src} type="video/mp4" />
      </video>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.src} alt={alt} aria-hidden={ariaHidden || undefined} style={base} />;
}
