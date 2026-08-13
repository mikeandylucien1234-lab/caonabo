"use client";

import { useState } from "react";
import { useRows, useUpsert, fmtDateTime } from "@/lib/admin/api";
import { PageHead, Card, Btn, Table, Td, Modal, Field, inputStyle, Loading, ErrorBox } from "@/components/admin/ui";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  milesBalance: number;
  createdAt: string;
}

export default function AdminUsers() {
  const { data, isLoading, error } = useRows<User>("User", "id,email,firstName,lastName,milesBalance,createdAt", { order: { column: "createdAt", ascending: false } });
  const upsert = useUpsert("User", ["User"]);
  const [edit, setEdit] = useState<{ id: string; name: string; miles: number } | null>(null);

  return (
    <div>
      <PageHead title="Utilisateurs" subtitle="Les comptes clients enregistrés sur le site." />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (data ?? []).length === 0 ? (
          <div style={{ padding: 30, color: "#8a8aa0", fontSize: 14 }}>Aucun compte client pour le moment.</div>
        ) : (
          <Table head={["Nom", "Email", "Miles Caonabo", "Inscrit le", ""]}>
            {(data ?? []).map((u) => (
              <tr key={u.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{u.firstName} {u.lastName}</b></Td>
                <Td>{u.email}</Td>
                <Td><b>{u.milesBalance.toLocaleString("fr-FR")}</b> ✦</Td>
                <Td style={{ fontSize: 13 }}>{fmtDateTime(u.createdAt)}</Td>
                <Td style={{ textAlign: "right" }}>
                  <Btn variant="ghost" onClick={() => setEdit({ id: u.id, name: `${u.firstName} ${u.lastName}`, miles: u.milesBalance })}>Ajuster les Miles</Btn>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {edit && (
        <Modal title={`Miles — ${edit.name}`} onClose={() => setEdit(null)}>
          <Field label="Solde de Miles Caonabo">
            <input type="number" style={inputStyle} value={edit.miles} onChange={(e) => setEdit({ ...edit, miles: Number(e.target.value) })} />
          </Field>
          {upsert.error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{(upsert.error as Error).message}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setEdit(null)}>Annuler</Btn>
            <Btn onClick={() => upsert.mutate({ id: edit.id, milesBalance: Number(edit.miles) }, { onSuccess: () => setEdit(null) })} disabled={upsert.isPending}>{upsert.isPending ? "Enregistrement…" : "Enregistrer"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
