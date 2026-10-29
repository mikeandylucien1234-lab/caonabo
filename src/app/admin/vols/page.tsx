"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRows, useUpsert, useRemove, fmtUsd, fmtDateTime } from "@/lib/admin/api";
import { getSupabase } from "@/lib/supabase/client";
import { PageHead, Card, Btn, Badge, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface Airport { code: string; city: string }
interface RouteRow { id: string; origin: Airport | null; destination: Airport | null }
interface Flight {
  id?: string;
  flightNumber: string;
  routeId: string;
  departAt: string;
  arriveAt: string;
  priceUsdCents: number;
  seatsTotal: number;
  seatsAvailable: number;
  durationMinutes: number;
  stopsCount: number;
  operatedBy: string;
  stopAirports: string;
  terminal: string;
  gate: string | null;
  route?: RouteRow | null;
}
const FLIGHT_SEL =
  "id,flightNumber,routeId,departAt,arriveAt,priceUsdCents,seatsTotal,seatsAvailable,durationMinutes,stopsCount,operatedBy,stopAirports,terminal,gate," +
  "route:Route(id,origin:Airport!Route_originId_fkey(code,city),destination:Airport!Route_destinationId_fkey(code,city))";
const ROUTE_SEL = "id,origin:Airport!Route_originId_fkey(code,city),destination:Airport!Route_destinationId_fkey(code,city)";

function emptyFlight(): Flight {
  return { flightNumber: "", routeId: "", departAt: "", arriveAt: "", priceUsdCents: 20000, seatsTotal: 180, seatsAvailable: 180, durationMinutes: 300, stopsCount: 0, operatedBy: "Caonabo Airlinje", stopAirports: "", terminal: "1", gate: null };
}
function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminFlights() {
  const { data, isLoading, error } = useRows<Flight>("Flight", FLIGHT_SEL, { order: { column: "departAt" }, limit: 100 });
  const routes = useRows<RouteRow>("Route", ROUTE_SEL);
  const upsert = useUpsert("Flight", ["Flight"]);
  const [form, setForm] = useState<Flight | null>(null);
  const [del, setDel] = useState<Flight | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function save() {
    if (!form) return;
    // Validation explicite (au lieu de désactiver le bouton) → message clair.
    if (!form.flightNumber.trim()) return setFormError("Renseignez le numéro de vol.");
    if (!form.routeId) return setFormError("Choisissez une route.");
    if (!form.departAt) return setFormError("Renseignez la date et l'heure de départ (jour ET heure).");
    if (!form.arriveAt) return setFormError("Renseignez la date et l'heure d'arrivée (jour ET heure).");
    setFormError(null);
    const { route, ...payload } = form;
    void route;
    upsert.mutate(
      {
        ...payload,
        priceUsdCents: Number(form.priceUsdCents),
        seatsTotal: Number(form.seatsTotal),
        seatsAvailable: Number(form.seatsAvailable),
        durationMinutes: Number(form.durationMinutes),
        stopsCount: Number(form.stopsCount),
        departAt: new Date(form.departAt).toISOString(),
        arriveAt: new Date(form.arriveAt).toISOString(),
      },
      { onSuccess: () => setForm(null) },
    );
  }

  return (
    <div>
      <PageHead title="Vols" subtitle="Gérez les vols programmés de Caonabo Airlinje." action={<Btn onClick={() => setForm(emptyFlight())}>+ Nouveau vol</Btn>} />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Vol", "Route", "Départ", "Terminal / Porte", "Prix", "Places", "Statut", ""]}>
            {(data ?? []).map((f) => (
              <tr key={f.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{f.flightNumber}</b></Td>
                <Td>{f.route?.origin?.city ?? "?"} → {f.route?.destination?.city ?? "?"}</Td>
                <Td>{fmtDateTime(f.departAt)}</Td>
                <Td>
                  T{f.terminal}
                  {f.gate ? <> · <b style={{ color: "#5b21b6" }}>{f.gate}</b></> : <span style={{ color: "#b0aec0" }}> · à confirmer</span>}
                </Td>
                <Td><b>{fmtUsd(f.priceUsdCents)}</b></Td>
                <Td>{f.seatsAvailable}/{f.seatsTotal}</Td>
                <Td><Badge label={f.seatsAvailable <= 0 ? "Complet" : "Actif"} tone={f.seatsAvailable <= 0 ? "amber" : "green"} /></Td>
                <Td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setForm({ ...f, departAt: toLocalInput(f.departAt), arriveAt: toLocalInput(f.arriveAt) })}>Modifier</Btn>
                    <Btn variant="danger" onClick={() => setDel(f)}>Suppr.</Btn>
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? "Modifier le vol" : "Nouveau vol"} onClose={() => setForm(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Numéro de vol"><input style={inputStyle} value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })} /></Field>
            <Field label="Route">
              <select style={inputStyle} value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
                <option value="">Choisir…</option>
                {(routes.data ?? []).map((r) => (
                  <option key={r.id} value={r.id}>{r.origin?.code} → {r.destination?.code}</option>
                ))}
              </select>
            </Field>
            <Field label="Départ"><input type="datetime-local" style={inputStyle} value={form.departAt} onChange={(e) => setForm({ ...form, departAt: e.target.value })} /></Field>
            <Field label="Arrivée"><input type="datetime-local" style={inputStyle} value={form.arriveAt} onChange={(e) => setForm({ ...form, arriveAt: e.target.value })} /></Field>
            <Field label="Prix de base (USD cents)"><input type="number" style={inputStyle} value={form.priceUsdCents} onChange={(e) => setForm({ ...form, priceUsdCents: Number(e.target.value) })} /></Field>
            <Field label="Durée (minutes)"><input type="number" style={inputStyle} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></Field>
            <Field label="Sièges (total)"><input type="number" style={inputStyle} value={form.seatsTotal} onChange={(e) => setForm({ ...form, seatsTotal: Number(e.target.value) })} /></Field>
            <Field label="Sièges dispo."><input type="number" style={inputStyle} value={form.seatsAvailable} onChange={(e) => setForm({ ...form, seatsAvailable: Number(e.target.value) })} /></Field>
            <Field label="Escales (nombre)"><input type="number" style={inputStyle} value={form.stopsCount} onChange={(e) => setForm({ ...form, stopsCount: Number(e.target.value) })} /></Field>
            <Field label="Escales (codes, ex: LIM)"><input style={inputStyle} value={form.stopAirports} onChange={(e) => setForm({ ...form, stopAirports: e.target.value.toUpperCase() })} /></Field>
            <Field label="Terminal"><input style={inputStyle} value={form.terminal} onChange={(e) => setForm({ ...form, terminal: e.target.value })} /></Field>
            <Field label="Porte d'embarquement (gate)">
              <input
                style={inputStyle}
                value={form.gate ?? ""}
                placeholder="ex : A3 (laisser vide = à confirmer)"
                onChange={(e) => setForm({ ...form, gate: e.target.value.trim() ? e.target.value.toUpperCase() : null })}
              />
            </Field>
          </div>
          {(formError || upsert.error) && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{formError ?? (upsert.error as Error).message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setForm(null)}>Annuler</Btn>
            <Btn onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Enregistrement…" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}

      {del && <DeleteFlightModal flight={del} onClose={() => setDel(null)} />}
    </div>
  );
}

// Modale de suppression d'un vol : vérifie d'abord les réservations liées.
// Choix : on BLOQUE la suppression si des réservations existent (intégrité
// des données + FK), et on invite à les annuler d'abord.
function DeleteFlightModal({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  const remove = useRemove("Flight", ["Flight"]);
  const { data: count, isLoading } = useQuery<number>({
    queryKey: ["Booking", "count-by-flight", flight.id],
    queryFn: async () => {
      const { count, error } = await getSupabase()
        .from("Booking")
        .select("id", { count: "exact", head: true })
        .eq("flightId", flight.id!);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });
  const hasBookings = (count ?? 0) > 0;
  return (
    <Modal title="Supprimer le vol" onClose={onClose}>
      <p style={{ fontSize: 14, color: "#3a3a55", lineHeight: 1.6 }}>
        Vous êtes sur le point de supprimer le vol <b>{flight.flightNumber}</b>. Cette action est
        <b> irréversible</b>.
      </p>
      {isLoading ? (
        <Loading label="Vérification des réservations liées…" />
      ) : hasBookings ? (
        <div style={{ marginTop: 14, padding: 14, background: "#fdf0d9", color: "#8a5a12", borderRadius: 12, fontSize: 13.5, lineHeight: 1.55 }}>
          ⚠️ Ce vol a <b>{count} réservation(s)</b> liée(s). La suppression est bloquée pour préserver
          ces réservations. Annulez ou déplacez d’abord les réservations concernées (écran «&nbsp;Réservations&nbsp;»),
          puis réessayez.
        </div>
      ) : (
        <div style={{ marginTop: 14, padding: 14, background: "#e3f7ea", color: "#1f7a45", borderRadius: 12, fontSize: 13.5 }}>
          Aucune réservation liée — la suppression est sûre.
        </div>
      )}
      {remove.error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{(remove.error as Error).message}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn
          variant="danger"
          disabled={isLoading || hasBookings || remove.isPending}
          onClick={() => remove.mutate(flight.id!, { onSuccess: onClose })}
        >
          {remove.isPending ? "Suppression…" : "Supprimer définitivement"}
        </Btn>
      </div>
    </Modal>
  );
}
