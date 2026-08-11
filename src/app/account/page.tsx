import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/sections/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { getUserBookings } from "@/lib/data/queries";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon compte — Caonabo Airlinje" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const bookings = await getUserBookings(user.id);

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/account" />

      <div style={{ padding: "48px 56px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1
              className="font-heading"
              style={{ fontWeight: 800, fontSize: 40, color: "#0f0f2d", margin: 0 }}
            >
              Bonjour, {user.firstName} 👋
            </h1>
            <p style={{ color: "#5c5c7a", fontSize: 15, marginTop: 10 }}>{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* solde Miles */}
        <div
          style={{
            marginTop: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: "linear-gradient(120deg,#3d1e8a,#5b21b6)",
            color: "#fff",
            padding: "20px 28px",
            borderRadius: 18,
          }}
        >
          <span style={{ fontSize: 30 }}>✦</span>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Vos Miles Caonabo</div>
            <div className="font-heading" style={{ fontSize: 30, fontWeight: 800 }}>
              {user.milesBalance.toLocaleString("fr-FR")} Miles
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              1 Mile = 0,01 $ · utilisables au paiement
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "40px 56px 100px" }}>
        <h2
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 24, color: "#0f0f2d", margin: "0 0 20px" }}
        >
          Mes réservations
        </h2>

        {bookings.length === 0 ? (
          <div
            style={{
              padding: "40px",
              borderRadius: 16,
              background: "#faf9fc",
              textAlign: "center",
              color: "#5c5c7a",
            }}
          >
            Vous n&apos;avez pas encore de réservation.{" "}
            <Link href="/book" style={{ fontWeight: 600 }}>
              Réserver un vol →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #f0eef7",
                  borderRadius: 14,
                  padding: "18px 22px",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 800, color: "#0f0f2d", fontSize: 17 }}>
                      {b.flight.origin} → {b.flight.destination}
                    </span>
                    <span
                      style={{
                        background: "#e6f6ec",
                        color: "#1f9d55",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {b.status === "confirmed" ? "Confirmée" : b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#7a7a92", marginTop: 4 }}>
                    Réf. <b style={{ color: "#5b21b6" }}>{b.reference}</b> · Vol{" "}
                    {b.flight.flightNumber} ·{" "}
                    {new Date(b.flight.departAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {b.passengerCount} passager{b.passengerCount > 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#8a8aa0", marginTop: 4 }}>
                    +{b.milesEarned} Miles gagnés
                    {b.milesRedeemed > 0 ? ` · ${b.milesRedeemed} Miles utilisés` : ""}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: "#3d1e8a", fontSize: 20 }}>
                  {formatPrice(b.totalUsdCents, "USD")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
