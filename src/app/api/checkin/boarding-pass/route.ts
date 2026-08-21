import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBoardingPassForPassenger, signedBoardingPassUrl } from "@/lib/boardingPass";

export const dynamic = "force-dynamic";

// GET /api/checkin/boarding-pass?reference=...&lastName=...&passengerId=...
// Redirige vers une URL signée (temporaire) du PDF de la carte d'embarquement.
// Régénère le PDF s'il n'existe pas encore (ex: stockage indisponible lors du
// check-in) mais ne redemande jamais un check-in déjà effectué.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = (searchParams.get("reference") ?? "").trim().toUpperCase();
  const lastName = (searchParams.get("lastName") ?? "").trim();
  const passengerId = searchParams.get("passengerId") ?? "";

  if (!reference || !lastName || !passengerId) {
    return NextResponse.json({ error: "Référence, nom et passager requis." }, { status: 400 });
  }

  const passenger = await prisma.passenger.findUnique({
    where: { id: passengerId },
    include: { booking: true },
  });
  if (
    !passenger ||
    passenger.booking.reference !== reference ||
    passenger.lastName.toLowerCase() !== lastName.toLowerCase()
  ) {
    return NextResponse.json({ error: "Carte d'embarquement introuvable." }, { status: 404 });
  }
  if (!passenger.checkedInAt) {
    return NextResponse.json({ error: "Ce passager n'a pas encore effectué son check-in." }, { status: 409 });
  }

  let objectPath = passenger.boardingPassUrl;
  if (!objectPath) {
    objectPath = await generateBoardingPassForPassenger(passengerId);
    if (objectPath) {
      await prisma.passenger.update({ where: { id: passengerId }, data: { boardingPassUrl: objectPath } });
    }
  }
  if (!objectPath) {
    return NextResponse.json(
      { error: "Stockage des cartes d'embarquement non configuré (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }

  const url = await signedBoardingPassUrl(objectPath);
  if (!url) {
    return NextResponse.json({ error: "Impossible de générer le lien de téléchargement." }, { status: 503 });
  }
  return NextResponse.redirect(url);
}
