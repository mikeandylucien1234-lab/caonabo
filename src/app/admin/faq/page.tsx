"use client";

import { useState } from "react";
import { useRows, useUpsert, useRemove } from "@/lib/admin/api";
import { PageHead, Card, Btn, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface Faq {
  id?: string;
  question: string;
  answer: string;
  sortOrder: number;
}
const EMPTY: Faq = { question: "", answer: "", sortOrder: 0 };

export default function AdminFaq() {
  const { data, isLoading, error } = useRows<Faq>("Faq", "*", { order: { column: "sortOrder" } });
  const upsert = useUpsert("Faq", ["Faq"]);
  const remove = useRemove("Faq", ["Faq"]);
  const [form, setForm] = useState<Faq | null>(null);

  return (
    <div>
      <PageHead title="FAQ" subtitle="Les questions fréquentes affichées sur la page d'accueil." action={<Btn onClick={() => setForm({ ...EMPTY })}>+ Nouvelle question</Btn>} />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (
          <Table head={["Ordre", "Question", "Réponse", ""]}>
            {(data ?? []).map((f) => (
              <tr key={f.id}>
                <Td>{f.sortOrder}</Td>
                <Td><b style={{ color: "#1e1b4b" }}>{f.question}</b></Td>
                <Td style={{ maxWidth: 380, color: "#6b6b80" }}>{f.answer.slice(0, 90)}{f.answer.length > 90 ? "…" : ""}</Td>
                <Td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  <span style={{ display: "inline-flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setForm(f)}>Modifier</Btn>
                    <Btn variant="danger" onClick={() => confirm("Supprimer cette question ?") && remove.mutate(f.id!)}>Suppr.</Btn>
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {form && (
        <Modal title={form.id ? "Modifier la question" : "Nouvelle question"} onClose={() => setForm(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Question"><input style={inputStyle} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></Field>
            <Field label="Réponse"><textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical", fontFamily: "inherit" }} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></Field>
            <Field label="Ordre d'affichage"><input type="number" style={inputStyle} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Field>
          </div>
          {upsert.error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{(upsert.error as Error).message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setForm(null)}>Annuler</Btn>
            <Btn onClick={() => upsert.mutate({ ...form, sortOrder: Number(form.sortOrder) }, { onSuccess: () => setForm(null) })} disabled={upsert.isPending}>{upsert.isPending ? "Enregistrement…" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
