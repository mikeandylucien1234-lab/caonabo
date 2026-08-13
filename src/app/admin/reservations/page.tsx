"use client";

import { useRows, useUpsert, fmtUsd, fmtDateTime } from "@/lib/admin/api";
import { PageHead, Card, Badge, Table, Td, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

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

export default function AdminReservations() {
  const { data, isLoading, error } = useRows<Booking>("Booking", SEL, { order: { column: "createdAt", ascending: false }, limit: 200 });
  const upsert = useUpsert("Booking", ["Booking"]);

  return (
    <div>
      <PageHead title="Réservations" subtitle="Toutes les réservations passées sur le site." />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Référence", "Vol / route", "Contact", "Pax", "Total", "Date", "Statut"]}>
            {(data ?? []).map((b) => (
              <tr key={b.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{b.reference}</b><div style={{ fontSize: 12, color: "#8a8aa0" }}>{b.tripType}</div></Td>
                <Td>{b.flight ? <>{b.flight.route?.origin?.city ?? "?"} → {b.flight.route?.destination?.city ?? "?"}<div style={{ fontSize: 12, color: "#8a8aa0" }}>{b.flight.flightNumber}</div></> : "—"}</Td>
                <Td style={{ fontSize: 13 }}>{b.contactEmail}</Td>
                <Td>{b.passengerCount}</Td>
                <Td><b>{fmtUsd(b.totalUsdCents)}</b></Td>
                <Td style={{ fontSize: 13 }}>{fmtDateTime(b.createdAt)}</Td>
                <Td>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge label={b.status} tone={b.status === "confirmed" ? "green" : b.status === "cancelled" ? "red" : "grey"} />
                    <select
                      style={{ ...inputStyle, width: "auto", padding: "6px 8px", fontSize: 12 }}
                      value={b.status}
                      onChange={(e) => upsert.mutate({ id: b.id, status: e.target.value })}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
