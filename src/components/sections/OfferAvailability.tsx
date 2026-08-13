"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/currency";
import type { FlightResultDTO } from "@/lib/data/types";
import FlightResultCard from "@/components/sections/FlightResultCard";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

interface AvailDate {
  date: string; // YYYY-MM-DD
  priceUsdCents: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function frLong(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${pad(d)} ${MONTHS_FR[m - 1]} ${y}`;
}

export default function OfferAvailability({
  originCode,
  destinationCode,
  accentColor,
  kind,
  promoPriceCents = null,
  oldPriceCents = null,
}: {
  originCode: string;
  destinationCode: string;
  accentColor: string;
  kind: "promotion" | "destination";
  promoPriceCents?: number | null;
  oldPriceCents?: number | null;
}) {
  const router = useRouter();
  // badge promo (remplace Recommandé/Le plus économique sur les cartes de promo)
  const promoBadge =
    kind === "promotion" && oldPriceCents && promoPriceCents
      ? `Promo −${Math.round((1 - promoPriceCents / oldPriceCents) * 100)}%`
      : kind === "promotion"
        ? "Promotion"
        : null;
  const [avail, setAvail] = useState<AvailDate[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [open, setOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [flights, setFlights] = useState<FlightResultDTO[] | null>(null);
  const [loadingFlights, setLoadingFlights] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoadingAvail(true);
    fetch(`/api/flights/availability?origin=${originCode}&destination=${destinationCode}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setAvail(Array.isArray(d.dates) ? d.dates : []);
      })
      .catch(() => alive && setAvail([]))
      .finally(() => alive && setLoadingAvail(false));
    return () => {
      alive = false;
    };
  }, [originCode, destinationCode]);

  const availMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of avail) m.set(a.date, a.priceUsdCents);
    return m;
  }, [avail]);

  // premier mois affiché = mois de la 1re date dispo (ou mois courant)
  const baseDate = useMemo(() => {
    const first = avail[0]?.date;
    if (first) {
      const [y, m] = first.split("-").map(Number);
      return new Date(y, m - 1, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [avail]);

  const view = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthOffset, 1);
  const vy = view.getFullYear();
  const vm = view.getMonth();
  const startOffset = (new Date(vy, vm, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  async function pickDate(dateStr: string) {
    setSelected(dateStr);
    setOpen(false);
    setLoadingFlights(true);
    setFlights(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: originCode, destination: destinationCode, departDate: dateStr }),
      });
      const data = await res.json();
      setFlights(res.ok ? (data.flights as FlightResultDTO[]) : []);
    } catch {
      setFlights([]);
    } finally {
      setLoadingFlights(false);
    }
  }

  return (
    <div>
      {/* petit champ calendrier */}
      <div style={{ fontSize: 13, color: "#5c5c7a", marginBottom: 8, fontWeight: 600 }}>
        Dates de vols disponibles
      </div>
      <div style={{ position: "relative", maxWidth: 360 }}>
        <div
          onClick={() => setOpen((o) => !o)}
          style={{
            border: "1.5px solid #dcdae6",
            borderRadius: 12,
            padding: "13px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>📅</span>
          <span style={{ fontWeight: 600, color: selected ? "#1e1b4b" : "#8a8aa0", fontSize: 15 }}>
            {selected ? frLong(selected) : "Choisir une date de vol"}
          </span>
        </div>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 8,
              width: 320,
              maxWidth: "92vw",
              background: "#fff",
              border: "1.5px solid #1e1b4b",
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(20,10,60,0.18)",
              padding: 16,
              zIndex: 30,
            }}
          >
            {loadingAvail ? (
              <div style={{ fontSize: 14, color: "#8a8aa0", padding: 12 }}>
                Chargement des disponibilités…
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <NavBtn
                    label="‹"
                    disabled={monthOffset <= 0}
                    onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                  />
                  <div className="font-heading" style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>
                    {MONTHS_FR[vm]} {vy}
                  </div>
                  <NavBtn
                    label="›"
                    disabled={monthOffset >= 5}
                    onClick={() => setMonthOffset((o) => Math.min(5, o + 1))}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
                  {WEEKDAYS.map((w) => (
                    <div key={w} style={{ textAlign: "center", fontSize: 11, color: "#a0a0b4", fontWeight: 600 }}>
                      {w}
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                  {cells.map((d, i) => {
                    if (d === null) return <div key={i} />;
                    const key = `${vy}-${pad(vm + 1)}-${pad(d)}`;
                    const available = availMap.has(key);
                    const isSel = key === selected;
                    return (
                      <div
                        key={i}
                        onClick={() => available && pickDate(key)}
                        title={available ? formatPrice(availMap.get(key)!, "USD") : undefined}
                        style={{
                          position: "relative",
                          textAlign: "center",
                          padding: "8px 0 11px",
                          borderRadius: 8,
                          fontSize: 13,
                          cursor: available ? "pointer" : "default",
                          color: isSel ? "#fff" : available ? "#1e1b4b" : "#d4d2e0",
                          background: isSel ? accentColor : available ? "#f4f0fd" : "transparent",
                          fontWeight: available ? 700 : 500,
                        }}
                      >
                        {d}
                        {available && !isSel && (
                          <span
                            style={{
                              position: "absolute",
                              bottom: 4,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 4,
                              height: 4,
                              borderRadius: 999,
                              background: accentColor,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "#8a8aa0", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: accentColor, display: "inline-block" }} />
                  Jours avec vols disponibles
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* vols du jour choisi */}
      {selected && (
        <div style={{ marginTop: 22 }}>
          {loadingFlights ? (
            <div style={{ fontSize: 14, color: "#8a8aa0" }}>Recherche des vols…</div>
          ) : flights && flights.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 14, color: "#5c5c7a", fontWeight: 600 }}>
                {flights.length} vol{flights.length > 1 ? "s" : ""} le {frLong(selected)}
              </div>
              {flights.slice(0, 6).map((f) => (
                <FlightResultCard
                  key={f.id}
                  f={f}
                  accentColor={accentColor}
                  priceOverrideCents={kind === "promotion" ? promoPriceCents : null}
                  oldPriceCents={kind === "promotion" ? oldPriceCents : null}
                  promoBadge={promoBadge}
                  onSelect={() =>
                    router.push(
                      `/book?origin=${originCode}&destination=${destinationCode}&date=${selected}`,
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "#5c5c7a" }}>
              Aucun vol ce jour. Choisissez une autre date.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NavBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        border: "1.5px solid #dcdae6",
        background: "#fff",
        color: disabled ? "#d4d2e0" : "#3d1e8a",
        fontSize: 18,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
