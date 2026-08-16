"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BaggagePolicyDTO,
  CityDTO,
  FlightResultDTO,
  SeatDTO,
} from "@/lib/data/types";
import { formatPrice } from "@/lib/currency";
import FlightResultCard from "@/components/sections/FlightResultCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import { withMinDelay } from "@/lib/minDelay";
import { getSupabase } from "@/lib/supabase/client";

// Visa e- : requis uniquement pour un départ d'Haïti (PAP/CAP) vers le Chili (SCL).
const HAITI_CODES = ["PAP", "CAP"];
function isHaitiToChile(f: FlightResultDTO | null): boolean {
  return !!f && HAITI_CODES.includes(f.origin.code) && f.destination.code === "SCL";
}

// Les 2 classes réelles (Boeing 737-400, affrètement complet).
const CABIN_CLASSES = ["Économique", "Première classe"] as const;

// Politique de bagages de secours (si l'API n'a pas encore répondu).
const FALLBACK_POLICY: BaggagePolicyDTO = {
  includedCheckedKg: 23,
  includedCabinKg: 8,
  extraKgPriceCents: 500,
  extraBagPriceCents: 6800,
};

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
  evisaFileUrl: string | null;
  seatId: string | null;
  extraBaggageKg: number; // kg au-delà de la franchise soute (23 kg incluse)
  extraFullBags: number; // valises entières supplémentaires (68 $ pièce)
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
    evisaFileUrl: null,
    seatId: null,
    extraBaggageKg: 0,
    extraFullBags: 0,
  };
}

// Jeton opaque du tunnel (identifie NOS verrous temporaires de sièges).
function makeHoldToken(): string {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
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
  const [cabinClass, setCabinClass] = useState<string>("Économique");
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
  const [policy, setPolicy] = useState<BaggagePolicyDTO>(FALLBACK_POLICY);
  const [activePax, setActivePax] = useState(0);
  // jeton du tunnel : identifie nos verrous temporaires de sièges (10 min)
  const holdTokenRef = useRef<string>(makeHoldToken());

  // étape 5
  const [useMiles, setUseMiles] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  // paiement Flow : configuré ? mode ? (sinon paiement démo dégradé)
  const [flowConfigured, setFlowConfigured] = useState<boolean | null>(null);
  const [flowMode, setFlowMode] = useState<"SANDBOX" | "PRODUCTION">("SANDBOX");

  // transverse
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatNotice, setSeatNotice] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [confirmInfo, setConfirmInfo] = useState<{
    milesEarned: number | null;
    payment: string | null;
  } | null>(null);
  const autoRef = useRef(false);
  const isLoggedIn = milesBalance !== null;

  // ── chargement de la politique de bagages (une fois) ────────────────────────
  useEffect(() => {
    fetch("/api/baggage-policy")
      .then((r) => r.json())
      .then((d) => d?.policy && setPolicy(d.policy as BaggagePolicyDTO))
      .catch(() => {});
  }, []);

  // ── état du paiement Flow (configuré ou mode démo) ──────────────────────────
  useEffect(() => {
    fetch("/api/payments/status")
      .then((r) => r.json())
      .then((d) => {
        setFlowConfigured(Boolean(d.configured));
        setFlowMode(d.mode === "PRODUCTION" ? "PRODUCTION" : "SANDBOX");
      })
      .catch(() => setFlowConfigured(false));
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
      const { res, data } = await withMinDelay(
        (async () => {
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
          return { res, data };
        })(),
      );
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

  // (Re)charge le plan de cabine, en signalant nos propres verrous temporaires.
  const loadSeats = useCallback(async (flightId: string) => {
    try {
      const res = await fetch(
        `/api/flights/${flightId}/seats?hold=${encodeURIComponent(holdTokenRef.current)}`,
      );
      const data = await res.json();
      setSeats(data.seats as SeatDTO[]);
      return data.seats as SeatDTO[];
    } catch {
      setSeats([]);
      return [] as SeatDTO[];
    }
  }, []);

  async function selectFlight(f: FlightResultDTO) {
    setSelected(f);
    setSeats(null);
    await loadSeats(f.id);
  }

  // ── recalcul du prix côté serveur (étapes 4 et 5) ───────────────────────────
  const priceKey = selected
    ? JSON.stringify({
        f: selected.id,
        p: passengers.map((p) => [p.seatId, p.extraBaggageKg, p.extraFullBags]),
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
              extraBaggageKg: p.extraBaggageKg,
              extraFullBags: p.extraFullBags,
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

  // Libère un verrou temporaire côté serveur (désélection / changement).
  const releaseHold = useCallback((flightId: string, seatId: string) => {
    fetch(`/api/flights/${flightId}/seats/hold`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatId, holdToken: holdTokenRef.current }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  // Assignation d'un siège au passager actif (toggle) AVEC verrou temporaire.
  // Au clic : on pose un verrou serveur (« en cours de sélection », 10 min). En
  // cas de conflit (siège pris entre-temps), on rafraîchit le plan et on prévient.
  async function toggleSeat(seat: SeatDTO) {
    if (!selected) return;
    if (seat.heldByOther || !seat.isAvailable) return;
    const current = passengers[activePax];
    // Désélection du même siège → libère le verrou
    if (current?.seatId === seat.id) {
      updatePax(activePax, { seatId: null });
      releaseHold(selected.id, seat.id);
      return;
    }
    // Siège déjà attribué à un autre passager de la réservation → ignore
    if (passengers.some((p, idx) => idx !== activePax && p.seatId === seat.id))
      return;

    // Pose le verrou serveur avant d'attribuer
    try {
      const res = await fetch(`/api/flights/${selected.id}/seats/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId: seat.id, holdToken: holdTokenRef.current }),
      });
      if (!res.ok) {
        setSeatNotice(
          "Ce siège vient d'être choisi par un autre voyageur. Le plan a été actualisé.",
        );
        await loadSeats(selected.id);
        return;
      }
    } catch {
      return;
    }
    // Libère l'éventuel siège précédent du passager actif
    const prevSeat = current?.seatId;
    if (prevSeat && prevSeat !== seat.id) releaseHold(selected.id, prevSeat);
    setSeatNotice(null);
    updatePax(activePax, { seatId: seat.id });
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

  // Champs communs envoyés à la création de réservation (démo ou Flow).
  function bookingPayload() {
    return {
      flightId: selected!.id,
      tripType,
      cabinClass,
      contactEmail: email,
      contactPhone: phone,
      useMiles: useMiles && milesBalance ? milesBalance : 0,
      holdToken: holdTokenRef.current,
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
        evisaFileUrl: p.evisaFileUrl || null,
        seatId: p.seatId,
        extraBaggageKg: p.extraBaggageKg,
        extraFullBags: p.extraFullBags,
      })),
    };
  }

  // Siège pris entre la sélection et la confirmation : rafraîchit le plan,
  // retire les sièges indisponibles et renvoie à l'étape 4.
  async function handleSeatConflict(data: { error?: string }) {
    const fresh = await loadSeats(selected!.id);
    const stillFree = new Set(
      fresh.filter((s) => s.isAvailable && !s.heldByOther).map((s) => s.id),
    );
    setPassengers((prev) =>
      prev.map((p) => (p.seatId && !stillFree.has(p.seatId) ? { ...p, seatId: null } : p)),
    );
    setSeatNotice(data.error ?? "Un siège n'est plus disponible.");
    setStep(4);
  }

  // Paiement de DÉMONSTRATION (Flow non configuré) → réservation confirmée.
  async function demoConfirm() {
    const { res, data } = await withMinDelay(
      (async () => {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bookingPayload(),
            paymentMethod,
            cardLast4: cardNumber.replace(/\D/g, "").slice(-4),
          }),
        });
        return { res, data: await res.json() };
      })(),
    );
    if (!res.ok) {
      if (res.status === 409 && data.code === "SEAT_TAKEN") return handleSeatConflict(data);
      throw new Error(data.error ?? "Erreur de réservation");
    }
    setReference(data.reference as string);
    setConfirmInfo({
      milesEarned: typeof data.milesEarned === "number" ? data.milesEarned : null,
      payment: data.paymentMethodDisplay ?? null,
    });
  }

  async function confirmBooking() {
    if (!selected) return;
    setError(null);
    setLoading(true);
    let redirecting = false;
    try {
      if (flowConfigured) {
        // Paiement RÉEL via Flow → création PENDING puis redirection.
        const res = await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload()),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409 && data.code === "SEAT_TAKEN") {
            await handleSeatConflict(data);
            return;
          }
          if (data.code === "FLOW_NOT_CONFIGURED") {
            setFlowConfigured(false);
            await demoConfirm();
            return;
          }
          throw new Error(data.error ?? "Erreur de paiement.");
        }
        // Redirection vers la page de paiement Flow (on garde le spinner).
        redirecting = true;
        window.location.href = data.redirectUrl as string;
        return;
      }
      await demoConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      if (!redirecting) setLoading(false);
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
            cabinClass={cabinClass}
            setCabinClass={setCabinClass}
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
            showEvisa={isHaitiToChile(selected)}
          />
        )}

        {step === 4 && (
          <Step4
            passengers={passengers}
            activePax={activePax}
            setActivePax={setActivePax}
            policy={policy}
            updatePax={updatePax}
            seats={seats}
            toggleSeat={toggleSeat}
            breakdown={breakdown}
            seatNotice={seatNotice}
          />
        )}

        {step === 5 && (
          <Step5
            selected={selected!}
            passengers={passengers}
            seats={seats}
            cabinClass={cabinClass}
            policy={policy}
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
            flowConfigured={flowConfigured}
            flowMode={flowMode}
          />
        )}

        {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 16 }}>{error}</p>}
      </div>

      {/* indicateur de chargement (recherche des vols / confirmation) */}
      {loading && (step === 1 || step === 5) && (
        <LoadingIndicator label={step === 1 ? "Recherche des meilleurs vols…" : "Confirmation de votre réservation…"} />
      )}

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
            {loading
              ? flowConfigured
                ? "Redirection vers Flow…"
                : "Confirmation…"
              : flowConfigured
                ? "Payer avec Flow"
                : "Payer et confirmer"}{" "}
            →
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
  cabinClass: string;
  setCabinClass: (v: string) => void;
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

      {/* Sélecteur de classe (2 classes réelles du Boeing 737-400) */}
      <div>
        <div style={{ fontSize: 12, color: "#5c5c7a", marginBottom: 6, fontWeight: 500 }}>
          Classe de voyage
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {CABIN_CLASSES.map((c) => {
            const on = props.cabinClass === c;
            return (
              <button
                key={c}
                onClick={() => props.setCabinClass(c)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1.5px solid ${on ? PURPLE2 : "#dcdae6"}`,
                  background: on ? "#f4efff" : "#fff",
                  color: on ? PURPLE : "#5c5c7a",
                }}
              >
                <span aria-hidden style={{ fontSize: 15 }}>
                  {c === "Première classe" ? "★" : "✈"}
                </span>
                {c}
              </button>
            );
          })}
        </div>
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
  showEvisa,
}: {
  passengers: PaxForm[];
  updatePax: (i: number, patch: Partial<PaxForm>) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  showEvisa: boolean;
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

          {showEvisa && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #e6e4f0" }}>
              <Field label="Visa électronique (optionnel)">
                <EvisaUpload value={p.evisaFileUrl} onChange={(path) => updatePax(i, { evisaFileUrl: path })} />
              </Field>
              <div style={{ fontSize: 12, color: "#8a8aa0", marginTop: 6, lineHeight: 1.5 }}>
                Si vous disposez déjà de votre visa électronique pour le Chili, vous pouvez le joindre ici.
                Ce document n&rsquo;est pas obligatoire pour finaliser votre réservation.
              </div>
            </div>
          )}
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

// Upload du visa électronique vers le bucket privé "passenger-documents".
// On stocke le CHEMIN de l'objet (pas d'URL publique — document sensible).
function EvisaUpload({ value, onChange }: { value: string | null; onChange: (path: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const OK = ["application/pdf", "image/jpeg", "image/png"];

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    if (!OK.includes(file.type)) return setError("Format non supporté (PDF, JPG ou PNG).");
    if (file.size > 5 * 1024 * 1024) return setError("Fichier trop volumineux (5 Mo max).");
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "pdf").toLowerCase();
      const path = `evisa/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await getSupabase()
        .storage.from("passenger-documents")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      setFileName(file.name);
      onChange(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi du fichier.");
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px solid #cbe8d3", background: "#f2fbf5", borderRadius: 12 }}>
        <span style={{ color: "#1f9d55", fontWeight: 700, fontSize: 14 }}>✓ Document joint</span>
        <span style={{ fontSize: 13, color: "#5c5c7a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName ?? "visa électronique"}</span>
        <button type="button" onClick={() => { onChange(null); setFileName(null); }} style={{ marginLeft: "auto", border: "none", background: "transparent", color: "#dc2626", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Retirer</button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "1.5px dashed #cfc9ea", background: "#faf9fd", color: "#5b21b6", fontWeight: 700, fontSize: 14, cursor: uploading ? "wait" : "pointer" }}
      >
        {uploading ? "Envoi en cours…" : "📎 Joindre un fichier (PDF, JPG, PNG)"}
      </button>
      <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
      {error && <p style={{ color: "#dc2626", fontSize: 12.5, marginTop: 6 }}>{error}</p>}
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
  policy,
  updatePax,
  seats,
  toggleSeat,
  breakdown,
  seatNotice,
}: {
  passengers: PaxForm[];
  activePax: number;
  setActivePax: (i: number) => void;
  policy: BaggagePolicyDTO;
  updatePax: (i: number, patch: Partial<PaxForm>) => void;
  seats: SeatDTO[] | null;
  toggleSeat: (s: SeatDTO) => void;
  breakdown: Breakdown | null;
  seatNotice: string | null;
}) {
  const pax = passengers[activePax];
  // sièges pris par un AUTRE passager de la même réservation (indispo pour l'actif)
  const takenByOthers = new Set(
    passengers.filter((_, idx) => idx !== activePax).map((p) => p.seatId).filter(Boolean) as string[],
  );
  const kg = pax?.extraBaggageKg ?? 0;
  const bags = pax?.extraFullBags ?? 0;
  const paxBaggageCents =
    kg * policy.extraKgPriceCents + bags * policy.extraBagPriceCents;

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
          <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15, marginBottom: 12 }}>Bagages</div>

          {/* Franchise incluse pour tous */}
          <div style={{ border: "1.5px solid #cbe8d3", background: "#f2fbf5", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1f9d55", fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
              ✓ Inclus pour chaque passager
            </div>
            <div style={{ fontSize: 13.5, color: "#2f6b46", lineHeight: 1.6 }}>
              🧳 1 bagage en soute ({policy.includedCheckedKg} kg) &nbsp;·&nbsp; 🎒 1 bagage cabine ({policy.includedCabinKg} kg)
            </div>
          </div>

          {/* Supplément de poids (soute) */}
          <div style={{ border: "1.5px solid #eceafa", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, color: "#1e1b4b", fontWeight: 700 }}>Poids supplémentaire</div>
                <div style={{ fontSize: 12.5, color: "#8a8aa0", marginTop: 2 }}>
                  {formatPrice(policy.extraKgPriceCents, "USD")} / kg au-delà de {policy.includedCheckedKg} kg
                </div>
              </div>
              <QtyStepper
                value={kg}
                min={0}
                max={30}
                onChange={(v) => updatePax(activePax, { extraBaggageKg: v })}
                suffix="kg"
              />
            </div>
          </div>

          {/* Valise entière supplémentaire */}
          <div style={{ border: "1.5px solid #eceafa", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, color: "#1e1b4b", fontWeight: 700 }}>Valise entière en plus</div>
                <div style={{ fontSize: 12.5, color: "#8a8aa0", marginTop: 2 }}>
                  {formatPrice(policy.extraBagPriceCents, "USD")} par valise supplémentaire
                </div>
              </div>
              <QtyStepper
                value={bags}
                min={0}
                max={4}
                onChange={(v) => updatePax(activePax, { extraFullBags: v })}
                suffix="val."
              />
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
            <span style={{ color: "#5c5c7a" }}>Suppléments bagages de ce passager</span>
            <span style={{ fontWeight: 800, color: paxBaggageCents ? PURPLE : "#1f9d55" }}>
              {paxBaggageCents ? `+ ${formatPrice(paxBaggageCents, "USD")}` : "0 $"}
            </span>
          </div>
        </div>

        {/* plan de sièges */}
        <div>
          <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 15, marginBottom: 12 }}>
            Siège {pax?.firstName ? `de ${pax.firstName}` : `du passager ${activePax + 1}`}
          </div>
          {seatNotice && (
            <div style={{ background: "#fdecec", border: "1.5px solid #f5c2c2", color: "#b23333", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, marginBottom: 10, lineHeight: 1.5 }}>
              ⚠️ {seatNotice}
            </div>
          )}
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

// Compteur +/- réutilisable (poids supplémentaire, valises).
function QtyStepper({
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  const btn = (disabled: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: 9,
    border: `1.5px solid ${disabled ? "#ece9f5" : "#d8cdf2"}`,
    background: "#fff",
    color: disabled ? "#c4c0d4" : PURPLE,
    fontSize: 18,
    fontWeight: 800,
    cursor: disabled ? "default" : "pointer",
    lineHeight: 1,
    padding: 0,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" aria-label="Diminuer" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} style={btn(value <= min)}>
        −
      </button>
      <span style={{ minWidth: 54, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#1e1b4b" }}>
        {value} {suffix}
      </span>
      <button type="button" aria-label="Augmenter" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} style={btn(value >= max)}>
        +
      </button>
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
  if (!seats) return <LoadingIndicator label="Chargement du plan de cabine…" size={120} />;
  // regroupe par rangée
  const rows = new Map<number, SeatDTO[]>();
  for (const s of seats) {
    if (!rows.has(s.row)) rows.set(s.row, []);
    rows.get(s.row)!.push(s);
  }
  const rowNums = [...rows.keys()].sort((a, b) => a - b);
  const fareOf = (rn: number) =>
    [...rows.get(rn)!].sort((a, b) => a.column.localeCompare(b.column))[0].fareClass;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12, fontSize: 11.5, color: "#7a7a92" }}>
        <Legend color="#fff" border="#c9b8ef" label="Libre" />
        <Legend color={PURPLE2} border={PURPLE2} label="Choisi" />
        <Legend color="#e7e3f0" border="#d8d3e6" label="Occupé" />
        <Legend color="#fff7e6" border="#f0d79a" label="Première classe" />
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto", border: "1px solid #eceafa", borderRadius: 12, padding: 12, background: "#fbfaff" }}>
        {rowNums.map((rn, ri) => {
          const rowSeats = [...rows.get(rn)!].sort((a, b) => a.column.localeCompare(b.column));
          // Couloir au milieu de la rangée (2-2 en Première, 3-3 en Économique)
          const mid = Math.ceil(rowSeats.length / 2);
          const fare = rowSeats[0].fareClass;
          const cabinStart = ri === 0 || fareOf(rowNums[ri - 1]) !== fare;
          return (
            <div key={rn}>
              {/* étiquette de cabine en tête de bloc */}
              {cabinStart && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: ri === 0 ? "0 0 8px" : "12px 0 8px",
                    color: fare === "Économique" ? "#b4afca" : "#a9820f",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}
                >
                  <span style={{ flex: 1, height: 1, background: fare === "Économique" ? "#e8e4f2" : "#f0e2bd" }} />
                  {fare.toUpperCase()}
                  <span style={{ flex: 1, height: 1, background: fare === "Économique" ? "#e8e4f2" : "#f0e2bd" }} />
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 20, fontSize: 10, color: "#b4afca", textAlign: "right", marginRight: 4 }}>{rn}</span>
                {rowSeats.map((s, idx) => {
                  const isSel = s.id === selectedSeatId;
                  const takenOther = takenByOthers.has(s.id) || s.heldByOther;
                  const occupied = !s.isAvailable || takenOther;
                  const premium = s.fareClass !== "Économique";
                  let bg = "#fff", bd = "#c9b8ef", col = "#5c5c7a";
                  if (occupied) { bg = "#e7e3f0"; bd = "#d8d3e6"; col = "#b4afca"; }
                  else if (isSel) { bg = PURPLE2; bd = PURPLE2; col = "#fff"; }
                  else if (premium) { bg = "#fff7e6"; bd = "#f0d79a"; col = "#a9820f"; }
                  return (
                    <button
                      key={s.column}
                      onClick={() => onToggle(s)}
                      disabled={occupied}
                      title={`${rn}${s.column} · ${s.fareClass}${s.priceSupplementCents ? ` · +${formatPrice(s.priceSupplementCents, "USD")}` : ""}`}
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
                        marginRight: idx === mid - 1 ? 16 : 0,
                        padding: 0,
                      }}
                    >
                      {s.column}
                    </button>
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
  cabinClass: string;
  policy: BaggagePolicyDTO;
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
  flowConfigured: boolean | null;
  flowMode: "SANDBOX" | "PRODUCTION";
}) {
  const { selected: f, passengers, seats, cabinClass, breakdown: b } = props;
  const dep = new Date(f.departAt);
  // Résumé bagages d'un passager : franchise incluse + éventuels suppléments.
  const bagSummary = (p: PaxForm) => {
    const extras: string[] = [];
    if (p.extraBaggageKg > 0) extras.push(`+${p.extraBaggageKg} kg`);
    if (p.extraFullBags > 0) extras.push(`+${p.extraFullBags} valise${p.extraFullBags > 1 ? "s" : ""}`);
    return extras.length ? `Bagages inclus · ${extras.join(" · ")}` : "Bagages inclus";
  };

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
              Vol {f.flightNumber} · opéré par {f.operatedBy} · {cabinClass}
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
                  {p.seatId ? seatLabel(seats, p.seatId) : "Siège auto"} · {bagSummary(p)}
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

        {/* paiement (Flow ou démonstration) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {props.flowConfigured ? (
            <div style={{ background: "#eefaf0", border: "1px solid #bfe3c6", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: "#1f7a3d" }}>
              🔒 Paiement <b>sécurisé via Flow</b>. Vous serez redirigé vers la plateforme Flow pour régler votre réservation.
              {props.flowMode === "SANDBOX" && (
                <span style={{ color: "#a9820f" }}> (mode test)</span>
              )}
            </div>
          ) : (
            <div style={{ background: "#fff7e6", border: "1px solid #f0d79a", borderRadius: 12, padding: "12px 14px", fontSize: 12.5, color: "#a9820f" }}>
              🔒 Paiement en <b>mode démonstration</b> — Flow n&apos;est pas encore configuré. Aucune vraie transaction.
            </div>
          )}

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

          {props.flowConfigured ? (
            <div style={{ border: "1.5px solid #eceafa", borderRadius: 12, padding: "16px 18px", background: "#faf9fd" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, color: "#1e1b4b", fontSize: 14, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>💳</span> Paiement via Flow
              </div>
              <p style={{ fontSize: 13, color: "#5c5c7a", margin: 0, lineHeight: 1.55 }}>
                En cliquant sur <b>« Payer avec Flow »</b>, vous serez redirigé vers Flow pour choisir votre
                moyen de paiement (carte, virement, etc.) en toute sécurité. Votre réservation sera confirmée
                dès la validation du paiement.
              </p>
            </div>
          ) : (
          <>
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
          </>
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
