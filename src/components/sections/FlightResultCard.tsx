"use client";

import { useState } from "react";
import type { FlightResultDTO } from "@/lib/data/types";
import { formatPrice, type RateInfo } from "@/lib/currency";

// ─────────────────────────────────────────────────────────────────────────────
// Carte de résultat de vol — COMPOSANT UNIQUE réutilisé partout :
//   • étape 2 du tunnel de réservation (recherche hero → /book)
//   • page d'offre "destination populaire"
//   • page d'offre "promotion" (prix promo + badge promo)
// Aucune autre implémentation de carte de résultat ne doit exister.
// ─────────────────────────────────────────────────────────────────────────────

const PURPLE = "#3d1e8a";
const PURPLE2 = "#5b21b6";

export interface FlightResultCardProps {
  f: FlightResultDTO;
  selected?: boolean;
  onSelect?: () => void;
  rates?: Record<string, RateInfo>;
  /** Prix promotionnel forcé (sinon prix réel du vol). */
  priceOverrideCents?: number | null;
  /** Ancien prix barré (offres/promotions). */
  oldPriceCents?: number | null;
  /** Badge promo qui remplace les fareTags (ex : "Promo −22%"). */
  promoBadge?: string | null;
  /** Couleur d'accent du badge promo. */
  accentColor?: string;
  /** Libellé sous le prix (défaut : "par personne dès"). */
  priceLabel?: string;
}

export default function FlightResultCard({
  f,
  selected = false,
  onSelect,
  rates,
  priceOverrideCents = null,
  oldPriceCents = null,
  promoBadge = null,
  accentColor = "#e11d5b",
  priceLabel = "par personne dès",
}: FlightResultCardProps) {
  const [showStops, setShowStops] = useState(false);
  const dep = new Date(f.departAt);
  const arr = new Date(f.arriveAt);
  const nextDay = dayNumber(arr) - dayNumber(dep);
  const price = priceOverrideCents ?? f.priceUsdCents;

  return (
    <div
      onClick={onSelect}
      className="bk-flight-card"
      style={{
        border: `1.5px solid ${selected ? PURPLE2 : "#eceafa"}`,
        background: selected ? "#faf7ff" : "#fff",
        borderRadius: 16,
        padding: "16px 20px",
        cursor: onSelect ? "pointer" : "default",
        boxShadow: selected ? "0 6px 20px rgba(91,33,182,0.14)" : "0 2px 10px rgba(30,27,75,0.05)",
        transition: "all .15s",
      }}
    >
      {/* badges : promo OU fareTags (Recommandé / Le plus économique) */}
      {(promoBadge || f.fareTags.length > 0) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {promoBadge ? (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.4,
                padding: "4px 10px",
                borderRadius: 999,
                textTransform: "uppercase",
                background: accentColor,
                color: "#fff",
              }}
            >
              🏷 {promoBadge}
            </span>
          ) : (
            f.fareTags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  ...(t === "Recommandé"
                    ? { background: "#fbf3d9", color: "#a9820f", border: "1px solid #ecd89a" }
                    : { background: "#e3f7ea", color: "#1f9d55", border: "1px solid #b7e8c8" }),
                }}
              >
                {t === "Recommandé" ? "★ Recommandé" : "Le plus économique"}
              </span>
            ))
          )}
        </div>
      )}

      <div className="bk-flight-row" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* départ */}
        <div style={{ textAlign: "center", minWidth: 74 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f0f2d" }}>{fmtTime(dep)}</div>
          <div style={{ fontSize: 13, color: "#7a7a92", fontWeight: 600 }}>{f.origin.code}</div>
        </div>

        {/* milieu : durée + escales */}
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 12, color: "#8a8aa0", marginBottom: 4 }}>{fmtDur(f.durationMinutes)}</div>
          <div style={{ position: "relative", height: 2, background: "#dcdae6", margin: "0 6px" }}>
            <span style={{ position: "absolute", left: -1, top: -3, width: 8, height: 8, borderRadius: 999, background: PURPLE2 }} />
            <span style={{ position: "absolute", right: -1, top: -3, width: 8, height: 8, borderRadius: 999, background: PURPLE2 }} />
          </div>
          {f.direct ? (
            <div style={{ fontSize: 12, color: "#1f9d55", fontWeight: 700, marginTop: 5 }}>Direct</div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStops((s) => !s);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", marginTop: 5, fontSize: 12, color: "#e0752c", fontWeight: 700, textDecoration: "underline" }}
            >
              {f.stops} escale{f.stops > 1 ? "s" : ""}
              {showStops && f.stopAirports.length ? ` · ${f.stopAirports.join(", ")}` : " ⓘ"}
            </button>
          )}
        </div>

        {/* arrivée */}
        <div style={{ textAlign: "center", minWidth: 74 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f0f2d" }}>
            {fmtTime(arr)}
            {nextDay > 0 && <sup style={{ fontSize: 11, color: "#e0752c", marginLeft: 2 }}>+{nextDay}</sup>}
          </div>
          <div style={{ fontSize: 13, color: "#7a7a92", fontWeight: 600 }}>{f.destination.code}</div>
        </div>

        {/* prix */}
        <div style={{ textAlign: "right", minWidth: 92 }}>
          <div style={{ fontWeight: 800, color: PURPLE, fontSize: 20 }}>
            {formatPrice(price, "USD", rates)}
          </div>
          {oldPriceCents ? (
            <div style={{ fontSize: 12, color: "#b4b2c4", textDecoration: "line-through" }}>
              {formatPrice(oldPriceCents, "USD", rates)}
            </div>
          ) : null}
          <div style={{ fontSize: 11, color: "#9a94b5" }}>{priceLabel}</div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 11.5, color: "#9a94b5" }}>
        Vol {f.flightNumber} · {fmtDate(dep)} · opéré par {f.operatedBy}
      </div>
    </div>
  );
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}
function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${String(m).padStart(2, "0")}` : `${h}h`;
}
function dayNumber(d: Date): number {
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
}
