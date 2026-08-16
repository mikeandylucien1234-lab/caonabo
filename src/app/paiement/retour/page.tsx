import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/currency";
import AutoRefresh from "./AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "Résultat du paiement — Caonabo Airlinje" };

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const booking = ref
    ? await prisma.booking.findUnique({
        where: { reference: ref },
        select: {
          reference: true,
          paymentStatus: true,
          totalUsdCents: true,
          receiptUrl: true,
          contactEmail: true,
        },
      })
    : null;

  const state = booking?.paymentStatus ?? "NOT_FOUND";

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="" />
      <div className="hz" style={{ padding: "60px 56px 100px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center", background: "#fff", border: "1px solid #eceafa", borderRadius: 24, padding: 48, boxShadow: "0 8px 30px rgba(20,10,60,0.10)" }}>
          {state === "PAID" && (
            <>
              <div style={{ fontSize: 46 }}>✅</div>
              <h1 className="font-heading" style={{ fontSize: 26, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}>
                Paiement confirmé !
              </h1>
              <p style={{ color: "#5c5c7a", fontSize: 15 }}>Votre réservation est réglée et confirmée.</p>
              <div style={badge}>{booking!.reference}</div>
              <p style={{ color: "#7a7a92", fontSize: 14 }}>
                Montant payé : <b>{formatPrice(booking!.totalUsdCents, "USD")}</b>
              </p>
              {booking!.receiptUrl ? (
                <a href={`/api/receipts?ref=${encodeURIComponent(booking!.reference)}`} style={primaryBtn}>
                  📄 Télécharger le comprobante
                </a>
              ) : (
                <p style={{ color: "#8a8aa0", fontSize: 13, marginTop: 16 }}>
                  Le comprobante est en cours de génération, il sera disponible dans « Mes réservations ».
                </p>
              )}
            </>
          )}

          {state === "PENDING" && (
            <>
              <AutoRefresh seconds={5} />
              <div style={{ fontSize: 46 }}>⏳</div>
              <h1 className="font-heading" style={{ fontSize: 24, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}>
                Confirmation du paiement en cours…
              </h1>
              <p style={{ color: "#5c5c7a", fontSize: 15 }}>
                Nous attendons la confirmation de Flow. Cette page se rafraîchit automatiquement.
              </p>
              {booking && <div style={badge}>{booking.reference}</div>}
            </>
          )}

          {(state === "FAILED" || state === "EXPIRED") && (
            <>
              <div style={{ fontSize: 46 }}>❌</div>
              <h1 className="font-heading" style={{ fontSize: 24, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}>
                {state === "EXPIRED" ? "Paiement expiré" : "Paiement non abouti"}
              </h1>
              <p style={{ color: "#5c5c7a", fontSize: 15 }}>
                Le paiement n&apos;a pas été confirmé et les sièges ont été libérés. Vous pouvez reprendre votre réservation.
              </p>
              <Link href="/book" style={primaryBtn}>Reprendre ma réservation →</Link>
            </>
          )}

          {state === "NOT_FOUND" && (
            <>
              <div style={{ fontSize: 46 }}>🔍</div>
              <h1 className="font-heading" style={{ fontSize: 24, color: "#1e1b4b", margin: "12px 0 8px", fontWeight: 800 }}>
                Réservation introuvable
              </h1>
              <p style={{ color: "#5c5c7a", fontSize: 15 }}>Aucune réservation ne correspond à cette référence.</p>
              <Link href="/book" style={primaryBtn}>Nouvelle réservation →</Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const badge: React.CSSProperties = {
  display: "inline-block",
  margin: "12px 0 16px",
  background: "#f0ecfb",
  color: "#5b21b6",
  fontWeight: 800,
  fontSize: 22,
  letterSpacing: 2,
  padding: "12px 24px",
  borderRadius: 12,
};
const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  marginTop: 18,
  background: "#3d1e8a",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  padding: "13px 26px",
  borderRadius: 12,
  textDecoration: "none",
};
