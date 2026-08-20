"use client";

import { useRows, fmtDateTime } from "@/lib/admin/api";
import { PageHead, Card, Table, Td, Loading, ErrorBox } from "@/components/admin/ui";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { data, isLoading, error } = useRows<User>("User", "id,email,firstName,lastName,createdAt", { order: { column: "createdAt", ascending: false } });

  return (
    <div>
      <PageHead title="Utilisateurs" subtitle="Les comptes clients enregistrés sur le site." />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : (data ?? []).length === 0 ? (
          <div style={{ padding: 30, color: "#8a8aa0", fontSize: 14 }}>Aucun compte client pour le moment.</div>
        ) : (
          <Table head={["Nom", "Email", "Inscrit le"]}>
            {(data ?? []).map((u) => (
              <tr key={u.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{u.firstName} {u.lastName}</b></Td>
                <Td>{u.email}</Td>
                <Td style={{ fontSize: 13 }}>{fmtDateTime(u.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
