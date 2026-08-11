"use client";

import { useEffect, useRef, useState } from "react";
import type { CityDTO, FlightResultDTO } from "@/lib/data/types";
import { formatPrice } from "@/lib/currency";

type TripType = "aller-retour" | "aller-simple" | "multi-destination";
type Panel = "from" | "to" | "calendar" | null;

const TRIP_DEFS: { key: TripType; label: string }[] = [
  { key: "aller-retour", label: "Aller-retour" },
  { key: "aller-simple", label: "Aller simple" },
  { key: "multi-destination", label: "Multi-destination" },
];

export default function FlightSearch({ cities }: { cities: CityDTO[] }) {
  const [tripType, setTripType] = useState<TripType>("aller-retour");
  const [panel, setPanel] = useState<Panel>(null);
  const [from, setFrom] = useState<CityDTO | null>(null);
  const [to, setTo] = useState<CityDTO | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [results, setResults] = useState<FlightResultDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const needed =
    tripType === "aller-simple" ? 1 : tripType === "aller-retour" ? 2 : 4;

  // fermeture au clic extérieur / Échap
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (panel && barRef.current && !barRef.current.contains(e.target as Node)) {
        setPanel(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  function pickFrom(c: CityDTO) {
    setFrom(c);
    setPanel(to ? "calendar" : null);
    if (to) setDates([]);
  }
  function pickTo(c: CityDTO) {
    setTo(c);
    setPanel(from ? "calendar" : null);
    if (from) setDates([]);
  }
  function swap() {
    setFrom(to);
    setTo(from);
  }
  function pickDay(dateStr: string) {
    const next = dates.includes(dateStr) ? dates : [...dates, dateStr];
    if (next.length >= needed) {
      setDates(next);
      setPanel(null);
    } else {
      setDates(next);
    }
  }

  async function search() {
    setError(null);
    if (!from || !to) {
      setError("Veuillez choisir une origine et une destination.");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: from.code,
          destination: to.code,
          departDate: dates[0] ?? null,
          returnDate: tripType === "aller-retour" ? (dates[1] ?? null) : null,
          tripType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de recherche");
      setResults(data.flights as FlightResultDTO[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  const promptByType: Record<TripType, string> = {
    "aller-simple": "Choisissez la date de départ",
    "aller-retour":
      dates.length === 0
        ? "Choisissez la date de départ"
        : "Choisissez la date de retour",
    "multi-destination": `Choisissez la date du segment ${dates.length + 1}`,
  };

  return (
    <div id="recherche" className="hz" style={{ padding: "64px 56px" }}>
      <h2
        className="font-heading"
        style={{
          fontWeight: 700,
          fontSize: 32,
          color: "#1e1b4b",
          margin: "0 0 24px",
        }}
      >
        Trouvez un vol à votre mesure
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(30,27,75,0.08)",
          padding: "24px 28px",
        }}
      >
        <div
          className="trip-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
            gap: 12,
          }}
        >
          <div style={{ fontSize: 16, color: "#1e1b4b", fontWeight: 600 }}>
            Où souhaitez-vous aller ?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {TRIP_DEFS.map((t) => {
              const active = tripType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTripType(t.key);
                    setDates([]);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `1px solid ${active ? "#3d1e8a" : "#dcdae6"}`,
                    background: active ? "#eef0fd" : "#fff",
                    color: active ? "#3d1e8a" : "#4b4b6b",
                  }}
                >
                  {active ? "✓ " : ""}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* barre Depuis / swap / Vers */}
        <div
          ref={barRef}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid #1e1b4b",
            borderRadius: 14,
            overflow: "visible",
            position: "relative",
          }}
        >
          <FieldSelect
            label="Depuis"
            value={from ? `${from.city}, ${from.country}` : "Saisir une origine"}
            placeholderColor={from ? "#1e1b4b" : "#8a8aa0"}
            open={panel === "from"}
            onToggle={() => setPanel(panel === "from" ? null : "from")}
            align="left"
            cities={cities}
            selected={from}
            disabled={to}
            onPick={pickFrom}
          />
          <div style={{ width: 1, height: 44, background: "#e4e2ef" }} />
          <button
            onClick={swap}
            aria-label="Inverser origine et destination"
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "1.5px solid #dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              flexShrink: 0,
              margin: "0 -22px",
              background: "#fff",
              zIndex: 2,
              cursor: "pointer",
            }}
          >
            ⇄
          </button>
          <div style={{ width: 1, height: 44, background: "#e4e2ef" }} />
          <FieldSelect
            label="Vers"
            value={to ? `${to.city}, ${to.country}` : "Saisir une destination"}
            placeholderColor={to ? "#1e1b4b" : "#8a8aa0"}
            open={panel === "to"}
            onToggle={() => setPanel(panel === "to" ? null : "to")}
            align="right"
            cities={cities}
            selected={to}
            disabled={from}
            onPick={pickTo}
          />
        </div>

        {/* calendrier */}
        {panel === "calendar" && (
          <Calendar
            prompt={promptByType[tripType]}
            selected={dates}
            onPick={pickDay}
          />
        )}

        {/* action recherche */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 16,
          }}
        >
          <button
            onClick={search}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#3d1e8a",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px 26px",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Recherche…" : "Rechercher"} <span>🔍</span>
          </button>
          {dates.length > 0 && (
            <span style={{ fontSize: 13, color: "#7a7a92" }}>
              {dates.length} date{dates.length > 1 ? "s" : ""} sélectionnée
              {dates.length > 1 ? "s" : ""}
            </span>
          )}
          {error && (
            <span style={{ fontSize: 13, color: "#dc2626" }}>{error}</span>
          )}
        </div>

        {/* résultats */}
        {results && <Results flights={results} />}
      </div>
    </div>
  );
}

function FieldSelect({
  label,
  value,
  placeholderColor,
  open,
  onToggle,
  align,
  cities,
  selected,
  disabled,
  onPick,
}: {
  label: string;
  value: string;
  placeholderColor: string;
  open: boolean;
  onToggle: () => void;
  align: "left" | "right";
  cities: CityDTO[];
  selected: CityDTO | null;
  disabled: CityDTO | null;
  onPick: (c: CityDTO) => void;
}) {
  return (
    <div
      style={{ flex: 1, padding: "16px 22px", position: "relative", cursor: "pointer" }}
      onClick={onToggle}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#1e1b4b",
          fontSize: 14,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ color: placeholderColor, fontSize: 14 }}>{value}</div>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="city-pop"
          style={{
            position: "absolute",
            top: "100%",
            [align]: 0,
            marginTop: 8,
            width: 280,
            background: "#fff",
            border: "1.5px solid #1e1b4b",
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(30,27,75,0.08)",
            padding: 8,
            zIndex: 20,
          }}
        >
          {cities.map((c) => {
            const isDisabled = disabled?.code === c.code;
            const isSelected = selected?.code === c.code;
            return (
              <div
                key={c.code}
                onClick={() => !isDisabled && onPick(c)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  color: isDisabled ? "#c7c5d6" : "#1e1b4b",
                  background: isSelected ? "#f2f0f7" : "transparent",
                }}
              >
                {c.city} ({c.code}, {c.country})
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Calendar({
  prompt,
  selected,
  onPick,
}: {
  prompt: string;
  selected: string[];
  onPick: (d: string) => void;
}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: { label: string; dateStr?: string }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ label: "" });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ label: String(d), dateStr: `${year}-${month + 1}-${d}` });
  }

  return (
    <div
      style={{
        marginTop: 12,
        border: "1.5px solid #1e1b4b",
        borderRadius: 14,
        padding: "16px 18px",
        background: "#fff",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#1e1b4b",
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        {prompt}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 6,
        }}
      >
        {cells.map((c, i) => {
          const isSel = c.dateStr ? selected.includes(c.dateStr) : false;
          return (
            <div
              key={i}
              onClick={() => c.dateStr && onPick(c.dateStr)}
              style={{
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 13,
                cursor: c.dateStr ? "pointer" : "default",
                color: isSel ? "#fff" : c.dateStr ? "#1e1b4b" : "transparent",
                background: isSel ? "#5b21b6" : "transparent",
                fontWeight: isSel ? 700 : 500,
              }}
            >
              {c.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Results({ flights }: { flights: FlightResultDTO[] }) {
  if (flights.length === 0) {
    return (
      <div
        style={{
          marginTop: 22,
          padding: "20px",
          borderRadius: 12,
          background: "#faf9fc",
          color: "#5c5c7a",
          fontSize: 14,
        }}
      >
        Aucun vol trouvé pour cet itinéraire. Essayez d&apos;autres dates ou
        destinations.
      </div>
    );
  }
  return (
    <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, color: "#5c5c7a", fontWeight: 600 }}>
        {flights.length} vol{flights.length > 1 ? "s" : ""} trouvé
        {flights.length > 1 ? "s" : ""}
      </div>
      {flights.slice(0, 8).map((f) => (
        <div
          key={f.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #f0eef7",
            borderRadius: 12,
            padding: "14px 18px",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "#0f0f2d", fontSize: 15 }}>
              {f.origin.city} → {f.destination.city}
            </div>
            <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 2 }}>
              {f.flightNumber} · {formatDateTime(f.departAt)} ·{" "}
              {f.direct ? "Vol direct" : `${f.stops} escale`}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 18 }}>
              {formatPrice(f.priceUsdCents, "USD")}
            </div>
            <div style={{ fontSize: 12, color: "#a0a0b4" }}>
              {f.seatsAvailable} places
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
