import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Durée d'un verrou temporaire « en cours de sélection » : 10 minutes.
const HOLD_MS = 10 * 60 * 1000;

interface HoldBody {
  seatId?: string;
  holdToken?: string;
}

// POST /api/flights/:id/seats/hold → pose (ou prolonge) un verrou temporaire sur
// un siège pour CE tunnel. Empêche deux tunnels de viser le même siège.
// La mise à jour est CONDITIONNELLE et ATOMIQUE (updateMany) : elle ne réussit
// que si le siège est libre et non tenu par un autre (ou verrou expiré).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: flightId } = await params;
  let body: HoldBody;
  try {
    body = (await req.json()) as HoldBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }
  const { seatId, holdToken } = body;
  if (!seatId || !holdToken) {
    return NextResponse.json(
      { error: "seatId et holdToken requis." },
      { status: 400 },
    );
  }

  const now = new Date();
  const until = new Date(now.getTime() + HOLD_MS);

  const upd = await prisma.seat.updateMany({
    where: {
      id: seatId,
      flightId,
      isAvailable: true,
      OR: [
        { heldUntil: null },
        { heldUntil: { lt: now } }, // verrou expiré → réattribuable
        { heldBy: holdToken }, // déjà tenu par ce tunnel → on prolonge
      ],
    },
    data: { heldUntil: until, heldBy: holdToken },
  });

  if (upd.count !== 1) {
    return NextResponse.json(
      {
        error: "Ce siège vient d'être choisi par un autre voyageur.",
        code: "SEAT_HELD",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, heldUntil: until.toISOString() });
}

// DELETE /api/flights/:id/seats/hold → libère un verrou tenu par ce tunnel
// (désélection d'un siège, ou abandon du tunnel). N'affecte que nos propres
// verrous : on ne peut pas libérer le siège d'un autre.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: flightId } = await params;
  let body: HoldBody;
  try {
    body = (await req.json()) as HoldBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }
  const { seatId, holdToken } = body;
  if (!seatId || !holdToken) {
    return NextResponse.json(
      { error: "seatId et holdToken requis." },
      { status: 400 },
    );
  }

  await prisma.seat.updateMany({
    where: { id: seatId, flightId, heldBy: holdToken, isAvailable: true },
    data: { heldUntil: null, heldBy: null },
  });

  return NextResponse.json({ ok: true });
}
