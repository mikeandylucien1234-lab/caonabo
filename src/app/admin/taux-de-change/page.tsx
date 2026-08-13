"use client";

import { useState } from "react";
import { useRows, useUpsert, useRemove } from "@/lib/admin/api";
import { PageHead, Card, Btn, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface Rate {
  id?: string;
  currency: string;
  symbol: string;
  ratePerUsd: number;
}
const EMPTY: Rate = { currency: "", symbol: "", ratePerUsd: 1 };

export default function AdminRates() {
  const { data, isLoading, error } = useRows<Rate>("ExchangeRate", "*", { order: { column: "currency" } });
  const upsert = useUpsert("ExchangeRate", ["ExchangeRate"]);
  const remove = useRemove("ExchangeRate", ["ExchangeRate"]);
  const [form, setForm] = useState<Rate | null>(null);

  return (
    <div>
      <PageHead title="Taux de change" subtitle="Devise pivot : USD. Ces taux pilotent l'affichage des prix sur le site." action={<Btn onClick={() => setForm({ ...EMPTY })}>+ Nouveau taux</Btn>} />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Devise", "Symbole", "1 USD =", ""]}>
            {(data ?? []).map((r) => (
              <tr key={r.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{r.currency}</b></Td>
                <Td>{r.symbol}</Td>
                <Td><b>{r.ratePerUsd}</b> {r.currency}</Td>
                <Td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setForm(r)}>Modifier</Btn>
                    {r.currency !== "USD" && <Btn variant="danger" onClick={() => confirm(`Supprimer ${r.currency} ?`) && remove.mutate(r.id!)}>Suppr.</Btn>}
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? "Modifier le taux" : "Nouveau taux"} onClose={() => setForm(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Devise (ex : CLP)"><input style={inputStyle} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></Field>
            <Field label="Symbole (ex : CLP, $)"><input style={inputStyle} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} /></Field>
            <Field label="1 USD = (taux)"><input type="number" step="0.0001" style={inputStyle} value={form.ratePerUsd} onChange={(e) => setForm({ ...form, ratePerUsd: Number(e.target.value) })} /></Field>
          </div>
          {upsert.error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{(upsert.error as Error).message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setForm(null)}>Annuler</Btn>
            <Btn onClick={() => upsert.mutate({ ...form, ratePerUsd: Number(form.ratePerUsd) }, { onSuccess: () => setForm(null) })} disabled={upsert.isPending}>{upsert.isPending ? "Enregistrement…" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
