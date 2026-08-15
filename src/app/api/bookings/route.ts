import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computePrice } from "@/lib/booking";

export const dynamic = "force-dynamic";

interface PassengerInput {
  civility?: string; // M | MME | MLLE
  firstName?: string;
  lastName?: string;
  type?: string; // adult | child | infant
  birthDate?: string | null;
  nationality?: string | null;
  documentType?: string | null; // PASSPORT | ID_CARD
  documentNumber?: string | null;
  documentExpiry?: string | null;
  documentIssuingCountry?: string | null;
  phone?: string | null;
  evisaFileUrl?: string | null;
  seatId?: string | null;
  baggageOptionId?: string | null;
}

interface BookingBody {
  flightId?: string;
  tripType?: string;
  cabinClass?: string;
  contactEmail?: string;
  contactPhone?: string;
  passengers?: PassengerInput[];
  useMiles?: number;
  paymentMethod?: string; // cosmétique : "card" | "miles-only" | "paypal"…
  cardLast4?: string; // cosmétique uniquement, jamais un vrai numéro
}

const CIVILITIES = new Set(["M", "MME", "MLLE"]);
const DOC_TYPES = new Set(["PASSPORT", "ID_CARD"]);

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return `CAO-${s}`;
}

function parseDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// Libellé cosmétique du mode de paiement (aucune vraie transaction).
function paymentDisplay(method?: string, last4?: string): string {
  switch (method) {
    case "miles-only":
      return "Réglé en Miles Caonabo";
    case "paypal":
      return "PayPal (simulé)";
    case "card":
    default: {
      const l4 = (last4 ?? "").replace(/\D/g, "").slice(-4);
      return l4 ? `Carte •••• ${l4}` : "Carte (simulée)";
    }
  }
}

// POST /api/bookings → crée une réservation complète (documents, sièges, bagages).
export async function POST(req: Request) {
  let body: BookingBody;
  try {
    body = (await req.json()) as BookingBody;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const { flightId, contactEmail } = body;
  const passengers = (body.passengers ?? []).filter(
    (p) => p.firstName && p.lastName,
  );

  if (!flightId) {
    return NextResponse.json({ error: "flightId requis." }, { status: 400 });
  }
  if (!contactEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return NextResponse.json(
      { error: "Email de contact valide requis." },
      { status: 400 },
    );
  }
  if (passengers.length === 0) {
    return NextResponse.json(
      { error: "Au moins un passager (prénom + nom) requis." },
      { status: 400 },
    );
  }
  // Validation des valeurs contrôlées
  for (const p of passengers) {
    if (p.civility && !CIVILITIES.has(p.civility)) {
      return NextResponse.json(
        { error: "Civilité invalide." },
        { status: 400 },
      );
    }
    if (p.documentType && !DOC_TYPES.has(p.documentType)) {
      return NextResponse.json(
        { error: "Type de document invalide." },
        { status: 400 },
      );
    }
  }

  const flight = await prisma.flight.findUnique({ where: { id: flightId } });
  if (!flight) {
    return NextResponse.json({ error: "Vol introuvable." }, { status: 404 });
  }
  if (flight.seatsAvailable < passengers.length) {
    return NextResponse.json(
      { error: "Pas assez de places disponibles sur ce vol." },
      { status: 409 },
    );
  }

  // Sièges demandés : uniques, appartenant à ce vol
  const requestedSeatIds = passengers
    .map((p) => p.seatId)
    .filter((s): s is string => Boolean(s));
  if (new Set(requestedSeatIds).size !== requestedSeatIds.length) {
    return NextResponse.json(
      { error: "Un même siège a été choisi pour plusieurs passagers." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();

  // Prix recalculé côté serveur (jamais confiance au client)
  const breakdown = await computePrice({
    flight,
    passengers,
    useMiles: body.useMiles,
    userMilesBalance: user?.milesBalance ?? null,
  });

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Verrouillage optimiste des sièges : ne marque occupés que ceux
      // encore disponibles ; si le compte ne correspond pas → conflit.
      if (requestedSeatIds.length > 0) {
        const upd = await tx.seat.updateMany({
          where: {
            id: { in: requestedSeatIds },
            flightId,
            isAvailable: true,
          },
          data: { isAvailable: false },
        });
        if (upd.count !== requestedSeatIds.length) {
          throw new Error("SEAT_TAKEN");
        }
      }

      // Contrôle de concurrence sur le nombre de places
      const fresh = await tx.flight.findUnique({ where: { id: flightId } });
      if (!fresh || fresh.seatsAvailable < passengers.length) {
        throw new Error("NO_SEATS");
      }

      const created = await tx.booking.create({
        data: {
          reference: makeReference(),
          flightId,
          userId: user?.id ?? null,
          tripType: body.tripType ?? "aller-retour",
          cabinClass: body.cabinClass ?? "Économique",
          contactEmail,
          contactPhone: body.contactPhone ?? null,
          passengerCount: passengers.length,
          basePriceCents: breakdown.basePriceCents,
          baggageTotalCents: breakdown.baggageTotalCents,
          seatTotalCents: breakdown.seatTotalCents,
          taxesCents: breakdown.taxesCents,
          milesRedeemed: breakdown.milesRedeemed,
          totalUsdCents: breakdown.totalUsdCents,
          currency: "USD",
          milesEarned: breakdown.milesEarned,
          paymentMethodDisplay: paymentDisplay(body.paymentMethod, body.cardLast4),
          status: "confirmed",
          passengers: {
            create: passengers.map((p) => ({
              civility: p.civility ?? "M",
              firstName: p.firstName!,
              lastName: p.lastName!,
              type: p.type ?? "adult",
              birthDate: parseDate(p.birthDate),
              nationality: p.nationality ?? null,
              documentType: p.documentType ?? null,
              documentNumber: p.documentNumber ?? null,
              documentExpiry: parseDate(p.documentExpiry),
              documentIssuingCountry: p.documentIssuingCountry ?? null,
              phone: p.phone ?? null,
              evisaFileUrl: p.evisaFileUrl ?? null,
              seatId: p.seatId ?? null,
              baggageOptionId: p.baggageOptionId ?? null,
            })),
          },
        },
      });

      await tx.flight.update({
        where: { id: flightId },
        data: { seatsAvailable: fresh.seatsAvailable - passengers.length },
      });

      if (user) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            milesBalance:
              user.milesBalance - breakdown.milesRedeemed + breakdown.milesEarned,
          },
        });
      }

      return created;
    });

    return NextResponse.json(
      {
        reference: booking.reference,
        status: booking.status,
        totalUsdCents: booking.totalUsdCents,
        passengerCount: booking.passengerCount,
        breakdown,
        paymentMethodDisplay: booking.paymentMethodDisplay,
        milesEarned: breakdown.milesEarned,
        milesRedeemed: breakdown.milesRedeemed,
        newMilesBalance: user
          ? user.milesBalance - breakdown.milesRedeemed + breakdown.milesEarned
          : null,
      },
      { status: 201 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "SEAT_TAKEN") {
      return NextResponse.json(
        { error: "Un des sièges choisis vient d'être réservé. Reprenez la sélection." },
        { status: 409 },
      );
    }
    if (msg === "NO_SEATS") {
      return NextResponse.json(
        { error: "Plus assez de places disponibles sur ce vol." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "La réservation a échoué. Réessayez." },
      { status: 500 },
    );
  }
}
