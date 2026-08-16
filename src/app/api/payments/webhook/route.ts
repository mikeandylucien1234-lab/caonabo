import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFlowContext, getFlowStatus } from "@/lib/flow";
import { releaseBookingSeats, expireStalePendingBookings } from "@/lib/bookingCreate";
import { generateReceiptForBooking, formatReceiptNumber } from "@/lib/receipt";

export const dynamic = "force-dynamic";

// POST /api/payments/webhook → notification Flow (form-encoded { token }).
// AUTHENTICITÉ : le webhook ne transporte qu'un token ; on ne lui fait PAS
// confiance. On interroge directement l'API Flow (requête signée avec NOTRE
// secret) pour connaître l'état réel du paiement. Un tiers ne peut donc pas
// forger un « payé ». C'est la SEULE source de vérité pour marquer PAID.
export async function POST(req: Request) {
  let token = "";
  try {
    const form = await req.formData();
    token = String(form.get("token") ?? "");
  } catch {
    try {
      const body = (await req.json()) as { token?: string };
      token = body.token ?? "";
    } catch {
      /* ignore */
    }
  }
  if (!token) return NextResponse.json({ error: "token manquant" }, { status: 400 });

  // Vérifie l'état réel auprès de Flow
  let status;
  try {
    const ctx = await getFlowContext();
    status = await getFlowStatus(ctx, token);
  } catch {
    // On ne divulgue rien ; on renvoie 200 pour éviter des retries en boucle si
    // la config est absente, mais rien n'est modifié.
    return NextResponse.json({ ok: true });
  }

  const booking = await prisma.booking.findFirst({
    where: { OR: [{ flowPaymentToken: token }, { reference: status.commerceOrder }] },
  });
  if (!booking) return NextResponse.json({ ok: true });

  // 2 = payé · 3 = rejeté · 4 = annulé · 1 = en attente
  if (status.status === 2) {
    if (booking.paymentStatus === "PAID") return NextResponse.json({ ok: true }); // idempotent

    await prisma.$transaction(async (tx) => {
      const fresh = await tx.booking.findUnique({ where: { id: booking.id } });
      if (!fresh || fresh.paymentStatus === "PAID") return;

      // Numéro de comprobante séquentiel (atomique)
      const seqRows = await tx.$queryRaw<Array<{ nextval: bigint }>>`SELECT nextval('receipt_seq') AS nextval`;
      const seq = Number(seqRows[0]?.nextval ?? 0);
      const receiptNumber = formatReceiptNumber(seq, new Date().getFullYear());

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: "PAID",
          status: "confirmed",
          paidAt: new Date(),
          paymentMethodDisplay: status.media ? `Flow · ${status.media}` : "Flow",
          receiptNumber,
        },
      });

      // Miles : débit des Miles utilisés + crédit des Miles gagnés
      if (fresh.userId && (fresh.milesRedeemed > 0 || fresh.milesEarned > 0)) {
        const u = await tx.user.findUnique({ where: { id: fresh.userId } });
        if (u) {
          await tx.user.update({
            where: { id: u.id },
            data: { milesBalance: u.milesBalance - fresh.milesRedeemed + fresh.milesEarned },
          });
        }
      }
      // Les sièges sont déjà occupés (isAvailable=false) depuis la création :
      // ils deviennent définitifs, rien à modifier.
    });

    // Génère + stocke le comprobante (hors transaction : I/O réseau/stockage)
    try {
      const path = await generateReceiptForBooking(booking.id);
      if (path) {
        await prisma.booking.update({ where: { id: booking.id }, data: { receiptUrl: path } });
      }
    } catch {
      // Le comprobante pourra être régénéré ; le paiement reste valide.
    }

    return NextResponse.json({ ok: true });
  }

  if (status.status === 3 || status.status === 4) {
    if (booking.paymentStatus === "PENDING") {
      await prisma.$transaction(async (tx) => {
        const fresh = await tx.booking.findUnique({ where: { id: booking.id } });
        if (!fresh || fresh.paymentStatus !== "PENDING") return;
        await releaseBookingSeats(tx, booking.id, booking.flightId, booking.passengerCount);
        await tx.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "FAILED", status: "cancelled" },
        });
      });
    }
    return NextResponse.json({ ok: true });
  }

  // status 1 (en attente) : on balaie au passage les PENDING périmés
  await expireStalePendingBookings().catch(() => {});
  return NextResponse.json({ ok: true });
}
