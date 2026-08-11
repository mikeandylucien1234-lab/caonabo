import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/bookings/lookup?reference=CAO-XXXXX&lastName=Dupont
// Retrouve une réservation pour le check-in.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = (searchParams.get("reference") ?? "").trim().toUpperCase();
  const lastName = (searchParams.get("lastName") ?? "").trim();

  if (!reference || !lastName) {
    return NextResponse.json(
      { error: "Référence et nom de famille requis." },
      { status: 400 },
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: {
      passengers: true,
      flight: {
        include: { route: { include: { origin: true, destination: true } } },
      },
    },
  });

  const matches =
    booking &&
    booking.passengers.some(
      (p) => p.lastName.toLowerCase() === lastName.toLowerCase(),
    );

  if (!booking || !matches) {
    return NextResponse.json(
      { error: "Aucune réservation trouvée pour ces informations." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    reference: booking.reference,
    status: booking.status,
    tripType: booking.tripType,
    flight: {
      flightNumber: booking.flight.flightNumber,
      origin: booking.flight.route.origin.city,
      destination: booking.flight.route.destination.city,
      departAt: booking.flight.departAt.toISOString(),
    },
    passengers: booking.passengers.map((p) => ({
      firstName: p.firstName,
      lastName: p.lastName,
      type: p.type,
    })),
  });
}
