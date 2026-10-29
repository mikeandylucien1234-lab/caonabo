"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { useCount, fmtUsd, fmtDateTime } from "@/lib/admin/api";
import { PageHead, Card, Badge, Loading } from "@/components/admin/ui";

interface UpcomingFlight {
  id: string;
  flightNumber: string;
  departAt: string;
  seatsAvailable: number;
  route: { origin: { city: string }; destination: { city: string } } | null;
}
interface RecentBooking {
  id: string;
  reference: string;
  totalUsdCents: number;
  status: string;
  createdAt: string;
  passengerCount: number;
}

const FLIGHT_SEL =
  "id,flightNumber,departAt,seatsAvailable,route:Route(origin:Airport!Route_originId_fkey(city),destination:Airport!Route_destinationId_fkey(city))";

export default function AdminDashboard() {
  const bookings = useCount("Booking");
  const users = useCount("User");
  const flights = useCount("Flight");

  const revenue = useQuery({
    queryKey: ["Booking", "revenue"],
    queryFn: async () => {
      const { data, error } = await getSupabase().from("Booking").select("totalUsdCents");
      if (error) throw new Error(error.message);
      return (data ?? []).reduce((s, b: { totalUsdCents: number | null }) => s + (b.totalUsdCents ?? 0), 0);
    },
  });

  const upcoming = useQuery<UpcomingFlight[]>({
    queryKey: ["Flight", "upcoming"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("Flight")
        .select(FLIGHT_SEL)
        .gte("departAt", new Date().toISOString())
        .order("departAt", { ascending: true })
        .limit(6);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as UpcomingFlight[];
    },
  });

  const recent = useQuery<RecentBooking[]>({
    queryKey: ["Booking", "recent"],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("Booking")
        .select("id,reference,totalUsdCents,status,createdAt,passengerCount")
        .order("createdAt", { ascending: false })
        .limit(6);
      if (error) throw new Error(error.message);
      return (data ?? []) as RecentBooking[];
    },
  });

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <PageHead title="Tableau de bord" subtitle={`Aperçu de l'activité de Caonabo Airlinje — ${today}`} />

      <div className="adm-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 24 }}>
        <Stat label="Réservations" value={bookings.data ?? "…"} icon="🎫" />
        <Stat label="Revenu total" value={revenue.data != null ? fmtUsd(revenue.data) : "…"} icon="💰" />
        <Stat label="Comptes clients" value={users.data ?? "…"} icon="👤" />
        <Stat label="Vols programmés" value={flights.data ?? "…"} icon="✈️" />
      </div>

      <div className="adm-cols" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <Card>
          <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 18, color: "#1e1b4b", margin: "0 0 14px" }}>Prochains vols</h2>
          {upcoming.isLoading ? <Loading /> : upcoming.data && upcoming.data.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {upcoming.data.map((f) => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f2f2f8" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 14.5 }}>
                      {f.route?.origin?.city ?? "?"} → {f.route?.destination?.city ?? "?"}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#8a8aa0" }}>{fmtDateTime(f.departAt)} · Vol {f.flightNumber}</div>
                  </div>
                  <Badge label={f.seatsAvailable <= 5 ? "Presque plein" : `${f.seatsAvailable} places`} tone={f.seatsAvailable <= 5 ? "amber" : "green"} />
                </div>
              ))}
            </div>
          ) : <Empty />}
        </Card>

        <Card>
          <h2 className="font-heading" style={{ fontWeight: 800, fontSize: 18, color: "#1e1b4b", margin: "0 0 14px" }}>Dernières réservations</h2>
          {recent.isLoading ? <Loading /> : recent.data && recent.data.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {recent.data.map((b) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f2f2f8" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: 14 }}>{b.reference}</div>
                    <div style={{ fontSize: 12.5, color: "#8a8aa0" }}>{b.passengerCount} pax · {fmtDateTime(b.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 15 }}>{fmtUsd(b.totalUsdCents)}</div>
                    <Badge label={b.status} tone={b.status === "confirmed" ? "green" : b.status === "cancelled" ? "red" : "grey"} />
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty />}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13.5, color: "#6b6b80", fontWeight: 600 }}>{label}</div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div className="font-heading" style={{ fontWeight: 800, fontSize: 30, color: "#0f0f2d", marginTop: 10 }}>{value}</div>
    </Card>
  );
}
function Empty() {
  return <div style={{ padding: 20, color: "#8a8aa0", fontSize: 14 }}>Aucune donnée pour le moment.</div>;
}
