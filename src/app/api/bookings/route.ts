import { NextResponse } from "next/server";
import { prepareBooking, type BookingBody } from "@/lib/bookingRequest";
import { runBookingTransaction, makeReference } from "@/lib/bookingCreate";

export const dynamic = "force-dynamic";

interface DemoBody extends BookingBody {
  paymentMethod?: string; // cosmétique (mode démo) : "card" | "paypal"
  cardLast4?: string; // cosmétique uniquement, jamais un vrai numéro
}

// Libellé du mode de paiement de DÉMONSTRATION (aucune vraie transaction).
function demoPaymentDisplay(method?: string, last4?: string): string {
  switch (method) {
    case "paypal":
      return "PayPal (démo)";
    case "card":
    default: {
      const l4 = (last4 ?? "").replace(/\D/g, "").slice(-4);
      return l4 ? `Carte •••• ${l4} (démo)` : "Carte (démo)";
    }
  }
}

// POST /api/bookings → réservation en PAIEMENT DÉMO (utilisé quand Flow n'est
// pas configuré). Crée une réservation confirmée + payée immédiatement.
export async function POST(req: Request) {
  let body: DemoBody;
  try {
    body = (await req.json()) as DemoBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const prep = await prepareBooking(body);
  if (!prep.ok) return NextResponse.json({ error: prep.error }, { status: prep.status });
  const { data } = prep;

  try {
    const booking = await runBookingTransaction({
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
      paymentMethodDisplay: demoPaymentDisplay(body.paymentMethod, body.cardLast4),
      status: "confirmed",
      paymentStatus: "PAID",
    });

    return NextResponse.json(
      {
        reference: booking.reference,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalUsdCents: booking.totalUsdCents,
        passengerCount: booking.passengerCount,
        breakdown: data.breakdown,
        paymentMethodDisplay: booking.paymentMethodDisplay,
        demo: true,
      },
      { status: 201 },
    );
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
}
