"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CityDTO, FlightResultDTO } from "@/lib/data/types";
import FlightResultCard from "@/components/sections/FlightResultCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import { withMinDelay } from "@/lib/minDelay";
import { usePrefs } from "@/components/PreferencesProvider";
import { CalendarOverlay, keyOf, frDate } from "@/components/BookingCalendar";

type TripType = "aller-retour" | "aller-simple";
type Panel = "from" | "to" | null;

const TRIP_DEFS: { key: TripType; label: string }[] = [
  { key: "aller-retour", label: "Aller-retour" },
  { key: "aller-simple", label: "Aller simple" },
];

export default function FlightSearch({ cities }: { cities: CityDTO[] }) {
  const [tripType, setTripType] = useState<TripType>("aller-retour");
  const [panel, setPanel] = useState<Panel>(null);
  const [from, setFrom] = useState<CityDTO | null>(null);
  const [to, setTo] = useState<CityDTO | null>(null);
  const [departDate, setDepartDate] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [results, setResults] = useState<FlightResultDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { dict } = usePrefs();

  // clic sur un résultat → ouvre le tunnel de réservation pré-rempli
  function goToBooking() {
    if (!from || !to) return;
    const params = new URLSearchParams({ origin: from.code, destination: to.code });
    if (departDate) params.set("date", departDate);
    router.push(`/book?${params.toString()}`);
  }

  const bothChosen = !!from && !!to;

  // fermeture des panneaux (villes / passagers) au clic extérieur / Échap
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (panel && barRef.current && !barRef.current.contains(e.target as Node)) {
        setPanel(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        setCalOpen(false);
      }
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
    setPanel(null);
  }
  function pickTo(c: CityDTO) {
    setTo(c);
    setPanel(null);
  }
  function swap() {
    setFrom(to);
    setTo(from);
  }

  function onCalDayClick(dateStr: string) {
    if (tripType === "aller-simple") {
      setDepartDate(dateStr);
      setReturnDate(null);
      setCalOpen(false);
      return;
    }
    // aller-retour : sélection d'une plage
    if (!departDate || (departDate && returnDate)) {
      setDepartDate(dateStr);
      setReturnDate(null);
      return;
    }
    if (keyOf(dateStr) < keyOf(departDate)) {
      setDepartDate(dateStr);
      return;
    }
    setReturnDate(dateStr);
    setCalOpen(false);
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
      const { res, data } = await withMinDelay(
        (async () => {
          const res = await fetch("/api/flights/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              origin: from.code,
              destination: to.code,
              departDate,
              returnDate: tripType === "aller-retour" ? returnDate : null,
              tripType,
            }),
          });
          const data = await res.json();
          return { res, data };
        })(),
      );
      if (!res.ok) throw new Error(data.error ?? "Erreur de recherche");
      setResults(data.flights as FlightResultDTO[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="recherche" className="hz" style={{ padding: "64px 56px" }}>
      <h2
        className="font-heading"
        style={{ fontWeight: 700, fontSize: 32, color: "#1e1b4b", margin: "0 0 24px" }}
      >
        {dict.flightSearch.title}
      </h2>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(30,27,75,0.08)",
          padding: "24px 28px",
        }}
      >
        {/* type de trajet */}
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
            {dict.search.prompt}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {TRIP_DEFS.map((t) => {
              const active = tripType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTripType(t.key);
                    if (t.key === "aller-simple") setReturnDate(null);
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
                  {t.key === "aller-retour" ? dict.search.round : dict.search.oneway}
                </button>
              );
            })}
          </div>
        </div>

        {/* barre Depuis / swap / Vers (empilée sur mobile) */}
        <div
          ref={barRef}
          className="ft-bar"
          style={{
            display: "flex",
            alignItems: "stretch",
            border: "1.5px solid #1e1b4b",
            borderRadius: 14,
            position: "relative",
          }}
        >
          <FieldSelect
            label={dict.search.from}
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
          <button
            onClick={swap}
            aria-label="Inverser origine et destination"
            className="ft-swap"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 42,
              height: 42,
              borderRadius: 999,
              border: "1.5px solid #dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              background: "#fff",
              zIndex: 3,
              cursor: "pointer",
            }}
          >
            ⇄
          </button>
          <FieldSelect
            label={dict.search.to}
            className="ft-vers"
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

        {/* dates + passagers : n'apparaissent qu'après avoir choisi Depuis ET Vers */}
        {bothChosen && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              className="dates-row"
              style={{
                display: "grid",
                gridTemplateColumns: tripType === "aller-retour" ? "1fr 1fr" : "1fr",
                gap: 14,
              }}
            >
              <DateField
                label="Date aller"
                value={departDate ? frDate(departDate) : "Sélectionner"}
                filled={!!departDate}
                onClick={() => setCalOpen(true)}
              />
              {tripType === "aller-retour" && (
                <DateField
                  label="Date retour"
                  value={returnDate ? frDate(returnDate) : "Sélectionner"}
                  filled={!!returnDate}
                  onClick={() => setCalOpen(true)}
                />
              )}
            </div>
          </div>
        )}

        {/* bouton recherche pleine largeur (mobile) */}
        <button
          onClick={search}
          disabled={loading}
          className="search-btn"
          style={{
            marginTop: 16,
            alignItems: "center",
            justifyContent: "center",
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
          {loading ? "…" : dict.flightSearch.search} <span>🔍</span>
        </button>
        {error && (
          <div style={{ fontSize: 13, color: "#dc2626", marginTop: 10 }}>{error}</div>
        )}

        {loading && <LoadingIndicator label="Recherche des meilleurs vols…" />}
        {!loading && results && <Results flights={results} onPick={goToBooking} />}
      </div>

      {/* calendrier multi-mois (overlay) */}
      {calOpen && (
        <CalendarOverlay
          tripType={tripType}
          departDate={departDate}
          returnDate={returnDate}
          onDayClick={onCalDayClick}
          onClose={() => setCalOpen(false)}
          originCode={from?.code}
          destinationCode={to?.code}
        />
      )}
    </div>
  );
}

function DateField({
  label,
  value,
  filled,
  onClick,
}: {
  label: string;
  value: string;
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1.5px solid #dcdae6",
        borderRadius: 12,
        padding: "10px 14px",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 12, color: "#8a8aa0" }}>{label}</div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 15,
          color: filled ? "#1e1b4b" : "#8a8aa0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>📅</span>
        {value}
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
  className,
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
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ flex: 1, padding: "16px 22px", position: "relative", cursor: "pointer" }}
      onClick={onToggle}
    >
      <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 14, marginBottom: 4 }}>
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

function Results({ flights, onPick }: { flights: FlightResultDTO[]; onPick: () => void }) {
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
        <FlightResultCard key={f.id} f={f} onSelect={onPick} />
      ))}
    </div>
  );
}
