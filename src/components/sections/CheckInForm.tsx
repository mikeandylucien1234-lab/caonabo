"use client";

import { useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";

interface BookingInfo {
  reference: string;
  status: string;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departAt: string;
  };
  passengers: { firstName: string; lastName: string; type: string }[];
}

export default function CheckInForm() {
  const [reference, setReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  const inputStyle: React.CSSProperties = {
    padding: "13px 16px",
    borderRadius: 12,
    border: "1.5px solid #dcdae6",
    fontSize: 15,
    color: "#1e1b4b",
    width: "100%",
  };

  async function lookup() {
    setError(null);
    setBooking(null);
    if (!reference || !lastName) {
      setError("Renseignez votre référence et votre nom de famille.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/bookings/lookup?reference=${encodeURIComponent(reference)}&lastName=${encodeURIComponent(lastName)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Introuvable");
      setBooking(data as BookingInfo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hz" style={{ padding: "40px 56px 100px" }}>
      <div
        style={{
          maxWidth: 620,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(30,27,75,0.08)",
          padding: "28px 30px",
        }}
      >
        <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 17, marginBottom: 18 }}>
          Retrouvez votre réservation
        </div>
        <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 6 }}>
              Référence (ex : CAO-XXXXX)
            </div>
            <input
              style={inputStyle}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="CAO-XXXXX"
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 6 }}>
              Nom de famille
            </div>
            <input
              style={inputStyle}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom du passager"
            />
          </div>
        </div>
        <button
          onClick={lookup}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#3d1e8a",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "13px 26px",
            borderRadius: 12,
            border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Recherche…" : "Effectuer le check-in"} 🧳
        </button>
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{error}</p>}

        {loading && <LoadingIndicator label="Recherche de votre réservation…" />}

        {booking && (
          <div
            style={{
              marginTop: 22,
              border: "1.5px solid #eceafa",
              borderRadius: 14,
              padding: 20,
              background: "#faf9fc",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800, color: "#0f0f2d", fontSize: 18 }}>
                {booking.flight.origin} → {booking.flight.destination}
              </div>
              <span
                style={{
                  background: "#e6f6ec",
                  color: "#1f9d55",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: 999,
                }}
              >
                ✓ {booking.status === "confirmed" ? "Enregistré" : booking.status}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 4 }}>
              Vol {booking.flight.flightNumber} ·{" "}
              {new Date(booking.flight.departAt).toLocaleString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div style={{ marginTop: 14, borderTop: "1px solid #e6e4ee", paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 8 }}>
                Passagers ({booking.passengers.length})
              </div>
              {booking.passengers.map((p, i) => (
                <div key={i} style={{ fontSize: 14, color: "#1e1b4b", marginBottom: 6 }}>
                  ✈ {p.firstName} {p.lastName}{" "}
                  <span style={{ color: "#8a8aa0", fontSize: 12 }}>({p.type})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
