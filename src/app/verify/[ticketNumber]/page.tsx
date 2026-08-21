import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatTicketNumber } from "@/lib/checkin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vérification de billet — Caonabo Airlinje" };

// Page cible du QR code de la carte d'embarquement (agent de porte). N'expose
// volontairement AUCUNE donnée sensible (pas de document, pas de contact) :
// juste de quoi confirmer visuellement l'identité + le vol à la porte.
export default async function VerifyTicketPage({
  params,
}: {
  params: Promise<{ ticketNumber: string }>;
}) {
  const { ticketNumber } = await params;
  const passenger = await prisma.passenger.findUnique({
    where: { ticketNumber },
    include: {
      seat: true,
      booking: {
        include: {
          flight: { include: { route: { include: { origin: true, destination: true } } } },
        },
      },
    },
  });

  const valid = Boolean(passenger?.checkedInAt);
  const flight = passenger?.booking.flight;

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="" />
      <div className="hz" style={{ padding: "60px 56px 100px", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            background: "#fff",
            border: "1px solid #eceafa",
            borderRadius: 24,
            padding: 44,
            boxShadow: "0 8px 30px rgba(20,10,60,0.10)",
          }}
        >
          {valid && passenger && flight ? (
            <>
              <div style={{ fontSize: 46 }}>✅</div>
              <h1 className="font-heading" style={{ fontSize: 24, color: "#1e1b4b", margin: "12px 0 4px", fontWeight: 800 }}>
                Billet valide
              </h1>
              <div style={{ color: "#8a8aa0", fontSize: 13, marginBottom: 20 }}>
                {formatTicketNumber(ticketNumber)}
              </div>
              <div style={{ background: "#faf9fc", border: "1px solid #eceafa", borderRadius: 14, padding: 20, textAlign: "left" }}>
                <Row k="Passager" v={`${civ(passenger.civility)} ${passenger.firstName} ${passenger.lastName}`} />
                <Row k="Vol" v={`${flight.flightNumber} — ${flight.route.origin.code} → ${flight.route.destination.code}`} />
                <Row
                  k="Date"
                  v={new Date(flight.departAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                />
                <Row k="Classe" v={passenger.booking.cabinClass} />
                <Row k="Siège" v={passenger.seat ? `${passenger.seat.row}${passenger.seat.column}` : "—"} last />
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 46 }}>❌</div>
              <h1 className="font-heading" style={{ fontSize: 24, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}>
                Billet invalide
              </h1>
              <p style={{ color: "#5c5c7a", fontSize: 14 }}>
                Ce numéro de billet ne correspond à aucun check-in valide.
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function civ(c: string): string {
  return c === "MME" ? "Mme" : c === "MLLE" ? "Mlle" : "M.";
}
function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: last ? "none" : "1px solid #eceafa",
        fontSize: 14,
      }}
    >
      <span style={{ color: "#8a8aa0" }}>{k}</span>
      <span style={{ fontWeight: 700, color: "#1e1b4b" }}>{v}</span>
    </div>
  );
}
