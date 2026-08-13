"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BaggageOptionDTO,
  CityDTO,
  FlightResultDTO,
  SeatDTO,
} from "@/lib/data/types";
import { formatPrice } from "@/lib/currency";
import FlightResultCard from "@/components/sections/FlightResultCard";

// ─────────────────────────────────────────────────────────────────────────────
// Tunnel de réservation en 5 étapes
//   1 Recherche · 2 Vol · 3 Passagers · 4 Options (bagages + sièges) · 5 Paiement
// Le prix est TOUJOURS recalculé côté serveur (/api/bookings/price-preview) ;
// le paiement à l'étape 5 est entièrement simulé (aucune vraie transaction).
// ─────────────────────────────────────────────────────────────────────────────

interface PaxForm {
  civility: string;
  firstName: string;
  lastName: string;
  type: string;
  birthDate: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  documentExpiry: string;
  documentIssuingCountry: string;
  phone: string;
  seatId: string | null;
  baggageOptionId: string | null;
}

interface Breakdown {
  basePriceCents: number;
  baggageTotalCents: number;
  seatTotalCents: number;
  taxesCents: number;
  milesRedeemed: number;
  totalUsdCents: number;
  milesEarned: number;
}

const STEPS = ["Recherche", "Vol", "Passagers", "Options", "Paiement"];

const PURPLE = "#3d1e8a";
const PURPLE2 = "#5b21b6";

function emptyPax(): PaxForm {
  return {
    civility: "M",
    firstName: "",
    lastName: "",
    type: "adult",
    birthDate: "",
    nationality: "",
    documentType: "PASSPORT",
    documentNumber: "",
    documentExpiry: "",
    documentIssuingCountry: "",
    phone: "",
    seatId: null,
    baggageOptionId: null,
  };
}

export default function BookingFlow({
  cities,
  milesBalance = null,
  initialOrigin = null,
  initialDestination = null,
  initialDate = null,
}: {
  cities: CityDTO[];
  milesBalance?: number | null;
  initialOrigin?: string | null;
  initialDestination?: string | null;
  initialDate?: string | null;
}) {
  const [step, setStep] = useState(1);

  // étape 1
  const [origin, setOrigin] = useState(initialOrigin ?? "");
  const [destination, setDestination] = useState(initialDestination ?? "");
  const [tripType, setTripType] = useState("aller-retour");
  const [departDate, setDepartDate] = useState(initialDate ?? "");
  const [returnDate, setReturnDate] = useState("");
  const [paxCount, setPaxCount] = useState(1);

  // étape 2
  const [flights, setFlights] = useState<FlightResultDTO[] | null>(null);
  const [selected, setSelected] = useState<FlightResultDTO | null>(null);

  // étape 3
  const [passengers, setPassengers] = useState<PaxForm[]>([emptyPax()]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // étape 4
  const [seats, setSeats] = useState<SeatDTO[] | null>(null);
  const [baggage, setBaggage] = useState<BaggageOptionDTO[]>([]);
  const [activePax, setActivePax] = useState(0);

  // étape 5
  const [useMiles, setUseMiles] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  // transverse
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [confirmInfo, setConfirmInfo] = useState<{
    milesEarned: number | null;
    payment: string | null;
  } | null>(null);
  const autoRef = useRef(false);
  const isLoggedIn = milesBalance !== null;

  // ── chargement des options de bagage (une fois) ────────────────────────────
  useEffect(() => {
    fetch("/api/baggage-options")
      .then((r) => r.json())
      .then((d) => setBaggage(d.options as BaggageOptionDTO[]))
      .catch(() => {});
  }, []);

  // ── ajuste le nombre de fiches passagers au compteur de l'étape 1 ───────────
  useEffect(() => {
    setPassengers((prev) => {
      if (paxCount === prev.length) return prev;
      if (paxCount > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: paxCount - prev.length }, emptyPax),
        ];
      }
      return prev.slice(0, paxCount);
    });
    setActivePax((a) => Math.min(a, paxCount - 1));
  }, [paxCount]);

  const searchFlights = useCallback(async () => {
    setError(null);
    setFlights(null);
    setSelected(null);
    if (!origin || !destination) {
      setError("Choisissez une origine et une destination.");
      return;
    }
    if (origin === destination) {
      setError("L'origine et la destination doivent être différentes.");
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
          tripType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de recherche");
      setFlights(data.flights as FlightResultDTO[]);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [origin, destination, departDate, tripType]);

  // pré-remplissage depuis une offre : recherche auto
  useEffect(() => {
    if (autoRef.current) return;
    if (initialOrigin && initialDestination) {
      autoRef.current = true;
      searchFlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectFlight(f: FlightResultDTO) {
    setSelected(f);
    setSeats(null);
    // charge le plan de cabine
    try {
      const res = await fetch(`/api/flights/${f.id}/seats`);
      const data = await res.json();
      setSeats(data.seats as SeatDTO[]);
    } catch {
      setSeats([]);
    }
  }

  // ── recalcul du prix côté serveur (étapes 4 et 5) ───────────────────────────
  const priceKey = selected
    ? JSON.stringify({
        f: selected.id,
        p: passengers.map((p) => [p.seatId, p.baggageOptionId]),
        m: useMiles,
      })
    : "";
  useEffect(() => {
    if (!selected || step < 4) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/bookings/price-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flightId: selected.id,
            passengers: passengers.map((p) => ({
              seatId: p.seatId,
              baggageOptionId: p.baggageOptionId,
            })),
            useMiles: useMiles && milesBalance ? milesBalance : 0,
          }),
        });
        const data = await res.json();
        if (!cancelled && res.ok) setBreakdown(data as Breakdown);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey, step]);

  function updatePax(i: number, patch: Partial<PaxForm>) {
    setPassengers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    );
  }

  // assignation d'un siège au passager actif (toggle)
  function toggleSeat(seat: SeatDTO) {
    if (!seat.isAvailable) return;
    setPassengers((prev) => {
      // si déjà pris par un autre passager → ignore
      const takenByOther = prev.some(
        (p, idx) => idx !== activePax && p.seatId === seat.id,
      );
      if (takenByOther) return prev;
      return prev.map((p, idx) => {
        if (idx !== activePax) return p;
        return { ...p, seatId: p.seatId === seat.id ? null : seat.id };
      });
    });
  }

  // ── validation par étape ────────────────────────────────────────────────────
  function canProceed(): boolean {
    if (step === 1) return Boolean(origin && destination && origin !== destination);
    if (step === 2) return Boolean(selected);
    if (step === 3) {
      const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      const paxOk = passengers.every(
        (p) => p.firstName.trim() && p.lastName.trim() && p.documentNumber.trim(),
      );
      return emailOk && paxOk;
    }
    if (step === 4) return true; // sièges/bagages optionnels
    return true;
  }

  function next() {
    setError(null);
    if (step === 1) {
      searchFlights();
      return;
    }
    if (!canProceed()) {
      setError("Complétez les champs requis avant de continuer.");
      return;
    }
    setStep((s) => Math.min(5, s + 1));
  }
  function prev() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function confirmBooking() {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightId: selected.id,
          tripType,
          cabinClass: "Économique",
          contactEmail: email,
          contactPhone: phone,
          useMiles: useMiles && milesBalance ? milesBalance : 0,
          paymentMethod,
          cardLast4: cardNumber.replace(/\D/g, "").slice(-4),
          passengers: passengers.map((p) => ({
            civility: p.civility,
            firstName: p.firstName,
            lastName: p.lastName,
            type: p.type,
            birthDate: p.birthDate || null,
            nationality: p.nationality || null,
            documentType: p.documentType || null,
            documentNumber: p.documentNumber || null,
            documentExpiry: p.documentExpiry || null,
            documentIssuingCountry: p.documentIssuingCountry || null,
            phone: p.phone || null,
            seatId: p.seatId,
            baggageOptionId: p.baggageOptionId,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de réservation");
      setReference(data.reference as string);
      setConfirmInfo({
        milesEarned: typeof data.milesEarned === "number" ? data.milesEarned : null,
        payment: data.paymentMethodDisplay ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  // ── écran de confirmation ────────────────────────────────────────────────────
  if (reference) {
    return (
      <div className="hz" style={{ padding: "60px 56px 100px" }}>
        <div style={confirmCard}>
          <div style={{ fontSize: 46 }}>✅</div>
          <h2
            className="font-heading"
            style={{ fontSize: 28, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}
          >
            Réservation confirmée !
          </h2>
          <p style={{ color: "#5c5c7a", fontSize: 15 }}>Votre référence de réservation :</p>
          <div style={refBadge}>{reference}</div>
          <p style={{ color: "#7a7a92", fontSize: 13 }}>
            Un e-mail de confirmation a été envoyé à {email}.
          </p>
          {confirmInfo?.payment && (
            <p style={{ color: "#7a7a92", fontSize: 13, marginTop: 4 }}>
              Paiement : {confirmInfo.payment} <i>(simulé)</i>
            </p>
          )}
          {confirmInfo?.milesEarned != null && (
            <div style={milesBadge}>✦ +{confirmInfo.milesEarned} Miles Caonabo crédités</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="hz" style={{ padding: "28px 56px 100px", display: "flex", flexDirection: "column", gap: 22 }}>
      <Stepper current={step} />

      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 6px 26px rgba(30,27,75,0.09)", padding: "26px 30px" }}>
        {step === 1 && (
          <Step1
            cities={cities}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            tripType={tripType}
            setTripType={setTripType}
            departDate={departDate}
            setDepartDate={setDepartDate}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            paxCount={paxCount}
            setPaxCount={setPaxCount}
          />
        )}

        {step === 2 && (
          <Step2 flights={flights} selected={selected} onSelect={selectFlight} />
        )}

        {step === 3 && (
          <Step3
            passengers={passengers}
            updatePax={updatePax}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
          />
        )}

        {step === 4 && (
          <Step4
            passengers={passengers}
            activePax={activePax}
            setActivePax={setActivePax}
            baggage={baggage}
            updatePax={updatePax}
            seats={seats}
            toggleSeat={toggleSeat}
            breakdown={breakdown}
          />
        )}

        {step === 5 && (
          <Step5
            selected={selected!}
            passengers={passengers}
            seats={seats}
            baggage={baggage}
            breakdown={breakdown}
            email={email}
            isLoggedIn={isLoggedIn}
            milesBalance={milesBalance}
            useMiles={useMiles}
            setUseMiles={setUseMiles}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cardName={cardName}
            setCardName={setCardName}
            cardNumber={cardNumber}
            setCardNumber={setCardNumber}
          />
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 16 }}>{error}</p>}
      </div>

      {/* navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <button onClick={prev} disabled={step === 1 || loading} style={ghostBtn(step === 1 || loading)}>
          ← Précédent
        </button>
        {step < 5 ? (
          <button onClick={next} disabled={loading} style={primaryBtn(loading)}>
            {loading && step === 1 ? "Recherche…" : "Suivant"} →
          </button>
        ) : (
          <button onClick={confirmBooking} disabled={loading} style={primaryBtn(loading)}>
            {loading ? "Confirmation…" : "Payer et confirmer"} →
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEPPER
// ═══════════════════════════════════════════════════════════════════════════
function Stepper({ current }: { current: number }) {
  return (
    <div className="bk-stepper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  background: done || active ? PURPLE : "#eee9f8",
                  color: done || active ? "#fff" : "#9a94b5",
                  border: active ? `3px solid #cbb8f2` : "3px solid transparent",
                  transition: "all .2s",
                }}
              >
                {done ? "✓" : n}
              </div>
              <span
                className="bk-step-label"
                style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? PURPLE : "#9a94b5", whiteSpace: "nowrap" }}
              >
                {label}
              </span>
            </div>
            {n < STEPS.length && (
              <div style={{ flex: 1, height: 2, background: done ? PURPLE : "#eee9f8", margin: "0 4px", marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 1 — RECHERCHE
// ═══════════════════════════════════════════════════════════════════════════
function Step1(props: {
  cities: CityDTO[];
  origin: string;
  setOrigin: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  tripType: string;
  setTripType: (v: string) => void;
  departDate: string;
  setDepartDate: (v: string) => void;
  returnDate: string;
  setReturnDate: (v: string) => void;
  paxCount: number;
  setPaxCount: (v: number) => void;
}) {
  const { cities } = props;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle>1 · Votre itinéraire</SectionTitle>
      <div style={{ display: "flex", gap: 10 }}>
        {["aller-retour", "aller-simple"].map((t) => (
          <button
            key={t}
            onClick={() => props.setTripType(t)}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: `1.5px solid ${props.tripType === t ? PURPLE2 : "#dcdae6"}`,
              background: props.tripType === t ? "#f4efff" : "#fff",
              color: props.tripType === t ? PURPLE : "#5c5c7a",
            }}
          >
            {t === "aller-retour" ? "Aller-retour" : "Aller simple"}
          </button>
        ))}
      </div>
      <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Depuis">
          <select style={inputStyle} value={props.origin} onChange={(e) => props.setOrigin(e.target.value)}>
            <option value="">Origine…</option>
            {cities.map((c) => (
              <option key={c.code} value={c.code}>
                {c.city} ({c.code})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vers">
          <select style={inputStyle} value={props.destination} onChange={(e) => props.setDestination(e.target.value)}>
            <option value="">Destination…</option>
            {cities.map((c) => (
              <option key={c.code} value={c.code} disabled={c.code === props.origin}>
                {c.city} ({c.code})
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: props.tripType === "aller-retour" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 14 }}>
        <Field label="Date aller">
          <input type="date" style={inputStyle} value={props.departDate} onChange={(e) => props.setDepartDate(e.target.value)} />
        </Field>
        {props.tripType === "aller-retour" && (
          <Field label="Date retour">
            <input type="date" style={inputStyle} value={props.returnDate} onChange={(e) => props.setReturnDate(e.target.value)} />
          </Field>
        )}
        <Field label="Passagers">
          <select style={inputStyle} value={props.paxCount} onChange={(e) => props.setPaxCount(parseInt(e.target.value, 10))}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} passager{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 2 — SÉLECTION DU VOL
// ═══════════════════════════════════════════════════════════════════════════
function Step2({
  flights,
  selected,
  onSelect,
}: {
  flights: FlightResultDTO[] | null;
  selected: FlightResultDTO | null;
  onSelect: (f: FlightResultDTO) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle>2 · Choisissez votre vol{flights ? ` (${flights.length})` : ""}</SectionTitle>
      {flights && flights.length === 0 && (
        <p style={{ color: "#5c5c7a", fontSize: 14 }}>Aucun vol disponible pour cet itinéraire.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {flights?.slice(0, 12).map((f) => (
          <FlightResultCard key={f.id} f={f} selected={selected?.id === f.id} onSelect={() => onSelect(f)} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 3 — PASSAGERS + DOCUMENTS
// ═══════════════════════════════════════════════════════════════════════════
function Step3({
  passengers,
  updatePax,
  email,
  setEmail,
  phone,
  setPhone,
}: {
  passengers: PaxForm[];
  updatePax: (i: number, patch: Partial<PaxForm>) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle>3 · Passagers et documents</SectionTitle>
      {passengers.map((p, i) => (
        <div key={i} style={{ border: "1px solid #eceafa", borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontWeight: 700, color: PURPLE, fontSize: 14, marginBottom: 14 }}>
            Passager {i + 1}
          </div>
          <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Civilité *">
              <select style={inputStyle} value={p.civility} onChange={(e) => updatePax(i, { civility: e.target.value })}>
                <option value="M">M.</option>
                <option value="MME">Mme</option>
                <option value="MLLE">Mlle</option>
              </select>
            </Field>
            <Field label="Prénom *">
              <input style={inputStyle} value={p.firstName} onChange={(e) => updatePax(i, { firstName: e.target.value })} />
            </Field>
            <Field label="Nom *">
              <input style={inputStyle} value={p.lastName} onChange={(e) => updatePax(i, { lastName: e.target.value })} />
            </Field>
          </div>
          <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Type de passager">
              <select style={inputStyle} value={p.type} onChange={(e) => updatePax(i, { type: e.target.value })}>
                <option value="adult">Adulte</option>
                <option value="child">Enfant</option>
                <option value="infant">Bébé</option>
              </select>
            </Field>
            <Field label="Date de naissance">
              <input type="date" style={inputStyle} value={p.birthDate} onChange={(e) => updatePax(i, { birthDate: e.target.value })} />
            </Field>
            <Field label="Nationalité">
              <input style={inputStyle} value={p.nationality} placeholder="ex : Haïti" onChange={(e) => updatePax(i, { nationality: e.target.value })} />
            </Field>
          </div>
          <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Type de document">
              <select style={inputStyle} value={p.documentType} onChange={(e) => updatePax(i, { documentType: e.target.value })}>
                <option value="PASSPORT">Passeport</option>
                <option value="ID_CARD">Carte d'identité</option>
              </select>
            </Field>
            <Field label="N° de document *">
              <input style={inputStyle} value={p.documentNumber} onChange={(e) => updatePax(i, { documentNumber: e.target.value })} />
            </Field>
            <Field label="Expiration">
              <input type="date" style={inputStyle} value={p.documentExpiry} onChange={(e) => updatePax(i, { documentExpiry: e.target.value })} />
            </Field>
          </div>
          <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Pays d'émission">
              <input style={inputStyle} value={p.documentIssuingCountry} placeholder="ex : Haïti" onChange={(e) => updatePax(i, { documentIssuingCountry: e.target.value })} />
            </Field>
            <Field label="Téléphone du passager">
              <input style={inputStyle} value={p.phone} onChange={(e) => updatePax(i, { phone: e.target.value })} />
            </Field>
          </div>
        </div>
      ))}

      <div style={{ border: "1px solid #eceafa", borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ fontWeight: 700, color: PURPLE, fontSize: 14, marginBottom: 14 }}>Coordonnées de contact</div>
        <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Email de contact *">
            <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Téléphone de contact">
            <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 4 — BAGAGES + PLAN DE SIÈGES
// ═══════════════════════════════════════════════════════════════════════════
function Step4({
  passengers,
  activePax,
  setActivePax,
  baggage,
  updatePax,
  seats,
  toggleSeat,
  breakdown,
}: {
  passengers: PaxForm[];
  activePax: number;
  setActivePax: (i: number) => void;
  baggage: BaggageOptionDTO[];
  updatePax: (i: number, patch: Partial<PaxForm>) => void;
  seats: SeatDTO[] | null;
  toggleSeat: (s: SeatDTO) => void;
  breakdown: Breakdown | null;
}) {
  const pax = passengers[activePax];
  // sièges pris par un AUTRE passager (indispo pour l'actif)
  const takenByOthers = new Set(
    passengers.filter((_, idx) => idx !== activePax).map((p) => p.seatId).filter(Boolean) as string[],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle>4 · Bagages et sièges</SectionTitle>

      {/* onglets passagers */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {passengers.map((p, i) => (
          <button
            key={i}
            onClick={() => setActivePax(i)}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: `1.5px solid ${i === activePax ? PURPLE2 : "#dcdae6"}`,
              background: i === activePax ? "#f4efff" : "#fff",
              color: i === activePax ? PURPLE : "#5c5c7a",
            }}
          >
            {p.firstName || `Passager ${i + 1}`}
            {p.seatId ? ` · ${seatLabel(seats, p.seatId)}` : ""}
          </button>
        ))}
      </div>

      <div className="bk-options" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 24 }}>
        {/* bagages */}
        <div>
          <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15, marginBottom: 12 }}>Bagage en soute</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {baggage.map((b) => {
              const active = pax?.baggageOptionId === b.id || (b.priceCents === 0 && !pax?.baggageOptionId);
              return (
                <label
                  key={b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `1.5px solid ${active ? PURPLE2 : "#eceafa"}`,
                    background: active ? "#faf7ff" : "#fff",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="radio"
                      name={`bag-${activePax}`}
                      checked={active}
                      onChange={() => updatePax(activePax, { baggageOptionId: b.priceCents === 0 ? null : b.id })}
                      style={{ accentColor: PURPLE2, width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 14, color: "#1e1b4b", fontWeight: 600 }}>{b.label}</span>
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: b.priceCents ? PURPLE : "#1f9d55" }}>
                    {b.priceCents ? `+ ${formatPrice(b.priceCents, "USD")}` : "Inclus"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* plan de sièges */}
        <div>
          <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15, marginBottom: 12 }}>
            Siège {pax?.firstName ? `de ${pax.firstName}` : `du passager ${activePax + 1}`}
          </div>
          <SeatMap
            seats={seats}
            selectedSeatId={pax?.seatId ?? null}
            takenByOthers={takenByOthers}
            onToggle={toggleSeat}
          />
        </div>
      </div>

      {breakdown && (
        <div style={{ borderTop: "1px solid #eceafa", paddingTop: 14, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, color: "#5c5c7a" }}>Total provisoire :</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: PURPLE }}>{formatPrice(breakdown.totalUsdCents, "USD")}</span>
        </div>
      )}
    </div>
  );
}

function SeatMap({
  seats,
  selectedSeatId,
  takenByOthers,
  onToggle,
}: {
  seats: SeatDTO[] | null;
  selectedSeatId: string | null;
  takenByOthers: Set<string>;
  onToggle: (s: SeatDTO) => void;
}) {
  if (!seats) return <p style={{ fontSize: 13, color: "#8a8aa0" }}>Chargement du plan de cabine…</p>;
  // regroupe par rangée
  const rows = new Map<number, SeatDTO[]>();
  for (const s of seats) {
    if (!rows.has(s.row)) rows.set(s.row, []);
    rows.get(s.row)!.push(s);
  }
  const rowNums = [...rows.keys()].sort((a, b) => a - b);
  const cols = ["A", "B", "C", "D", "E", "F"];

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12, fontSize: 11.5, color: "#7a7a92" }}>
        <Legend color="#fff" border="#c9b8ef" label="Libre" />
        <Legend color={PURPLE2} border={PURPLE2} label="Choisi" />
        <Legend color="#e7e3f0" border="#d8d3e6" label="Occupé" />
        <Legend color="#fff7e6" border="#f0d79a" label="Premium/Business" />
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto", border: "1px solid #eceafa", borderRadius: 12, padding: 12, background: "#fbfaff" }}>
        {/* en-tête colonnes */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
          {cols.map((c, idx) => (
            <span key={c} style={{ width: 30, textAlign: "center", fontSize: 11, color: "#9a94b5", fontWeight: 700, marginRight: idx === 2 ? 16 : 0 }}>
              {c}
            </span>
          ))}
        </div>
        {rowNums.map((rn) => {
          const rowSeats = rows.get(rn)!;
          const byCol = new Map(rowSeats.map((s) => [s.column, s]));
          return (
            <div key={rn} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ width: 20, fontSize: 10, color: "#b4afca", textAlign: "right", marginRight: 4 }}>{rn}</span>
              {cols.map((c, idx) => {
                const s = byCol.get(c);
                if (!s) return <span key={c} style={{ width: 30 }} />;
                const isSel = s.id === selectedSeatId;
                const takenOther = takenByOthers.has(s.id);
                const occupied = !s.isAvailable || takenOther;
                const premium = s.fareClass !== "Économique";
                let bg = "#fff", bd = "#c9b8ef", col = "#5c5c7a";
                if (occupied) { bg = "#e7e3f0"; bd = "#d8d3e6"; col = "#b4afca"; }
                else if (isSel) { bg = PURPLE2; bd = PURPLE2; col = "#fff"; }
                else if (premium) { bg = "#fff7e6"; bd = "#f0d79a"; col = "#a9820f"; }
                return (
                  <button
                    key={c}
                    onClick={() => onToggle(s)}
                    disabled={occupied}
                    title={`${rn}${c} · ${s.fareClass}${s.priceSupplementCents ? ` · +${formatPrice(s.priceSupplementCents, "USD")}` : ""}`}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      border: `1.5px solid ${bd}`,
                      background: bg,
                      color: col,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: occupied ? "not-allowed" : "pointer",
                      marginRight: idx === 2 ? 16 : 0,
                      padding: 0,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: color, border: `1.5px solid ${border}` }} />
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ÉTAPE 5 — RÉCAPITULATIF + PAIEMENT SIMULÉ
// ═══════════════════════════════════════════════════════════════════════════
function Step5(props: {
  selected: FlightResultDTO;
  passengers: PaxForm[];
  seats: SeatDTO[] | null;
  baggage: BaggageOptionDTO[];
  breakdown: Breakdown | null;
  email: string;
  isLoggedIn: boolean;
  milesBalance: number | null;
  useMiles: boolean;
  setUseMiles: (v: boolean) => void;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  cardName: string;
  setCardName: (v: string) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
}) {
  const { selected: f, passengers, seats, baggage, breakdown: b } = props;
  const dep = new Date(f.departAt);
  const bagLabel = (id: string | null) => baggage.find((x) => x.id === id)?.label ?? "Aucun bagage en soute";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionTitle>5 · Récapitulatif et paiement</SectionTitle>

      <div className="bk-options" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        {/* récap */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ border: "1px solid #eceafa", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 16 }}>
              {f.origin.city} → {f.destination.city}
            </div>
            <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 4 }}>
              {fmtDate(dep)} · {fmtTime(dep)} · {f.direct ? "Direct" : `${f.stops} escale`} · {fmtDur(f.durationMinutes)}
            </div>
            <div style={{ fontSize: 12, color: "#9a94b5", marginTop: 2 }}>
              Vol {f.flightNumber} · opéré par {f.operatedBy}
            </div>
          </div>

          <div style={{ border: "1px solid #eceafa", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, color: PURPLE, fontSize: 14, marginBottom: 10 }}>Passagers</div>
            {passengers.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4b4b63", padding: "5px 0", borderTop: i ? "1px solid #f2f0fa" : "none" }}>
                <span>
                  {civ(p.civility)} {p.firstName} {p.lastName}
                </span>
                <span style={{ color: "#8a8aa0" }}>
                  {p.seatId ? seatLabel(seats, p.seatId) : "Siège auto"} · {bagLabel(p.baggageOptionId)}
                </span>
              </div>
            ))}
          </div>

          {/* détail des prix */}
          <div style={{ border: "1px solid #eceafa", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontWeight: 700, color: PURPLE, fontSize: 14, marginBottom: 10 }}>Détail du prix</div>
            {b ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5 }}>
                <Line label={`Tarif vol (${passengers.length} pax)`} value={formatPrice(b.basePriceCents, "USD")} />
                {b.baggageTotalCents > 0 && <Line label="Bagages" value={formatPrice(b.baggageTotalCents, "USD")} />}
                {b.seatTotalCents > 0 && <Line label="Sièges" value={formatPrice(b.seatTotalCents, "USD")} />}
                <Line label="Taxes & frais" value={formatPrice(b.taxesCents, "USD")} />
                {b.milesRedeemed > 0 && <Line label="Remise Miles Caonabo" value={`− ${formatPrice(b.milesRedeemed, "USD")}`} green />}
                <div style={{ borderTop: "1px solid #eceafa", marginTop: 6, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15 }}>Total</span>
                  <span style={{ fontWeight: 800, color: PURPLE, fontSize: 22 }}>{formatPrice(b.totalUsdCents, "USD")}</span>
                </div>
                {b.milesEarned > 0 && (
                  <div style={{ fontSize: 12, color: "#1f9d55", textAlign: "right" }}>✦ +{b.milesEarned} Miles gagnés</div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#8a8aa0" }}>Calcul du prix…</p>
            )}
          </div>
        </div>

        {/* paiement simulé */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#fff7e6", border: "1px solid #f0d79a", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: "#a9820f" }}>
            🔒 Paiement <b>simulé</b> à des fins de démonstration — aucune vraie transaction, aucune carte réelle.
          </div>

          {props.isLoggedIn && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#f7f4fe",
                border: "1.5px solid #e4dbfb",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: props.milesBalance! > 0 ? "pointer" : "default",
              }}
            >
              <input
                type="checkbox"
                checked={props.useMiles}
                disabled={props.milesBalance! <= 0}
                onChange={(e) => props.setUseMiles(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: PURPLE2 }}
              />
              <div style={{ fontSize: 13.5, color: "#1e1b4b" }}>
                <b>Utiliser mes Miles Caonabo</b>{" "}
                <span style={{ color: "#8a8aa0" }}>({props.milesBalance!.toLocaleString("fr-FR")} dispo)</span>
              </div>
            </label>
          )}

          <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 14 }}>Mode de paiement</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "card", label: "Carte bancaire", icon: "💳" },
              { id: "paypal", label: "PayPal", icon: "🅿️" },
              { id: "miles-only", label: "Miles Caonabo uniquement", icon: "✦" },
            ].map((m) => {
              const active = props.paymentMethod === m.id;
              const disabled = m.id === "miles-only" && !props.isLoggedIn;
              return (
                <button
                  key={m.id}
                  disabled={disabled}
                  onClick={() => props.setPaymentMethod(m.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: "left",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                    border: `1.5px solid ${active ? PURPLE2 : "#eceafa"}`,
                    background: active ? "#faf7ff" : "#fff",
                    color: "#1e1b4b",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{m.icon}</span> {m.label}
                </button>
              );
            })}
          </div>

          {props.paymentMethod === "card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
              <Field label="Nom sur la carte (fictif)">
                <input style={inputStyle} value={props.cardName} onChange={(e) => props.setCardName(e.target.value)} placeholder="JEAN BAPTISTE" />
              </Field>
              <Field label="Numéro de carte (démo — ex : 4242 4242 4242 4242)">
                <input
                  style={inputStyle}
                  value={props.cardNumber}
                  onChange={(e) => props.setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  inputMode="numeric"
                />
              </Field>
              <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Expiration">
                  <input style={inputStyle} placeholder="MM/AA" />
                </Field>
                <Field label="CVC">
                  <input style={inputStyle} placeholder="123" />
                </Field>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS & STYLES
// ═══════════════════════════════════════════════════════════════════════════
function isoToLoose(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return `${y}-${m}-${d}`;
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
function civ(c: string): string {
  return c === "MME" ? "Mme" : c === "MLLE" ? "Mlle" : "M.";
}
function seatLabel(seats: SeatDTO[] | null, id: string): string {
  const s = seats?.find((x) => x.id === id);
  return s ? `${s.row}${s.column}` : "—";
}

const inputStyle: React.CSSProperties = {
  padding: "11px 13px",
  borderRadius: 10,
  border: "1.5px solid #dcdae6",
  fontSize: 14,
  color: "#1e1b4b",
  width: "100%",
  background: "#fff",
};
const confirmCard: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  textAlign: "center",
  background: "#fff",
  border: "1px solid #eceafa",
  borderRadius: 24,
  padding: 48,
  boxShadow: "0 8px 30px rgba(20,10,60,0.10)",
};
const refBadge: React.CSSProperties = {
  display: "inline-block",
  margin: "12px 0 20px",
  background: "#f0ecfb",
  color: PURPLE2,
  fontWeight: 800,
  fontSize: 22,
  letterSpacing: 2,
  padding: "12px 24px",
  borderRadius: 12,
};
const milesBadge: React.CSSProperties = {
  marginTop: 16,
  display: "inline-block",
  background: "#f0ecfb",
  color: PURPLE,
  fontWeight: 700,
  fontSize: 14,
  padding: "10px 18px",
  borderRadius: 999,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 800, color: "#1e1b4b", fontSize: 19 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}
function Line({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color: green ? "#1f9d55" : "#4b4b63" }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
function primaryBtn(loading: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: PURPLE,
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    padding: "13px 28px",
    borderRadius: 12,
    border: "none",
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
    whiteSpace: "nowrap",
  };
}
function ghostBtn(disabled: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    color: disabled ? "#c4c0d4" : PURPLE,
    fontWeight: 700,
    fontSize: 15,
    padding: "13px 24px",
    borderRadius: 12,
    border: `1.5px solid ${disabled ? "#ece9f5" : "#d8cdf2"}`,
    cursor: disabled ? "default" : "pointer",
    whiteSpace: "nowrap",
  };
}
