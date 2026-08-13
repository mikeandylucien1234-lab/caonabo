"use client";

import { useState } from "react";
import { useRows, useUpsert, useRemove, fmtUsd } from "@/lib/admin/api";
import { PageHead, Card, Btn, Badge, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface Dest {
  id?: string;
  slug: string;
  city: string;
  country: string;
  priceUsdCents: number;
  discountPct: number;
  imageUrl: string;
  originCode: string;
  destinationCode: string;
  sortOrder: number;
  featured: boolean;
}
const EMPTY: Dest = { slug: "", city: "", country: "", priceUsdCents: 0, discountPct: 0, imageUrl: "", originCode: "SCL", destinationCode: "PAP", sortOrder: 0, featured: true };

export default function AdminDestinations() {
  const { data, isLoading, error } = useRows<Dest>("Destination", "*", { order: { column: "sortOrder" } });
  const upsert = useUpsert("Destination", ["Destination"]);
  const remove = useRemove("Destination", ["Destination"]);
  const [form, setForm] = useState<Dest | null>(null);

  function save() {
    if (!form) return;
    upsert.mutate(
      { ...form, priceUsdCents: Number(form.priceUsdCents), discountPct: Number(form.discountPct), sortOrder: Number(form.sortOrder) },
      { onSuccess: () => setForm(null) },
    );
  }

  return (
    <div>
      <PageHead
        title="Destinations"
        subtitle="Les destinations populaires affichées sur la page d'accueil."
        action={<Btn onClick={() => setForm({ ...EMPTY })}>+ Nouvelle destination</Btn>}
      />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Ville", "Pays", "Route", "Prix", "Remise", "Ordre", ""]}>
            {(data ?? []).map((d) => (
              <tr key={d.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{d.city}</b> {d.featured && <Badge label="À la une" tone="violet" />}</Td>
                <Td>{d.country}</Td>
                <Td>{d.originCode} → {d.destinationCode}</Td>
                <Td><b>{fmtUsd(d.priceUsdCents)}</b></Td>
                <Td>{d.discountPct ? `-${d.discountPct}%` : "—"}</Td>
                <Td>{d.sortOrder}</Td>
                <Td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setForm(d)}>Modifier</Btn>
                    <Btn variant="danger" onClick={() => confirm(`Supprimer ${d.city} ?`) && remove.mutate(d.id!)}>Suppr.</Btn>
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? "Modifier la destination" : "Nouvelle destination"} onClose={() => setForm(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Ville"><input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Pays"><input style={inputStyle} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
            <Field label="Slug (URL)"><input style={inputStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Image (URL)"><input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></Field>
            <Field label="Code origine"><input style={inputStyle} value={form.originCode} onChange={(e) => setForm({ ...form, originCode: e.target.value.toUpperCase() })} /></Field>
            <Field label="Code destination"><input style={inputStyle} value={form.destinationCode} onChange={(e) => setForm({ ...form, destinationCode: e.target.value.toUpperCase() })} /></Field>
            <Field label="Prix (USD cents)"><input type="number" style={inputStyle} value={form.priceUsdCents} onChange={(e) => setForm({ ...form, priceUsdCents: Number(e.target.value) })} /></Field>
            <Field label="Remise (%)"><input type="number" style={inputStyle} value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })} /></Field>
            <Field label="Ordre d'affichage"><input type="number" style={inputStyle} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Field>
            <Field label="À la une"><select style={inputStyle} value={form.featured ? "1" : "0"} onChange={(e) => setForm({ ...form, featured: e.target.value === "1" })}><option value="1">Oui</option><option value="0">Non</option></select></Field>
          </div>
          {upsert.error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{(upsert.error as Error).message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setForm(null)}>Annuler</Btn>
            <Btn onClick={save} disabled={upsert.isPending}>{upsert.isPending ? "Enregistrement…" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
