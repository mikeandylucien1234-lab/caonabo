"use client";

import { useRows, useUpsert, useRemove, fmtDateTime } from "@/lib/admin/api";
import { MediaUpload, fmtSize, type UploadedMedia } from "@/components/admin/MediaUpload";
import { PageHead, Card, Btn, Badge, Loading, ErrorBox, INK, PURPLE } from "@/components/admin/ui";

interface MediaRow {
  id: string;
  key: string;
  mediaType: string; // "image" | "video"
  url: string;
  fileSizeBytes: number;
  updatedAt: string;
}

// Les 4 sections « bannière » configurables du site public.
const SECTIONS: Array<{ key: string; title: string; hint: string; fallback: string }> = [
  {
    key: "hero",
    title: "Accueil — fond du Hero",
    hint: "Grand média de fond en haut de la page d'accueil.",
    fallback: "Image par défaut : /images/hero-bg.png",
  },
  {
    key: "dest-toronto",
    title: "Destinations — carte Toronto",
    hint: "Média de la carte « Toronto » du bloc Destinations populaires.",
    fallback: "Vidéo par défaut : /videos/toronto.mp4",
  },
  {
    key: "dest-pap",
    title: "Destinations — carte Port-au-Prince",
    hint: "Média de la carte « Port-au-Prince » du bloc Destinations populaires.",
    fallback: "Vidéo par défaut : /videos/port-au-prince.mp4",
  },
  {
    key: "video-banner",
    title: "Bannière avant « Préparez-vous »",
    hint: "Média de fond de la bannière pleine largeur.",
    fallback: "Vidéo par défaut : /videos/banner-voyage.mp4",
  },
];

export default function AdminMedias() {
  const { data, isLoading, error } = useRows<MediaRow>("SiteMedia", "*", {});
  const upsert = useUpsert("SiteMedia", ["SiteMedia"]);
  const remove = useRemove("SiteMedia", ["SiteMedia"]);

  const byKey = new Map<string, MediaRow>((data ?? []).map((r) => [r.key, r]));

  function save(key: string, m: UploadedMedia) {
    const existing = byKey.get(key);
    if (existing) {
      upsert.mutate({ id: existing.id, mediaType: m.type, url: m.url, fileSizeBytes: m.size });
    } else {
      upsert.mutate({ key, mediaType: m.type, url: m.url, fileSizeBytes: m.size });
    }
  }

  return (
    <div>
      <PageHead
        title="Médias du site"
        subtitle="Remplacez le média (vidéo ou image) des sections « bannière » du site public, sans redéploiement. Les changements sont visibles immédiatement."
      />

      {isLoading ? (
        <Loading label="Chargement des médias…" />
      ) : error ? (
        <ErrorBox message={(error as Error).message} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {SECTIONS.map((s) => {
            const row = byKey.get(s.key);
            const busy = upsert.isPending || remove.isPending;
            return (
              <Card key={s.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 17, color: INK, margin: 0 }}>
                      {s.title}
                    </h2>
                    <div style={{ fontSize: 13, color: "#8a8aa0", marginTop: 4, maxWidth: 520 }}>{s.hint}</div>
                  </div>
                  {row ? (
                    <Badge label={row.mediaType === "video" ? "Vidéo personnalisée" : "Image personnalisée"} tone="violet" />
                  ) : (
                    <Badge label="Média par défaut" tone="grey" />
                  )}
                </div>

                <div className="adm-cols" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, marginTop: 16, alignItems: "start" }}>
                  {/* Aperçu du média actuel */}
                  <div>
                    <div style={{ fontSize: 12, color: "#8a8aa0", fontWeight: 600, marginBottom: 6 }}>Média actuel</div>
                    <div style={{ width: "100%", aspectRatio: "16 / 10", borderRadius: 12, overflow: "hidden", border: "1px solid #e6e4f0", background: "#0f0a2d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {row ? (
                        row.mediaType === "video" ? (
                          // eslint-disable-next-line jsx-a11y/media-has-caption
                          <video src={row.url} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.url} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )
                      ) : (
                        <span style={{ color: "#b9b6d6", fontSize: 12.5, textAlign: "center", padding: 10, lineHeight: 1.5 }}>
                          {s.fallback}
                        </span>
                      )}
                    </div>
                    {row && (
                      <div style={{ fontSize: 12, color: "#6b6b80", marginTop: 8 }}>
                        <div>Taille : <b>{fmtSize(row.fileSizeBytes)}</b></div>
                        <div style={{ color: "#8a8aa0", marginTop: 2 }}>Modifié le {fmtDateTime(row.updatedAt)}</div>
                      </div>
                    )}
                  </div>

                  {/* Upload + réinitialisation */}
                  <div>
                    <MediaUpload onUploaded={(m) => save(s.key, m)} disabled={busy} />
                    {row && (
                      <div style={{ marginTop: 10 }}>
                        <Btn variant="ghost" onClick={() => remove.mutate(row.id)} disabled={busy}>
                          Réinitialiser au média par défaut
                        </Btn>
                      </div>
                    )}
                    {(upsert.isError || remove.isError) && (
                      <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 8 }}>
                        {((upsert.error || remove.error) as Error)?.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          <div style={{ fontSize: 12.5, color: "#8a8aa0", lineHeight: 1.6 }}>
            <b style={{ color: PURPLE }}>Note :</b> les vidéos sont limitées à 15 Mo et les images à 5 Mo
            pour préserver la vitesse du site. Préparez de préférence des vidéos déjà compressées
            (720p, bitrate modéré) avant l&apos;envoi.
          </div>
        </div>
      )}
    </div>
  );
}
