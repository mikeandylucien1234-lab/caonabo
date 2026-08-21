import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkInWindow, checkInBlockReason, boardingTimeFor } from "@/lib/checkin";

export const dynamic = "force-dynamic";

// GET /api/bookings/lookup?reference=CAO-XXXXX&lastName=Dupont
// Retrouve une réservation pour le check-in : statut de la fenêtre de
// check-in, et pour chaque passager son siège + son état de check-in.
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
      passengers: { include: { seat: true } },
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

  const win = checkInWindow(booking.flight.departAt);
  const blockReason = checkInBlockReason({
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.status,
    window: win.state,
    opensAt: win.opensAt,
  });

  return NextResponse.json({
    reference: booking.reference,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    tripType: booking.tripType,
    cabinClass: booking.cabinClass,
    checkIn: {
      canCheckIn: blockReason === null,
      blockReason,
      windowState: win.state,
      opensAt: win.opensAt.toISOString(),
      closesAt: win.closesAt.toISOString(),
      boardingAt: boardingTimeFor(booking.flight.departAt).toISOString(),
    },
    flight: {
      flightNumber: booking.flight.flightNumber,
      origin: booking.flight.route.origin.city,
      originCode: booking.flight.route.origin.code,
      destination: booking.flight.route.destination.city,
      destinationCode: booking.flight.route.destination.code,
      departAt: booking.flight.departAt.toISOString(),
      arriveAt: booking.flight.arriveAt.toISOString(),
      terminal: booking.flight.terminal,
      gate: booking.flight.gate,
    },
    passengers: booking.passengers.map((p) => ({
      id: p.id,
      civility: p.civility,
      firstName: p.firstName,
      lastName: p.lastName,
      type: p.type,
      seatLabel: p.seat ? `${p.seat.row}${p.seat.column}` : null,
      seatId: p.seatId,
      checkedIn: Boolean(p.checkedInAt),
      hasBoardingPass: Boolean(p.boardingPassUrl),
    })),
  });
}
