import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/flights/availability?origin=SCL&destination=CAP
// Renvoie les dates (YYYY-MM-DD) ayant au moins un vol à venir + le prix mini du jour.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = (searchParams.get("origin") ?? "").toUpperCase();
  const destination = (searchParams.get("destination") ?? "").toUpperCase();

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "origin et destination requis." },
      { status: 400 },
    );
  }

  const [originAirport, destAirport] = await Promise.all([
    prisma.airport.findUnique({ where: { code: origin } }),
    prisma.airport.findUnique({ where: { code: destination } }),
  ]);
  if (!originAirport || !destAirport) {
    return NextResponse.json({ error: "Aéroport inconnu." }, { status: 404 });
  }

  const flights = await prisma.flight.findMany({
    where: {
      route: { originId: originAirport.id, destinationId: destAirport.id },
      departAt: { gte: new Date() },
    },
    select: { departAt: true, priceUsdCents: true },
    orderBy: { departAt: "asc" },
  });

  // Regroupe par jour (YYYY-MM-DD) avec le prix minimum
  const byDay = new Map<string, number>();
  for (const f of flights) {
    const d = f.departAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    const prev = byDay.get(key);
    if (prev === undefined || f.priceUsdCents < prev) byDay.set(key, f.priceUsdCents);
  }

  const dates = Array.from(byDay.entries())
    .map(([date, priceUsdCents]) => ({ date, priceUsdCents }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return NextResponse.json({
    origin: { code: originAirport.code, city: originAirport.city },
    destination: { code: destAirport.code, city: destAirport.city },
    dates,
  });
}
