import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrefs } from "@/lib/prefs";
import { getRates } from "@/lib/data/queries";
import { prepareBooking, type BookingBody } from "@/lib/bookingRequest";
import {
  runBookingTransaction,
  makeReference,
  expireStalePendingBookings,
  releaseBookingSeats,
} from "@/lib/bookingCreate";
import { getFlowContext, createFlowPayment } from "@/lib/flow";

export const dynamic = "force-dynamic";

function siteUrl(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return new URL(req.url).origin;
}

// POST /api/payments/create → crée une réservation EN ATTENTE (PENDING) avec
// verrouillage des sièges, puis crée un paiement Flow et renvoie l'URL de
// redirection. La réservation ne sera marquée payée que par le webhook.
export async function POST(req: Request) {
  let body: BookingBody;
  try {
    body = (await req.json()) as BookingBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  // Libère d'abord les sièges des réservations impayées expirées.
  if (body.flightId) {
    try {
      await expireStalePendingBookings(body.flightId);
    } catch {
      /* best-effort */
    }
  }

  const prep = await prepareBooking(body);
  if (!prep.ok) return NextResponse.json({ error: prep.error }, { status: prep.status });
  const { data } = prep;

  // Flow doit être configuré (sinon le frontend bascule en mode démo).
  let ctx;
  try {
    ctx = await getFlowContext();
  } catch {
    return NextResponse.json(
      { error: "Le paiement Flow n'est pas configuré.", code: "FLOW_NOT_CONFIGURED" },
      { status: 409 },
    );
  }

  // 1) Créer la réservation PENDING (verrou sièges partagé)
  let booking;
  try {
    booking = await runBookingTransaction({
      flightId: data.flight.id,
      reference: makeReference(),
      userId: data.user?.id ?? null,
      tripType: data.tripType,
      cabinClass: data.cabinClass,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      passengers: data.passengers,
      requestedSeatIds: data.requestedSeatIds,
      holdToken: data.holdToken,
      breakdown: data.breakdown,
      paymentMethodDisplay: null,
      status: "pending",
      paymentStatus: "PENDING",
      user: data.user,
      creditMilesNow: false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SEAT_TAKEN") {
      return NextResponse.json(
        {
          error:
            "Un des sièges choisis vient d'être réservé par un autre voyageur. Le plan a été actualisé : choisissez un autre siège.",
          code: "SEAT_TAKEN",
        },
        { status: 409 },
      );
    }
    if (msg === "NO_SEATS") {
      return NextResponse.json(
        { error: "Plus assez de places disponibles sur ce vol.", code: "NO_SEATS" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "La réservation a échoué. Réessayez." }, { status: 500 });
  }

  // 2) Montant Flow selon la devise active (CLP entier, sinon USD)
  const { currency } = await getPrefs();
  let flowCurrency = "USD";
  let amount = Math.round(data.breakdown.totalUsdCents) / 100; // USD, 2 décimales
  if (currency === "CLP") {
    let rate = 950;
    try {
      const rates = await getRates();
      rate = rates.CLP?.ratePerUsd ?? 950;
    } catch {
      /* fallback */
    }
    flowCurrency = "CLP";
    amount = Math.round((data.breakdown.totalUsdCents / 100) * rate); // CLP entier
  }

  const base = siteUrl(req);
  // 3) Créer le paiement Flow
  try {
    const payment = await createFlowPayment(ctx, {
      commerceOrder: booking.reference,
      subject: `Caonabo Airlinje - ${booking.reference}`,
      amount,
      currency: flowCurrency,
      email: data.contactEmail,
      urlConfirmation: `${base}/api/payments/webhook`,
      urlReturn: `${base}/api/payments/return?ref=${booking.reference}`,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { flowPaymentToken: payment.token, flowPaymentUrl: payment.redirectUrl },
    });

    return NextResponse.json({ reference: booking.reference, redirectUrl: payment.redirectUrl });
  } catch {
    // Échec de création du paiement : ne pas bloquer les sièges → libère + FAILED
    await prisma
      .$transaction(async (tx) => {
        await releaseBookingSeats(tx, booking.id, booking.flightId, booking.passengerCount);
        await tx.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: "FAILED", status: "cancelled" },
        });
      })
      .catch(() => {});
    return NextResponse.json(
      { error: "Impossible d'initier le paiement Flow. Réessayez plus tard." },
      { status: 502 },
    );
  }
}
