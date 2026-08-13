"use client";

import { useState } from "react";
import { useRows, useUpsert, useRemove, fmtUsd } from "@/lib/admin/api";
import { PageHead, Card, Btn, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface Promo {
  id?: string;
  slug: string;
  title: string;
  routeLabel: string;
  category: string;
  tag: string;
  accentColor: string;
  priceUsdCents: number;
  oldPriceUsdCents: number;
  imageUrl: string;
  originCode: string;
  destinationCode: string;
  sortOrder: number;
}
const EMPTY: Promo = { slug: "", title: "", routeLabel: "", category: "", tag: "", accentColor: "#5b21b6", priceUsdCents: 0, oldPriceUsdCents: 0, imageUrl: "", originCode: "SCL", destinationCode: "CAP", sortOrder: 0 };

export default function AdminPromotions() {
  const { data, isLoading, error } = useRows<Promo>("Promotion", "*", { order: { column: "sortOrder" } });
  const upsert = useUpsert("Promotion", ["Promotion"]);
  const remove = useRemove("Promotion", ["Promotion"]);
  const [form, setForm] = useState<Promo | null>(null);

  function save() {
    if (!form) return;
    upsert.mutate(
      { ...form, priceUsdCents: Number(form.priceUsdCents), oldPriceUsdCents: Number(form.oldPriceUsdCents), sortOrder: Number(form.sortOrder) },
      { onSuccess: () => setForm(null) },
    );
  }

  return (
    <div>
      <PageHead title="Promotions" subtitle="Les offres de la section « Promotions Caonabo »." action={<Btn onClick={() => setForm({ ...EMPTY })}>+ Nouvelle promotion</Btn>} />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Titre", "Catégorie", "Route", "Prix promo", "Ancien prix", ""]}>
            {(data ?? []).map((p) => (
              <tr key={p.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{p.title}</b><div style={{ fontSize: 12, color: "#8a8aa0" }}>{p.tag}</div></Td>
                <Td>{p.category}</Td>
                <Td>{p.originCode} → {p.destinationCode}</Td>
                <Td><b style={{ color: p.accentColor }}>{fmtUsd(p.priceUsdCents)}</b></Td>
                <Td><span style={{ textDecoration: "line-through", color: "#b4b2c4" }}>{fmtUsd(p.oldPriceUsdCents)}</span></Td>
                <Td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setForm(p)}>Modifier</Btn>
                    <Btn variant="danger" onClick={() => confirm(`Supprimer « ${p.title} » ?`) && remove.mutate(p.id!)}>Suppr.</Btn>
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? "Modifier la promotion" : "Nouvelle promotion"} onClose={() => setForm(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Titre"><input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Slug (URL)"><input style={inputStyle} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
            <Field label="Libellé de route"><input style={inputStyle} value={form.routeLabel} onChange={(e) => setForm({ ...form, routeLabel: e.target.value })} /></Field>
            <Field label="Catégorie"><input style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Tag"><input style={inputStyle} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></Field>
            <Field label="Couleur d'accent"><input style={inputStyle} value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} /></Field>
            <Field label="Code origine"><input style={inputStyle} value={form.originCode} onChange={(e) => setForm({ ...form, originCode: e.target.value.toUpperCase() })} /></Field>
            <Field label="Code destination"><input style={inputStyle} value={form.destinationCode} onChange={(e) => setForm({ ...form, destinationCode: e.target.value.toUpperCase() })} /></Field>
            <Field label="Prix promo (USD cents)"><input type="number" style={inputStyle} value={form.priceUsdCents} onChange={(e) => setForm({ ...form, priceUsdCents: Number(e.target.value) })} /></Field>
            <Field label="Ancien prix (USD cents)"><input type="number" style={inputStyle} value={form.oldPriceUsdCents} onChange={(e) => setForm({ ...form, oldPriceUsdCents: Number(e.target.value) })} /></Field>
            <Field label="Image (URL)"><input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></Field>
            <Field label="Ordre d'affichage"><input type="number" style={inputStyle} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Field>
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
