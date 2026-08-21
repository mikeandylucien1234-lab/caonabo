import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkInWindow, checkInBlockReason, makeTicketNumber } from "@/lib/checkin";
import { generateBoardingPassForPassenger } from "@/lib/boardingPass";

export const dynamic = "force-dynamic";

interface CheckInBody {
  reference?: string;
  lastName?: string;
  passengerIds?: string[]; // omis = check-in de tous les passagers de la réservation
}

// POST /api/checkin → effectue le check-in (génère le billet + la carte
// d'embarquement) pour un ou plusieurs passagers d'une réservation.
// Idempotent : un passager déjà check-iné n'est jamais retraité, sa carte
// existante est simplement renvoyée.
export async function POST(req: Request) {
  let body: CheckInBody;
  try {
    body = (await req.json()) as CheckInBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const reference = (body.reference ?? "").trim().toUpperCase();
  const lastName = (body.lastName ?? "").trim();
  if (!reference || !lastName) {
    return NextResponse.json({ error: "Référence et nom de famille requis." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { passengers: { include: { seat: true } }, flight: true },
  });
  const matches =
    booking && booking.passengers.some((p) => p.lastName.toLowerCase() === lastName.toLowerCase());
  if (!booking || !matches) {
    return NextResponse.json({ error: "Aucune réservation trouvée pour ces informations." }, { status: 404 });
  }

  const win = checkInWindow(booking.flight.departAt);
  const blockReason = checkInBlockReason({
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.status,
    window: win.state,
    opensAt: win.opensAt,
  });
  if (blockReason) {
    return NextResponse.json({ error: blockReason, code: "CHECKIN_BLOCKED" }, { status: 409 });
  }

  const targetIds = body.passengerIds?.length
    ? booking.passengers.filter((p) => body.passengerIds!.includes(p.id)).map((p) => p.id)
    : booking.passengers.map((p) => p.id);

  if (targetIds.length === 0) {
    return NextResponse.json({ error: "Aucun passager à enregistrer." }, { status: 400 });
  }

  const results: Array<{ passengerId: string; ticketNumber: string; checkedIn: boolean }> = [];

  for (const passengerId of targetIds) {
    const passenger = booking.passengers.find((p) => p.id === passengerId)!;
    if (!passenger.seatId) {
      return NextResponse.json(
        { error: `${passenger.firstName} ${passenger.lastName} n'a pas encore de siège assigné. Choisissez un siège avant le check-in.` },
        { status: 409 },
      );
    }

    let ticketNumber = passenger.ticketNumber;
    let checkedInAt = passenger.checkedInAt;

    if (!checkedInAt) {
      // Génère un numéro de billet unique (retry en cas de collision improbable).
      if (!ticketNumber) {
        for (let attempt = 0; attempt < 5; attempt++) {
          const candidate = makeTicketNumber();
          const exists = await prisma.passenger.findUnique({ where: { ticketNumber: candidate } });
          if (!exists) {
            ticketNumber = candidate;
            break;
          }
        }
        if (!ticketNumber) {
          return NextResponse.json({ error: "Échec de génération du numéro de billet. Réessayez." }, { status: 500 });
        }
      }
      checkedInAt = new Date();
      await prisma.passenger.update({
        where: { id: passengerId },
        data: { ticketNumber, checkedInAt },
      });
    }

    try {
      const path = await generateBoardingPassForPassenger(passengerId);
      if (path) {
        await prisma.passenger.update({ where: { id: passengerId }, data: { boardingPassUrl: path } });
      }
    } catch {
      // Le check-in reste valide même si le PDF échoue à se générer/stocker ;
      // il pourra être régénéré depuis /api/checkin/boarding-pass.
    }

    results.push({ passengerId, ticketNumber: ticketNumber!, checkedIn: true });
  }

  return NextResponse.json({ reference: booking.reference, results });
}
