"use client";

import { useState } from "react";
import type { CityDTO, FlightResultDTO } from "@/lib/data/types";
import { formatPrice } from "@/lib/currency";

interface PassengerForm {
  firstName: string;
  lastName: string;
  type: string;
}

export default function BookingFlow({ cities }: { cities: CityDTO[] }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [flights, setFlights] = useState<FlightResultDTO[] | null>(null);
  const [selected, setSelected] = useState<FlightResultDTO | null>(null);
  const [passengers, setPassengers] = useState<PassengerForm[]>([
    { firstName: "", lastName: "", type: "adult" },
  ]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1.5px solid #dcdae6",
    fontSize: 14,
    color: "#1e1b4b",
    width: "100%",
  };

  async function searchFlights() {
    setError(null);
    setFlights(null);
    setSelected(null);
    if (!origin || !destination) {
      setError("Choisissez une origine et une destination.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departDate: departDate ? isoToLoose(departDate) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de recherche");
      setFlights(data.flights as FlightResultDTO[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function confirmBooking() {
    setError(null);
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: selected.id,
          contactEmail: email,
          contactPhone: phone,
          passengers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de réservation");
      setReference(data.reference as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function updatePassenger(i: number, patch: Partial<PassengerForm>) {
    setPassengers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );
  }

  // écran de confirmation
  if (reference) {
    return (
      <div style={{ padding: "60px 56px 100px" }}>
        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            textAlign: "center",
            background: "#fff",
            border: "1px solid #eceafa",
            borderRadius: 24,
            padding: 48,
            boxShadow: "0 8px 30px rgba(20,10,60,0.10)",
          }}
        >
          <div style={{ fontSize: 46 }}>✅</div>
          <h2
            className="font-heading"
            style={{ fontSize: 28, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}
          >
            Réservation confirmée !
          </h2>
          <p style={{ color: "#5c5c7a", fontSize: 15 }}>
            Votre référence de réservation :
          </p>
          <div
            style={{
              display: "inline-block",
              margin: "12px 0 20px",
              background: "#f0ecfb",
              color: "#5b21b6",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 2,
              padding: "12px 24px",
              borderRadius: 12,
            }}
          >
            {reference}
          </div>
          <p style={{ color: "#7a7a92", fontSize: 13 }}>
            Un e-mail de confirmation a été envoyé à {email}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 56px 100px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* étape 1 : recherche */}
      <Card title="1 · Choisissez votre itinéraire">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, alignItems: "end" }}>
          <Field label="Depuis">
            <select style={inputStyle} value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option value="">Origine…</option>
              {cities.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.city} ({c.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vers">
            <select style={inputStyle} value={destination} onChange={(e) => setDestination(e.target.value)}>
              <option value="">Destination…</option>
              {cities.map((c) => (
                <option key={c.code} value={c.code} disabled={c.code === origin}>
                  {c.city} ({c.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date aller (optionnel)">
            <input type="date" style={inputStyle} value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
          </Field>
          <button onClick={searchFlights} disabled={loading} style={primaryBtn(loading)}>
            {loading ? "…" : "Rechercher"} 🔍
          </button>
        </div>
        {error && !flights && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{error}</p>}
      </Card>

      {/* étape 2 : sélection du vol */}
      {flights && (
        <Card title={`2 · Sélectionnez un vol (${flights.length})`}>
          {flights.length === 0 && (
            <p style={{ color: "#5c5c7a", fontSize: 14 }}>Aucun vol disponible pour cet itinéraire.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {flights.slice(0, 10).map((f) => {
              const isSel = selected?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelected(f)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: `1.5px solid ${isSel ? "#5b21b6" : "#f0eef7"}`,
                    background: isSel ? "#faf7ff" : "#fff",
                    borderRadius: 12,
                    padding: "14px 18px",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f0f2d", fontSize: 15 }}>
                      {f.origin.city} → {f.destination.city}
                    </div>
                    <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 2 }}>
                      {f.flightNumber} · {new Date(f.departAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {f.direct ? "Direct" : `${f.stops} escale`}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 18 }}>
                    {formatPrice(f.priceUsdCents, "USD")}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* étape 3 : passagers + contact */}
      {selected && (
        <Card title="3 · Passagers et contact">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {passengers.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 12 }}>
                <input placeholder="Prénom" style={inputStyle} value={p.firstName} onChange={(e) => updatePassenger(i, { firstName: e.target.value })} />
                <input placeholder="Nom" style={inputStyle} value={p.lastName} onChange={(e) => updatePassenger(i, { lastName: e.target.value })} />
                <select style={inputStyle} value={p.type} onChange={(e) => updatePassenger(i, { type: e.target.value })}>
                  <option value="adult">Adulte</option>
                  <option value="child">Enfant</option>
                  <option value="infant">Bébé</option>
                </select>
              </div>
            ))}
            <button
              onClick={() => setPassengers((prev) => [...prev, { firstName: "", lastName: "", type: "adult" }])}
              style={{ alignSelf: "flex-start", background: "#f0ecfb", color: "#3d1e8a", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              + Ajouter un passager
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Email de contact" type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
              <input placeholder="Téléphone (optionnel)" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <div style={{ fontSize: 15, color: "#1e1b4b" }}>
                Total :{" "}
                <span style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 20 }}>
                  {formatPrice(selected.priceUsdCents * passengers.length, "USD")}
                </span>
              </div>
              <button onClick={confirmBooking} disabled={loading} style={primaryBtn(loading)}>
                {loading ? "Confirmation…" : "Confirmer la réservation"} →
              </button>
            </div>
            {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
          </div>
        </Card>
      )}
    </div>
  );
}

function isoToLoose(iso: string): string {
  // "2026-08-15" → "2026-8-15" (format attendu par l'API calendrier)
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return `${y}-${m}-${d}`;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(30,27,75,0.08)", padding: "24px 28px" }}>
      <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 17, marginBottom: 18 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function primaryBtn(loading: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#3d1e8a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    padding: "13px 24px",
    borderRadius: 12,
    border: "none",
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
    whiteSpace: "nowrap",
  };
}
