import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateSeats } from "@/lib/booking";
import { expireStalePendingBookings } from "@/lib/bookingCreate";
import type { SeatDTO } from "@/lib/data/types";

export const dynamic = "force-dynamic";

// GET /api/flights/:id/seats → plan de cabine (sièges matérialisés à la demande)
//   ?hold=<token> : les sièges tenus temporairement par CE tunnel restent
//   sélectionnables ; ceux tenus par un AUTRE tunnel (heldUntil futur) sont
//   marqués heldByOther pour ne pas pouvoir être choisis.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const holdToken = new URL(req.url).searchParams.get("hold");

  const flight = await prisma.flight.findUnique({ where: { id } });
  if (!flight) {
    return NextResponse.json({ error: "Vol introuvable." }, { status: 404 });
  }

  // Libère paresseusement les sièges des réservations impayées expirées (30 min)
  // pour qu'aucune place ne reste bloquée sans confirmation de paiement.
  await expireStalePendingBookings(id).catch(() => {});

  const seats = await getOrCreateSeats(id);
  const now = Date.now();
  const dto: SeatDTO[] = seats.map((s) => {
    const held =
      s.heldUntil != null && s.heldUntil.getTime() > now && s.heldBy !== holdToken;
    return {
      id: s.id,
      row: s.row,
      column: s.column,
      type: s.type,
      fareClass: s.fareClass,
      priceSupplementCents: s.priceSupplementCents,
      isAvailable: s.isAvailable,
      heldByOther: held,
    };
  });

  return NextResponse.json({ flightId: id, seats: dto });
}
