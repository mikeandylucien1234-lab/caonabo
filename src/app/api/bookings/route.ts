import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PassengerInput {
  firstName?: string;
  lastName?: string;
  type?: string; // adult | child | infant
}

interface BookingBody {
  flightId?: string;
  tripType?: string;
  contactEmail?: string;
  contactPhone?: string;
  passengers?: PassengerInput[];
  useMiles?: number; // Miles à utiliser (1 Mile = 1 cent USD), compte connecté requis
}

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return `CAO-${s}`;
}

// POST /api/bookings → crée une réservation (invité ou compte connecté).
export async function POST(req: Request) {
  let body: BookingBody;
  try {
    body = (await req.json()) as BookingBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { flightId, contactEmail } = body;
  const passengers = (body.passengers ?? []).filter(
    (p) => p.firstName && p.lastName,
  );

  if (!flightId) {
    return NextResponse.json({ error: "flightId requis." }, { status: 400 });
  }
  if (!contactEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return NextResponse.json(
      { error: "Email de contact valide requis." },
      { status: 400 },
    );
  }
  if (passengers.length === 0) {
    return NextResponse.json(
      { error: "Au moins un passager (prénom + nom) requis." },
      { status: 400 },
    );
  }

  const flight = await prisma.flight.findUnique({ where: { id: flightId } });
  if (!flight) {
    return NextResponse.json({ error: "Vol introuvable." }, { status: 404 });
  }
  if (flight.seatsAvailable < passengers.length) {
    return NextResponse.json(
      { error: "Pas assez de places disponibles sur ce vol." },
      { status: 409 },
    );
  }

  const user = await getCurrentUser();

  const grossUsdCents = flight.priceUsdCents * passengers.length;

  // Miles : 1 Mile = 1 cent USD. Utilisables uniquement si connecté, plafonnés
  // au solde et au montant total.
  let milesRedeemed = 0;
  if (user && body.useMiles && body.useMiles > 0) {
    milesRedeemed = Math.min(
      Math.floor(body.useMiles),
      user.milesBalance,
      grossUsdCents,
    );
  }
  const paidUsdCents = grossUsdCents - milesRedeemed;
  // Miles gagnés : 1 Mile par dollar sur le prix du billet (avant remise Miles).
  const milesEarned = Math.floor(grossUsdCents / 100);

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        reference: makeReference(),
        flightId,
        userId: user?.id ?? null,
        tripType: body.tripType ?? "aller-retour",
        contactEmail,
        contactPhone: body.contactPhone ?? null,
        passengerCount: passengers.length,
        totalUsdCents: paidUsdCents,
        currency: "USD",
        milesEarned,
        milesRedeemed,
        status: "confirmed",
        passengers: {
          create: passengers.map((p) => ({
            firstName: p.firstName!,
            lastName: p.lastName!,
            type: p.type ?? "adult",
          })),
        },
      },
      include: { passengers: true },
    });

    await tx.flight.update({
      where: { id: flightId },
      data: { seatsAvailable: flight.seatsAvailable - passengers.length },
    });

    // Mise à jour du solde de Miles du compte connecté
    if (user) {
      await tx.user.update({
        where: { id: user.id },
        data: { milesBalance: user.milesBalance - milesRedeemed + milesEarned },
      });
    }

    return created;
  });

  return NextResponse.json(
    {
      reference: booking.reference,
      status: booking.status,
      totalUsdCents: booking.totalUsdCents,
      passengerCount: booking.passengerCount,
      milesEarned,
      milesRedeemed,
      newMilesBalance: user
        ? user.milesBalance - milesRedeemed + milesEarned
        : null,
    },
    { status: 201 },
  );
}
