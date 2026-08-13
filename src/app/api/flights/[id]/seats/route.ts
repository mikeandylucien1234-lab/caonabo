import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateSeats } from "@/lib/booking";
import type { SeatDTO } from "@/lib/data/types";

export const dynamic = "force-dynamic";

// GET /api/flights/:id/seats → plan de cabine (sièges matérialisés à la demande)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const flight = await prisma.flight.findUnique({ where: { id } });
  if (!flight) {
    return NextResponse.json({ error: "Vol introuvable." }, { status: 404 });
  }

  const seats = await getOrCreateSeats(id);
  const dto: SeatDTO[] = seats.map((s) => ({
    id: s.id,
    row: s.row,
    column: s.column,
    type: s.type,
    fareClass: s.fareClass,
    priceSupplementCents: s.priceSupplementCents,
    isAvailable: s.isAvailable,
  }));

  return NextResponse.json({ flightId: id, seats: dto });
}
