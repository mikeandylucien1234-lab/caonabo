"use client";

import { useRows, useUpsert, fmtDateTime } from "@/lib/admin/api";
import { useAuth } from "@/components/admin/AdminProviders";
import { PageHead, Card, Btn, Badge, Table, Td, Loading, ErrorBox } from "@/components/admin/ui";

interface Msg { id: string; name: string; email: string; phone: string | null; subject: string; message: string; isRead: boolean; createdAt: string }
interface Group { id: string; travelers: number; route: string; approxDates: string | null; email: string; phone: string | null; status: string; createdAt: string }

export default function AdminSettings() {
  const { email } = useAuth();
  const messages = useRows<Msg>("ContactMessage", "*", { order: { column: "createdAt", ascending: false } });
  const groups = useRows<Group>("GroupRequest", "*", { order: { column: "createdAt", ascending: false } });
  const markMsg = useUpsert("ContactMessage", ["ContactMessage"]);

  return (
    <div>
      <PageHead title="Paramètres" subtitle="Compte administrateur et boîte de réception." />

      <Card style={{ marginBottom: 24 }}>
        <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 17, color: "#1e1b4b", margin: "0 0 12px" }}>Compte administrateur</h2>
        <div style={{ fontSize: 14.5, color: "#3a3a55" }}>Connecté en tant que <b>{email}</b></div>
        <div style={{ fontSize: 13, color: "#8a8aa0", marginTop: 6 }}>
          L&apos;accès au back-office est protégé par Supabase Auth ; le rôle administrateur est vérifié côté base (RLS).
        </div>
      </Card>

      <Card style={{ padding: 0, marginBottom: 24 }}>
        <div style={{ padding: "16px 20px 4px", fontWeight: 800, color: "#1e1b4b", fontSize: 16 }}>Messages de contact</div>
        {messages.isLoading ? <Loading /> : messages.error ? <ErrorBox message={(messages.error as Error).message} /> : (messages.data ?? []).length === 0 ? (
          <div style={{ padding: 24, color: "#8a8aa0", fontSize: 14 }}>Aucun message.</div>
        ) : (
          <Table head={["Statut", "Expéditeur", "Sujet", "Message", "Date", ""]}>
            {(messages.data ?? []).map((m) => (
              <tr key={m.id}>
                <Td>{m.isRead ? <Badge label="Lu" tone="grey" /> : <Badge label="Non lu" tone="violet" />}</Td>
                <Td><b style={{ color: "#1e1b4b" }}>{m.name}</b><div style={{ fontSize: 12, color: "#8a8aa0" }}>{m.email}{m.phone ? ` · ${m.phone}` : ""}</div></Td>
                <Td>{m.subject}</Td>
                <Td style={{ maxWidth: 320, color: "#6b6b80" }}>{m.message.slice(0, 80)}{m.message.length > 80 ? "…" : ""}</Td>
                <Td style={{ fontSize: 13 }}>{fmtDateTime(m.createdAt)}</Td>
                <Td style={{ textAlign: "right" }}>
                  <Btn variant="ghost" onClick={() => markMsg.mutate({ id: m.id, isRead: !m.isRead })}>{m.isRead ? "Marquer non lu" : "Marquer lu"}</Btn>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px 4px", fontWeight: 800, color: "#1e1b4b", fontSize: 16 }}>Demandes de voyage de groupe</div>
        {groups.isLoading ? <Loading /> : groups.error ? <ErrorBox message={(groups.error as Error).message} /> : (groups.data ?? []).length === 0 ? (
          <div style={{ padding: 24, color: "#8a8aa0", fontSize: 14 }}>Aucune demande.</div>
        ) : (
          <Table head={["Voyageurs", "Route", "Dates", "Contact", "Date"]}>
            {(groups.data ?? []).map((g) => (
              <tr key={g.id}>
                <Td><b style={{ color: "#1e1b4b" }}>{g.travelers}</b></Td>
                <Td>{g.route}</Td>
                <Td>{g.approxDates ?? "—"}</Td>
                <Td style={{ fontSize: 13 }}>{g.email}{g.phone ? ` · ${g.phone}` : ""}</Td>
                <Td style={{ fontSize: 13 }}>{fmtDateTime(g.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
