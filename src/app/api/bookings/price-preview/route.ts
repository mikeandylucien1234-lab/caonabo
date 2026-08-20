import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computePrice, type PricePassenger } from "@/lib/booking";

export const dynamic = "force-dynamic";

interface PreviewBody {
  flightId?: string;
  passengers?: PricePassenger[];
}

// POST /api/bookings/price-preview → recalcule le détail de prix côté serveur.
// Le client n'envoie jamais de montant : tout est relu et calculé ici.
export async function POST(req: Request) {
  let body: PreviewBody;
  try {
    body = (await req.json()) as PreviewBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { flightId } = body;
  const passengers = body.passengers ?? [];
  if (!flightId) {
    return NextResponse.json({ error: "flightId requis." }, { status: 400 });
  }
  if (passengers.length === 0) {
    return NextResponse.json(
      { error: "Au moins un passager requis." },
      { status: 400 },
    );
  }

  const flight = await prisma.flight.findUnique({ where: { id: flightId } });
  if (!flight) {
    return NextResponse.json({ error: "Vol introuvable." }, { status: 404 });
  }

  const breakdown = await computePrice({ flight, passengers });

  return NextResponse.json({ ...breakdown, currency: "USD" });
}
