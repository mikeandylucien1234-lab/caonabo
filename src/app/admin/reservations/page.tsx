"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRows, useUpsert, fmtUsd, fmtDateTime } from "@/lib/admin/api";
import { getSupabase } from "@/lib/supabase/client";
import { PageHead, Card, Badge, Table, Td, inputStyle, Loading, ErrorBox, INK } from "@/components/admin/ui";

interface Booking {
  id: string;
  reference: string;
  contactEmail: string;
  passengerCount: number;
  totalUsdCents: number;
  status: string;
  tripType: string;
  createdAt: string;
  flight: { flightNumber: string; route: { origin: { city: string } | null; destination: { city: string } | null } | null } | null;
}
const SEL =
  "id,reference,contactEmail,passengerCount,totalUsdCents,status,tripType,createdAt," +
  "flight:Flight(flightNumber,route:Route(origin:Airport!Route_originId_fkey(city),destination:Airport!Route_destinationId_fkey(city)))";

const STATUSES = ["pending", "confirmed", "cancelled"];

function toneFor(status: string): "green" | "red" | "grey" {
  return status === "confirmed" ? "green" : status === "cancelled" ? "red" : "grey";
}

// Résumé bagages : franchise (1 soute 23 kg + 1 cabine 8 kg) incluse pour tous,
// on n'affiche que les suppléments choisis.
function baggageLabel(extraKg: number, extraBags: number): string {
  const extras: string[] = [];
  if (extraKg > 0) extras.push(`+${extraKg} kg`);
  if (extraBags > 0) extras.push(`+${extraBags} valise${extraBags > 1 ? "s" : ""}`);
  return extras.length ? `Inclus · ${extras.join(" · ")}` : "Inclus (23 kg + 8 kg)";
}

export default function AdminReservations() {
  const { data, isLoading, error } = useRows<Booking>("Booking", SEL, { order: { column: "createdAt", ascending: false }, limit: 200 });
  const upsert = useUpsert("Booking", ["Booking"]);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <PageHead title="Réservations" subtitle="Toutes les réservations passées sur le site. Cliquez une ligne pour le détail complet." />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Référence", "Vol / route", "Contact", "Pax", "Total", "Date", "Statut"]}>
            {(data ?? []).map((b) => (
              <tr key={b.id} onClick={() => setSelected(b.id)} style={{ cursor: "pointer" }}>
                <Td><b style={{ color: "#1e1b4b" }}>{b.reference}</b><div style={{ fontSize: 12, color: "#8a8aa0" }}>{b.tripType}</div></Td>
                <Td>{b.flight ? <>{b.flight.route?.origin?.city ?? "?"} → {b.flight.route?.destination?.city ?? "?"}<div style={{ fontSize: 12, color: "#8a8aa0" }}>{b.flight.flightNumber}</div></> : "—"}</Td>
                <Td style={{ fontSize: 13 }}>{b.contactEmail}</Td>
                <Td>{b.passengerCount}</Td>
                <Td><b>{fmtUsd(b.totalUsdCents)}</b></Td>
                <Td style={{ fontSize: 13 }}>{fmtDateTime(b.createdAt)}</Td>
                <Td><Badge label={b.status} tone={toneFor(b.status)} /></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {selected && (
        <BookingDetail
          id={selected}
          onClose={() => setSelected(null)}
          onStatus={(status) => upsert.mutate({ id: selected, status })}
          statusPending={upsert.isPending}
        />
      )}
    </div>
  );
}

// ── Détail complet d'une réservation (panneau latéral) ───────────────────────
interface Passenger {
  id: string;
  civility: string;
  firstName: string;
  lastName: string;
  type: string;
  birthDate: string | null;
  nationality: string | null;
  documentType: string | null;
  documentNumber: string | null;
  documentExpiry: string | null;
  documentIssuingCountry: string | null;
  phone: string | null;
  evisaFileUrl: string | null;
  seat: { row: number; column: string; type: string; fareClass: string; priceSupplementCents: number } | null;
  extraBaggageKg: number;
  extraFullBags: number;
}
interface BookingFull {
  id: string;
  reference: string;
  status: string;
  tripType: string;
  cabinClass: string;
  createdAt: string;
  contactEmail: string;
  contactPhone: string | null;
  passengerCount: number;
  basePriceCents: number;
  baggageTotalCents: number;
  seatTotalCents: number;
  taxesCents: number;
  milesRedeemed: number;
  totalUsdCents: number;
  milesEarned: number;
  currency: string;
  paymentMethodDisplay: string | null;
  paymentStatus: string;
  receiptNumber: string | null;
  receiptUrl: string | null;
  flight: {
    flightNumber: string;
    departAt: string;
    arriveAt: string;
    route: { origin: { code: string; city: string; country: string } | null; destination: { code: string; city: string; country: string } | null } | null;
  } | null;
  passengers: Passenger[];
}

// Sélection unique récupérant TOUTES les relations en une seule requête.
const DETAIL_SEL =
  "*," +
  "flight:Flight(flightNumber,departAt,arriveAt,route:Route(origin:Airport!Route_originId_fkey(code,city,country),destination:Airport!Route_destinationId_fkey(code,city,country)))," +
  "passengers:Passenger(*,seat:Seat(row,column,type,fareClass,priceSupplementCents))";

function BookingDetail({ id, onClose, onStatus, statusPending }: { id: string; onClose: () => void; onStatus: (s: string) => void; statusPending: boolean }) {
  const { data: b, isLoading, error } = useQuery<BookingFull>({
    queryKey: ["Booking", "detail", id],
    queryFn: async () => {
      const { data, error } = await getSupabase().from("Booking").select(DETAIL_SEL).eq("id", id).single();
      if (error) throw new Error(error.message);
      return data as unknown as BookingFull;
    },
  });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,10,45,0.5)", zIndex: 120, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(600px, 100%)", height: "100%", background: "#faf9fc", overflowY: "auto", boxShadow: "-20px 0 60px rgba(10,5,40,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #ececf4", background: "#fff", position: "sticky", top: 0, zIndex: 2 }}>
          <div className="font-heading" style={{ fontWeight: 800, fontSize: 20, color: INK }}>Détail de la réservation</div>
          <button onClick={onClose} aria-label="Fermer" style={{ background: "#f2f2f8", border: "none", borderRadius: 999, width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "#6b6b80" }}>×</button>
        </div>

        <div style={{ padding: 24 }}>
          {isLoading ? <Loading label="Chargement du détail…" /> : error ? <ErrorBox message={(error as Error).message} /> : b ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* En-tête PNR + statut */}
              <Section>
                <Row><span style={{ fontSize: 12, color: "#8a8aa0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Référence (PNR)</span></Row>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div className="font-heading" style={{ fontSize: 26, fontWeight: 800, color: INK, letterSpacing: 1 }}>{b.reference}</div>
                  <Badge label={b.status} tone={toneFor(b.status)} />
                </div>
                <div style={{ fontSize: 13, color: "#6b6b80", marginTop: 6 }}>
                  {b.tripType} · {b.cabinClass} · créée le {fmtDateTime(b.createdAt)}
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12.5, color: "#6b6b80", marginBottom: 6, fontWeight: 600 }}>Changer le statut</div>
                  <select
                    style={{ ...inputStyle, maxWidth: 240 }}
                    value={b.status}
                    disabled={statusPending}
                    onChange={(e) => onStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </Section>

              {/* Vol */}
              {b.flight && (
                <Section title="Vol">
                  <div style={{ fontWeight: 800, color: INK, fontSize: 16 }}>
                    {b.flight.route?.origin?.city ?? "?"} ({b.flight.route?.origin?.code ?? "?"}) → {b.flight.route?.destination?.city ?? "?"} ({b.flight.route?.destination?.code ?? "?"})
                  </div>
                  <div style={{ fontSize: 13.5, color: "#5c5c7a", marginTop: 6 }}>Vol <b>{b.flight.flightNumber}</b></div>
                  <div style={{ fontSize: 13.5, color: "#5c5c7a", marginTop: 4 }}>Départ : {fmtDateTime(b.flight.departAt)}</div>
                  <div style={{ fontSize: 13.5, color: "#5c5c7a" }}>Arrivée : {fmtDateTime(b.flight.arriveAt)}</div>
                </Section>
              )}

              {/* Paiement */}
              <Section title="Paiement">
                <KV
                  k="Statut du paiement"
                  v={
                    b.paymentStatus === "PAID"
                      ? "Payé ✓"
                      : b.paymentStatus === "PENDING"
                        ? "En attente"
                        : b.paymentStatus === "EXPIRED"
                          ? "Expiré"
                          : b.paymentStatus === "FAILED"
                            ? "Échoué"
                            : b.paymentStatus
                  }
                />
                {b.paymentMethodDisplay && <KV k="Moyen" v={b.paymentMethodDisplay} />}
                {b.receiptNumber && <KV k="N° comprobante" v={b.receiptNumber} />}
                {b.receiptUrl && (
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={`/api/receipts?ref=${encodeURIComponent(b.reference)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", textDecoration: "none" }}
                    >
                      📄 Télécharger le comprobante
                    </a>
                  </div>
                )}
              </Section>

              {/* Contact */}
              <Section title="Contact">
                <KV k="Email" v={b.contactEmail} />
                <KV k="Téléphone" v={b.contactPhone ?? "—"} />
              </Section>

              {/* Passagers */}
              <Section title={`Passagers (${b.passengers?.length ?? 0})`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(b.passengers ?? []).map((p) => (
                    <div key={p.id} style={{ border: "1px solid #ececf4", borderRadius: 12, padding: 14, background: "#fff" }}>
                      <div style={{ fontWeight: 800, color: INK, fontSize: 15 }}>
                        {p.civility} {p.firstName} {p.lastName} <span style={{ fontSize: 12, color: "#8a8aa0", fontWeight: 600 }}>({p.type})</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 8 }}>
                        {p.birthDate && <KV k="Naissance" v={new Date(p.birthDate).toLocaleDateString("fr-FR")} small />}
                        {p.nationality && <KV k="Nationalité" v={p.nationality} small />}
                        {p.documentType && <KV k="Document" v={`${p.documentType} ${p.documentNumber ?? ""}`} small />}
                        {p.documentExpiry && <KV k="Expire le" v={new Date(p.documentExpiry).toLocaleDateString("fr-FR")} small />}
                        {p.documentIssuingCountry && <KV k="Pays d'émission" v={p.documentIssuingCountry} small />}
                        {p.phone && <KV k="Téléphone" v={p.phone} small />}
                        <KV k="Siège" v={p.seat ? `${p.seat.row}${p.seat.column} · ${p.seat.fareClass}` : "Non choisi"} small />
                        <KV k="Bagages" v={baggageLabel(p.extraBaggageKg, p.extraFullBags)} small />
                      </div>
                      {p.evisaFileUrl && (
                        <div style={{ marginTop: 10 }}>
                          <EvisaLink path={p.evisaFileUrl} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Ventilation du prix */}
              <Section title="Prix payé">
                <PriceRow k="Vol (base × passagers)" v={fmtUsd(b.basePriceCents)} />
                <PriceRow k="Bagages" v={fmtUsd(b.baggageTotalCents)} />
                <PriceRow k="Sièges" v={fmtUsd(b.seatTotalCents)} />
                <PriceRow k="Taxes" v={fmtUsd(b.taxesCents)} />
                <div style={{ height: 1, background: "#e6e4f0", margin: "8px 0" }} />
                <PriceRow k="Total payé" v={`${fmtUsd(b.totalUsdCents)} ${b.currency}`} bold />
              </Section>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ececf4", borderRadius: 14, padding: 18 }}>
      {title && <div style={{ fontSize: 12, color: "#8a8aa0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{title}</div>}
      {children}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 6 }}>{children}</div>;
}
function KV({ k, v, small }: { k: string; v: string; small?: boolean }) {
  return (
    <div style={{ marginBottom: small ? 2 : 6 }}>
      <span style={{ fontSize: 12.5, color: "#8a8aa0" }}>{k} : </span>
      <span style={{ fontSize: small ? 13 : 14, color: "#3a3a55", fontWeight: 600 }}>{v}</span>
    </div>
  );
}
// Lien vers le visa électronique via URL signée temporaire (bucket privé).
function EvisaLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function open() {
    setErr(null);
    setLoading(true);
    try {
      const { data, error } = await getSupabase().storage.from("passenger-documents").createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) throw new Error(error?.message ?? "Lien indisponible.");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #dcd7f0", background: "#f7f5fd", color: "#5b21b6", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
      >
        📎 {loading ? "Ouverture…" : "Consulter le visa électronique"}
      </button>
      {err && <span style={{ color: "#dc2626", fontSize: 12.5, marginLeft: 10 }}>{err}</span>}
    </div>
  );
}

function PriceRow({ k, v, bold, accent }: { k: string; v: string; bold?: boolean; accent?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: bold ? 16 : 14 }}>
      <span style={{ color: bold ? INK : "#5c5c7a", fontWeight: bold ? 800 : 500 }}>{k}</span>
      <span style={{ color: accent ?? (bold ? INK : "#3a3a55"), fontWeight: bold ? 800 : 700 }}>{v}</span>
    </div>
  );
}
