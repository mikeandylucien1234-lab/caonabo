"use client";

import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

// Limites imposées pour ne pas ralentir le site public.
const IMG_MAX = 5 * 1024 * 1024; // 5 Mo
const VID_MAX = 15 * 1024 * 1024; // 15 Mo
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VID_TYPES = ["video/mp4"];
const BUCKET = "admin-uploads"; // bucket public (lecture publique)

export interface UploadedMedia {
  url: string;
  type: "image" | "video";
  size: number;
}

/**
 * Upload d'un média de bannière : accepte une vidéo (mp4 ≤ 15 Mo) OU une image
 * (jpg/png/webp ≤ 5 Mo). Téléverse vers Supabase Storage (bucket public) et
 * remonte l'URL publique + le type + la taille via onUploaded.
 */
export function MediaUpload({
  onUploaded,
  disabled,
}: {
  onUploaded: (m: UploadedMedia) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

    const isImage = IMG_TYPES.includes(file.type);
    const isVideo = VID_TYPES.includes(file.type);
    if (!isImage && !isVideo) {
      setError("Format non supporté. Vidéo : mp4. Image : jpg, png ou webp.");
      return;
    }
    if (isVideo && file.size > VID_MAX) {
      setError(
        `Vidéo trop volumineuse (${fmtSize(file.size)}). Maximum autorisé : 15 Mo.`,
      );
      return;
    }
    if (isImage && file.size > IMG_MAX) {
      setError(
        `Image trop volumineuse (${fmtSize(file.size)}). Maximum autorisé : 5 Mo.`,
      );
      return;
    }

    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")).toLowerCase();
      const path = `site-media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const sb = getSupabase();
      const { error: upErr } = await sb.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      onUploaded({ url: data.publicUrl, type: isVideo ? "video" : "image", size: file.size });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du téléversement.");
    } finally {
      setUploading(false);
    }
  }

  const off = disabled || uploading;
  return (
    <div>
      <div
        onClick={() => !off && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!off) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!off) handleFile(e.dataTransfer.files?.[0]); }}
        style={{
          cursor: off ? "wait" : "pointer",
          border: `1.5px dashed ${dragOver ? "#5b21b6" : "#cfc9ea"}`,
          background: dragOver ? "#f3effe" : "#faf9fd",
          borderRadius: 12,
          padding: "16px",
          textAlign: "center",
          color: "#6b6b80",
          fontSize: 13,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {uploading ? (
          "Téléversement en cours…"
        ) : (
          <>
            <div style={{ fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>
              Remplacer le média
            </div>
            <div>Vidéo mp4 (15 Mo max) ou image jpg/png/webp (5 Mo max)</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 8 }}>{error}</p>}
    </div>
  );
}

export function fmtSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
