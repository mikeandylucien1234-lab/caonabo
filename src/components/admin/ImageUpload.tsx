"use client";

import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "admin-uploads";

/**
 * Champ d'upload d'image (glisser-déposer ou sélection de fichier).
 * Envoie le fichier vers Supabase Storage (bucket public "admin-uploads"),
 * récupère l'URL publique et la remonte via onChange. Affiche un aperçu.
 */
export function ImageUpload({
  label = "Image",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("Format non supporté. Utilisez jpg, png ou webp.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Fichier trop volumineux (5 Mo maximum).");
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const sb = getSupabase();
      const { error: upErr } = await sb.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "#6b6b80", marginBottom: 6, fontWeight: 600 }}>{label}</div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Aperçu */}
        {value ? (
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Aperçu"
              style={{ width: 130, height: 92, objectFit: "cover", borderRadius: 12, border: "1px solid #e6e4f0", background: "#f6f4fc" }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Retirer l'image"
              style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 999, border: "none", background: "#dc2626", color: "#fff", fontSize: 14, cursor: "pointer", lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ) : null}

        {/* Zone de dépôt / sélection */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{
            flex: 1,
            minWidth: 200,
            cursor: uploading ? "wait" : "pointer",
            border: `1.5px dashed ${dragOver ? "#5b21b6" : "#cfc9ea"}`,
            background: dragOver ? "#f3effe" : "#faf9fd",
            borderRadius: 12,
            padding: "18px 16px",
            textAlign: "center",
            color: "#6b6b80",
            fontSize: 13.5,
          }}
        >
          {uploading ? (
            "Téléversement en cours…"
          ) : (
            <>
              <div style={{ fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>Choisir un fichier</div>
              <div>ou glissez-déposez ici · jpg, png, webp · 5 Mo max</div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
