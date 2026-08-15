"use client";

import { useRows, fmtDateTime } from "@/lib/admin/api";
import { PageHead, Card, Btn, Badge, Table, Td, Loading, ErrorBox } from "@/components/admin/ui";

interface Subscriber {
  id: string;
  email: string;
  consentGiven: boolean;
  subscribedAt: string;
}

export default function AdminNewsletter() {
  const { data, isLoading, error } = useRows<Subscriber>("NewsletterSubscriber", "*", {
    order: { column: "subscribedAt", ascending: false },
    limit: 5000,
  });

  function exportCsv() {
    const rows = data ?? [];
    const header = "email,consentement,date_inscription";
    const body = rows
      .map((r) => `${r.email},${r.consentGiven ? "oui" : "non"},${new Date(r.subscribedAt).toISOString()}`)
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnes-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const count = data?.length ?? 0;

  return (
    <div>
      <PageHead
        title="Newsletter"
        subtitle="Les adresses inscrites via la section « Ne manquez jamais une offre »."
        action={<Btn onClick={exportCsv} disabled={count === 0}>⬇ Exporter en CSV</Btn>}
      />
      <Card style={{ padding: 0 }}>
        {isLoading ? <Loading /> : error ? <ErrorBox message={(error as Error).message} /> : count === 0 ? (
          <div style={{ padding: 28, color: "#8a8aa0", fontSize: 14 }}>Aucun abonné pour le moment.</div>
        ) : (
          <>
            <div style={{ padding: "16px 20px 4px", fontSize: 13, color: "#6b6b80" }}>
              <b style={{ color: "#1e1b4b" }}>{count}</b> abonné{count > 1 ? "s" : ""}
            </div>
            <Table head={["Email", "Consentement", "Date d'inscription"]}>
              {(data ?? []).map((s) => (
                <tr key={s.id}>
                  <Td><b style={{ color: "#1e1b4b" }}>{s.email}</b></Td>
                  <Td><Badge label={s.consentGiven ? "Accepté" : "Non"} tone={s.consentGiven ? "green" : "grey"} /></Td>
                  <Td style={{ fontSize: 13 }}>{fmtDateTime(s.subscribedAt)}</Td>
                </tr>
              ))}
            </Table>
          </>
        )}
      </Card>
    </div>
  );
}
