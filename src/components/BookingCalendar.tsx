"use client";

import { useEffect, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";

export const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
export const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

/** Clé numérique comparable à partir d'une date "YYYY-M-D" (tolère le zéro-remplissage). */
export function keyOf(dateStr: string | null): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split("-").map(Number);
  return y * 10000 + m * 100 + d;
}
/** Affichage "26 Mai 2025". */
export function frDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS_FR[m - 1]} ${y}`;
}
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
/** "YYYY-MM-DD" zéro-rempli : compatible <input type="date"> et clés d'API. */
export function ymd(y: number, m1: number, d: number): string {
  return `${y}-${pad2(m1)}-${pad2(d)}`;
}

// La route Santiago (SCL) <-> Cap-Haïtien (CAP) est un affrètement (charter)
// au calendrier officiel fixe (~1 rotation/mois), pas un vol quotidien.
// Sur cette route UNIQUEMENT, le calendrier grise les dates sans vol réel.
export function isRestrictedRoute(
  origin?: string | null,
  destination?: string | null,
): boolean {
  if (!origin || !destination) return false;
  const codes = [origin.toUpperCase(), destination.toUpperCase()].sort().join("-");
  return codes === "CAP-SCL";
}

/** Dates (YYYY-MM-DD) ayant un vol réel pour origin/destination, si la route est restreinte. */
function useAvailableDates(origin?: string | null, destination?: string | null) {
  const restricted = isRestrictedRoute(origin, destination);
  const [dates, setDates] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!restricted || !origin || !destination) {
      setDates(null);
      return;
    }
    let cancelled = false;
    setDates(null);
    fetch(
      `/api/flights/availability?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const set = new Set<string>((d.dates ?? []).map((x: { date: string }) => x.date));
        setDates(set);
      })
      .catch(() => {
        if (!cancelled) setDates(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [restricted, origin, destination]);

  return { restricted, dates };
}

/**
 * Calendrier multi-mois (overlay), partagé entre la recherche principale et
 * le tunnel de réservation. Pour la route restreinte SCL<->CAP, les dates
 * SANS vol officiel apparaissent en gris pâle et ne sont pas sélectionnables ;
 * les dates AVEC vol réel restent en noir, normalement cliquables.
 */
export function CalendarOverlay({
  tripType,
  departDate,
  returnDate,
  onDayClick,
  onClose,
  originCode,
  destinationCode,
}: {
  tripType: string;
  departDate: string | null;
  returnDate: string | null;
  onDayClick: (d: string) => void;
  onClose: () => void;
  originCode?: string | null;
  destinationCode?: string | null;
}) {
  const { dict } = usePrefs();
  const { restricted, dates: availableDates } = useAvailableDates(originCode, destinationCode);
  // 6 mois glissants à partir du mois courant
  const base = new Date();
  base.setDate(1);
  const months: { y: number; m: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const dt = new Date(base.getFullYear(), base.getMonth() + i, 1);
    months.push({ y: dt.getFullYear(), m: dt.getMonth() });
  }

  const today = new Date();
  const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const dK = keyOf(departDate);
  const rK = keyOf(returnDate);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,15,45,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 12px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          borderRadius: 20,
          padding: "20px 18px 24px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* en-tête Aller / Retour + fermer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", gap: 22 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8a8aa0" }}>{dict.search.depart}</div>
              <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>
                {departDate ? frDate(departDate) : "Sélectionner"}
              </div>
            </div>
            {tripType === "aller-retour" && (
              <div>
                <div style={{ fontSize: 12, color: "#8a8aa0" }}>{dict.search.ret}</div>
                <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>
                  {returnDate ? frDate(returnDate) : "Sélectionner"}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: "1.5px solid #3d1e8a",
              background: "#fff",
              color: "#3d1e8a",
              fontSize: 18,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {restricted && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              color: "#5c5c7a",
              background: "#f7f6fb",
              border: "1px solid #eceafa",
              borderRadius: 10,
              padding: "9px 12px",
              marginBottom: 14,
            }}
          >
            <span aria-hidden>✈️</span>
            <span>
              Vol charter : seules les dates en <b style={{ color: "#1e1b4b" }}>noir</b> ont un
              vol réel sur cette route.
            </span>
          </div>
        )}

        {months.map(({ y, m }) => {
          const startOffset = (new Date(y, m, 1).getDay() + 6) % 7;
          const daysInMonth = new Date(y, m + 1, 0).getDate();
          const cells: (number | null)[] = [];
          for (let i = 0; i < startOffset; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          return (
            <div key={`${y}-${m}`} style={{ marginBottom: 22 }}>
              <div
                className="font-heading"
                style={{
                  textAlign: "center",
                  fontWeight: 700,
                  color: "#1e1b4b",
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                {MONTHS_FR[m]} {y}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#a0a0b4",
                      fontWeight: 600,
                    }}
                  >
                    {w}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {cells.map((d, i) => {
                  if (d === null) return <div key={i} />;
                  const k = y * 10000 + (m + 1) * 100 + d;
                  const past = k < todayKey;
                  // Sur la route restreinte : gris pâle + non cliquable tant que la
                  // date n'a pas de vol réel connu (une fois les dates chargées).
                  const noRealFlight =
                    restricted && availableDates !== null && !availableDates.has(ymd(y, m + 1, d));
                  const disabled = past || noRealFlight;
                  const isStart = k === dK;
                  const isEnd = k === rK;
                  const inRange = dK && rK && k > dK && k < rK;
                  const selected = isStart || isEnd;
                  return (
                    <div
                      key={i}
                      onClick={() => !disabled && onDayClick(ymd(y, m + 1, d))}
                      style={{
                        textAlign: "center",
                        padding: "9px 0",
                        borderRadius: 9,
                        fontSize: 14,
                        cursor: disabled ? "default" : "pointer",
                        color: disabled ? "#d4d2e0" : selected ? "#fff" : "#1e1b4b",
                        background: selected
                          ? "#5b21b6"
                          : inRange
                            ? "#eee7fb"
                            : "transparent",
                        fontWeight: selected ? 700 : 500,
                      }}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
