"use client";

import { useState } from "react";
import { useRows, useUpsert, useRemove } from "@/lib/admin/api";
import { PageHead, Card, Btn, Badge, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface Airport { id?: string; code: string; city: string; country: string; description?: string; imageUrl?: string }
interface RouteRow {
  id: string;
  directFlight: boolean;
  stops: number;
  origin: { code: string; city: string } | null;
  destination: { code: string; city: string } | null;
}
const ROUTE_SEL = "id,directFlight,stops,origin:Airport!Route_originId_fkey(code,city),destination:Airport!Route_destinationId_fkey(code,city)";

export default function AdminRoutes() {
  const airports = useRows<Airport>("Airport", "*", { order: { column: "code" } });
  const routes = useRows<RouteRow>("Route", ROUTE_SEL);
  const upsertA = useUpsert("Airport", ["Airport"]);
  const removeA = useRemove("Airport", ["Airport"]);
  const [form, setForm] = useState<Airport | null>(null);

  return (
    <div>
      <PageHead title="Routes & Aéroports" subtitle="Les aéroports desservis et les liaisons entre eux." action={<Btn onClick={() => setForm({ code: "", city: "", country: "", description: "", imageUrl: "" })}>+ Nouvel aéroport</Btn>} />

      <Card style={{ padding: 0, marginBottom: 24 }}>
        <div style={{ padding: "16px 20px 4px", fontWeight: 800, color: "#1e1b4b", fontSize: 16 }}>Aéroports</div>
        {airports.isLoading ? <Loading /> : airports.error ? <ErrorBox message={(airports.error as Error).message} /> : (
          <Table head={["Code", "Ville", "Pays", ""]}>
            {(airports.data ?? []).map((a) => (
              <tr key={a.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{a.code}</b></Td>
                <Td>{a.city}</Td>
                <Td>{a.country}</Td>
                <Td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setForm(a)}>Modifier</Btn>
                    <Btn variant="danger" onClick={() => confirm(`Supprimer ${a.code} ?`) && removeA.mutate(a.id!)}>Suppr.</Btn>
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px 4px", fontWeight: 800, color: "#1e1b4b", fontSize: 16 }}>Routes</div>
        {routes.isLoading ? <Loading /> : routes.error ? <ErrorBox message={(routes.error as Error).message} /> : (
          <Table head={["Origine", "Destination", "Type", "Escales"]}>
            {(routes.data ?? []).map((r) => (
              <tr key={r.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{r.origin?.code}</b> · {r.origin?.city}</Td>
                <Td><b style={{ color: "#1e1b4b" }}>{r.destination?.code}</b> · {r.destination?.city}</Td>
                <Td><Badge label={r.directFlight ? "Direct" : "Avec escale"} tone={r.directFlight ? "green" : "violet"} /></Td>
                <Td>{r.stops}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? "Modifier l'aéroport" : "Nouvel aéroport"} onClose={() => setForm(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Code IATA"><input style={inputStyle} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={3} /></Field>
            <Field label="Ville"><input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Pays"><input style={inputStyle} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Description (page « Nos Destinations »)">
                <textarea style={{ ...inputStyle, minHeight: 84, resize: "vertical", fontFamily: "inherit" }} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Image (URL, ex : /images/dest-toronto.webp)">
                <input style={inputStyle} value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </Field>
            </div>
          </div>
          {upsertA.error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{(upsertA.error as Error).message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setForm(null)}>Annuler</Btn>
            <Btn onClick={() => upsertA.mutate(form as unknown as Record<string, unknown>, { onSuccess: () => setForm(null) })} disabled={upsertA.isPending}>{upsertA.isPending ? "Enregistrement…" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
