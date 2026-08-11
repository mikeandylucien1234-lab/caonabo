import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
}

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return `CAO-${s}`;
}

// POST /api/bookings → crée une réservation.
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

  const totalUsdCents = flight.priceUsdCents * passengers.length;

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        reference: makeReference(),
        flightId,
        tripType: body.tripType ?? "aller-retour",
        contactEmail,
        contactPhone: body.contactPhone ?? null,
        passengerCount: passengers.length,
        totalUsdCents,
        currency: "USD",
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

    return created;
  });

  return NextResponse.json(
    {
      reference: booking.reference,
      status: booking.status,
      totalUsdCents: booking.totalUsdCents,
      passengerCount: booking.passengerCount,
    },
    { status: 201 },
  );
}
