import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeFareTags } from "@/lib/booking";
import type { FlightResultDTO } from "@/lib/data/types";

export const dynamic = "force-dynamic";

interface SearchBody {
  origin?: string; // code IATA
  destination?: string; // code IATA
  departDate?: string | null; // "YYYY-M-D" (issu du calendrier)
  returnDate?: string | null;
  tripType?: string;
}

/** Bornes [début, fin[ d'un jour à partir d'une chaîne "YYYY-M-D". */
function dayRange(dateStr?: string | null): { gte: Date; lt: Date } | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
  return { gte: start, lt: end };
}

export async function POST(req: Request) {
  let body: SearchBody;
  try {
    body = (await req.json()) as SearchBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { origin, destination } = body;
  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Origine et destination requises." },
      { status: 400 },
    );
  }
  if (origin === destination) {
    return NextResponse.json(
      { error: "L'origine et la destination doivent être différentes." },
      { status: 400 },
    );
  }

  const originAirport = await prisma.airport.findUnique({ where: { code: origin } });
  const destAirport = await prisma.airport.findUnique({
    where: { code: destination },
  });
  if (!originAirport || !destAirport) {
    return NextResponse.json(
      { error: "Aéroport inconnu." },
      { status: 404 },
    );
  }

  const range = dayRange(body.departDate);
  const flights = await prisma.flight.findMany({
    where: {
      route: {
        originId: originAirport.id,
        destinationId: destAirport.id,
      },
      departAt: range ? { gte: range.gte, lt: range.lt } : { gte: new Date() },
    },
    include: {
      route: { include: { origin: true, destination: true } },
    },
    orderBy: [{ departAt: "asc" }, { priceUsdCents: "asc" }],
    take: 40,
  });

  const fareTags = computeFareTags(
    flights.map((f) => ({
      id: f.id,
      priceUsdCents: f.priceUsdCents,
      durationMinutes: f.durationMinutes,
    })),
  );

  const results: FlightResultDTO[] = flights.map((f) => ({
    id: f.id,
    flightNumber: f.flightNumber,
    origin: {
      code: f.route.origin.code,
      city: f.route.origin.city,
      country: f.route.origin.country,
    },
    destination: {
      code: f.route.destination.code,
      city: f.route.destination.city,
      country: f.route.destination.country,
    },
    departAt: f.departAt.toISOString(),
    arriveAt: f.arriveAt.toISOString(),
    direct: f.route.directFlight,
    stops: f.route.stops,
    stopAirports: f.stopAirports ? f.stopAirports.split(",").filter(Boolean) : [],
    durationMinutes: f.durationMinutes,
    operatedBy: f.operatedBy,
    priceUsdCents: f.priceUsdCents,
    seatsAvailable: f.seatsAvailable,
    fareTags: fareTags.get(f.id) ?? [],
  }));

  return NextResponse.json({
    count: results.length,
    tripType: body.tripType ?? "aller-retour",
    flights: results,
  });
}
