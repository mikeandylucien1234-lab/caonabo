"use client";

import { useState } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import { withMinDelay } from "@/lib/minDelay";

interface PassengerRow {
  id: string;
  civility: string;
  firstName: string;
  lastName: string;
  type: string;
  seatLabel: string | null;
  seatId: string | null;
  checkedIn: boolean;
  hasBoardingPass: boolean;
}
interface BookingInfo {
  reference: string;
  status: string;
  paymentStatus: string;
  cabinClass: string;
  checkIn: {
    canCheckIn: boolean;
    blockReason: string | null;
    windowState: "too-early" | "open" | "too-late";
    opensAt: string;
    closesAt: string;
    boardingAt: string;
  };
  flight: {
    flightNumber: string;
    origin: string;
    originCode: string;
    destination: string;
    destinationCode: string;
    departAt: string;
    arriveAt: string;
    terminal: string;
    gate: string | null;
  };
  passengers: PassengerRow[];
}

const civ = (c: string) => (c === "MME" ? "Mme" : c === "MLLE" ? "Mlle" : "M.");
const fmtDT = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

const inputStyle: React.CSSProperties = {
  padding: "13px 16px",
  borderRadius: 12,
  border: "1.5px solid #dcdae6",
  fontSize: 15,
  color: "#1e1b4b",
  width: "100%",
};

export default function CheckInForm() {
  const [reference, setReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null); // passengerId | "all" | null

  async function lookup() {
    setError(null);
    setBooking(null);
    if (!reference || !lastName) {
      setError("Renseignez votre référence et votre nom de famille.");
      return;
    }
    setLoading(true);
    try {
      const { res, data } = await withMinDelay(
        (async () => {
          const res = await fetch(
            `/api/bookings/lookup?reference=${encodeURIComponent(reference)}&lastName=${encodeURIComponent(lastName)}`,
          );
          const data = await res.json();
          return { res, data };
        })(),
      );
      if (!res.ok) throw new Error(data.error ?? "Introuvable");
      setBooking(data as BookingInfo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function doCheckIn(passengerIds?: string[]) {
    if (!booking) return;
    setError(null);
    setCheckingIn(passengerIds ? passengerIds[0] : "all");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: booking.reference, lastName, passengerIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec du check-in.");
      await lookup();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setCheckingIn(null);
    }
  }

  function boardingPassHref(passengerId: string): string {
    const params = new URLSearchParams({ reference: booking!.reference, lastName, passengerId });
    return `/api/checkin/boarding-pass?${params.toString()}`;
  }

  const someUnchecked = booking?.passengers.some((p) => !p.checkedIn) ?? false;
  const allChecked = booking ? booking.passengers.every((p) => p.checkedIn) : false;

  return (
    <div className="hz" style={{ padding: "40px 56px 100px" }}>
      <div
        style={{
          maxWidth: 720,
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
          {loading ? "Recherche…" : "Rechercher ma réservation"} 🧳
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 800, color: "#0f0f2d", fontSize: 18 }}>
                {booking.flight.origin} ({booking.flight.originCode}) → {booking.flight.destination} ({booking.flight.destinationCode})
              </div>
              <span
                style={{
                  background: allChecked ? "#e6f6ec" : "#f0ecfb",
                  color: allChecked ? "#1f9d55" : "#5b21b6",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "5px 12px",
                  borderRadius: 999,
                }}
              >
                {allChecked ? "✓ Check-in complet" : "Réf. " + booking.reference}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 4 }}>
              Vol {booking.flight.flightNumber} · {fmtDT(booking.flight.departAt)} · Terminal {booking.flight.terminal}
              {booking.flight.gate ? ` · Porte ${booking.flight.gate}` : ""}
            </div>

            {/* état de la fenêtre de check-in */}
            {!booking.checkIn.canCheckIn ? (
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: booking.checkIn.windowState === "too-early" ? "#eef4ff" : "#fdecec",
                  color: booking.checkIn.windowState === "too-early" ? "#2952a3" : "#b23333",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                }}
              >
                {booking.checkIn.windowState === "too-early" ? "🕒 " : "⚠️ "}
                {booking.checkIn.blockReason}
              </div>
            ) : (
              <>
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#eefaf0",
                    color: "#1f7a3d",
                    fontSize: 13,
                  }}
                >
                  ✓ Check-in ouvert — embarquement à {new Date(booking.checkIn.boardingAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </div>

                {someUnchecked && booking.passengers.length > 1 && (
                  <button
                    onClick={() => doCheckIn()}
                    disabled={checkingIn !== null}
                    style={{
                      marginTop: 14,
                      background: "#3d1e8a",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      padding: "11px 20px",
                      borderRadius: 10,
                      border: "none",
                      cursor: checkingIn !== null ? "wait" : "pointer",
                      opacity: checkingIn !== null ? 0.7 : 1,
                    }}
                  >
                    {checkingIn === "all" ? "Enregistrement…" : "Check-in de tous les passagers"}
                  </button>
                )}
              </>
            )}

            <div style={{ marginTop: 18, borderTop: "1px solid #e6e4ee", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, color: "#5c5c7a" }}>
                Passagers ({booking.passengers.length})
              </div>
              {booking.passengers.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                    background: "#fff",
                    border: "1px solid #eceafa",
                    borderRadius: 12,
                    padding: "12px 16px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 14.5 }}>
                      ✈ {civ(p.civility)} {p.firstName} {p.lastName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#8a8aa0", marginTop: 2 }}>
                      Siège {p.seatLabel ?? "non attribué"} · {p.type === "adult" ? "Adulte" : p.type === "child" ? "Enfant" : "Bébé"}
                    </div>
                  </div>
                  {p.checkedIn ? (
                    <a
                      href={boardingPassHref(p.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#1f9d55",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        padding: "9px 16px",
                        borderRadius: 10,
                        textDecoration: "none",
                      }}
                    >
                      📄 Télécharger ma carte d&apos;embarquement
                    </a>
                  ) : booking.checkIn.canCheckIn ? (
                    <button
                      onClick={() => doCheckIn([p.id])}
                      disabled={checkingIn !== null}
                      style={{
                        background: "#fff",
                        color: "#3d1e8a",
                        fontWeight: 700,
                        fontSize: 13,
                        padding: "9px 16px",
                        borderRadius: 10,
                        border: "1.5px solid #3d1e8a",
                        cursor: checkingIn !== null ? "wait" : "pointer",
                        opacity: checkingIn !== null ? 0.7 : 1,
                      }}
                    >
                      {checkingIn === p.id ? "Enregistrement…" : "Confirmer le check-in"}
                    </button>
                  ) : (
                    <span style={{ fontSize: 12.5, color: "#b0aec0" }}>Check-in non disponible</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
