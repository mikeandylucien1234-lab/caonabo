import "server-only";
import { Prisma, type Booking } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PriceBreakdown } from "@/lib/booking";

// ─────────────────────────────────────────────────────────────────────────────
// Cœur transactionnel de création de réservation, PARTAGÉ entre :
//   - le paiement de démonstration (/api/bookings) → confirmé + payé d'emblée
//   - le paiement Flow (/api/payments/create) → en attente (PENDING) jusqu'au webhook
// Un seul chemin de verrouillage de sièges (anti double-réservation), pas de
// contournement de la protection existante.
// ─────────────────────────────────────────────────────────────────────────────

export interface PreparedPassenger {
  civility: string;
  firstName: string;
  lastName: string;
  type: string;
  birthDate: Date | null;
  nationality: string | null;
  documentType: string | null;
  documentNumber: string | null;
  documentExpiry: Date | null;
  documentIssuingCountry: string | null;
  phone: string | null;
  evisaFileUrl: string | null;
  seatId: string | null;
  extraBaggageKg: number;
  extraFullBags: number;
}

export function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `CAO-${s}`;
}

export interface RunBookingInput {
  flightId: string;
  reference: string;
  userId: string | null;
  tripType: string;
  cabinClass: string;
  contactEmail: string;
  contactPhone: string | null;
  passengers: PreparedPassenger[];
  requestedSeatIds: string[];
  holdToken: string | null;
  breakdown: PriceBreakdown;
  paymentMethodDisplay: string | null;
  status: string; // "confirmed" (démo) | "pending" (Flow)
  paymentStatus: string; // "PAID" (démo) | "PENDING" (Flow)
  user: { id: string; milesBalance: number } | null;
  creditMilesNow: boolean; // démo : crédit immédiat ; Flow : au webhook
}

/**
 * Verrouille les sièges (SELECT … FOR UPDATE), crée la réservation + passagers,
 * décrémente les places du vol et (optionnellement) applique les Miles.
 * Lève "SEAT_TAKEN" / "NO_SEATS" en cas de conflit.
 */
export async function runBookingTransaction(input: RunBookingInput): Promise<Booking> {
  const { flightId, requestedSeatIds, holdToken, breakdown, passengers } = input;
  return prisma.$transaction(async (tx) => {
    if (requestedSeatIds.length > 0) {
      const locked = await tx.$queryRaw<
        Array<{ id: string; isAvailable: boolean; heldBy: string | null; heldUntil: Date | null }>
      >(
        Prisma.sql`SELECT id, "isAvailable", "heldBy", "heldUntil"
                   FROM "Seat"
                   WHERE "flightId" = ${flightId}
                     AND id IN (${Prisma.join(requestedSeatIds)})
                   FOR UPDATE`,
      );
      if (locked.length !== requestedSeatIds.length) throw new Error("SEAT_TAKEN");
      const now = Date.now();
      for (const s of locked) {
        const heldByOther =
          s.heldUntil != null && s.heldUntil.getTime() > now && s.heldBy !== holdToken;
        if (!s.isAvailable || heldByOther) throw new Error("SEAT_TAKEN");
      }
      await tx.$executeRaw(
        Prisma.sql`UPDATE "Seat"
                   SET "isAvailable" = false, "heldBy" = NULL, "heldUntil" = NULL
                   WHERE "flightId" = ${flightId}
                     AND id IN (${Prisma.join(requestedSeatIds)})`,
      );
    }

    const fresh = await tx.flight.findUnique({ where: { id: flightId } });
    if (!fresh || fresh.seatsAvailable < passengers.length) throw new Error("NO_SEATS");

    const created = await tx.booking.create({
      data: {
        reference: input.reference,
        flightId,
        userId: input.userId,
        tripType: input.tripType,
        cabinClass: input.cabinClass,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        passengerCount: passengers.length,
        basePriceCents: breakdown.basePriceCents,
        baggageTotalCents: breakdown.baggageTotalCents,
        seatTotalCents: breakdown.seatTotalCents,
        taxesCents: breakdown.taxesCents,
        milesRedeemed: breakdown.milesRedeemed,
        totalUsdCents: breakdown.totalUsdCents,
        currency: "USD",
        milesEarned: breakdown.milesEarned,
        paymentMethodDisplay: input.paymentMethodDisplay,
        status: input.status,
        paymentStatus: input.paymentStatus,
        paidAt: input.paymentStatus === "PAID" ? new Date() : null,
        passengers: {
          create: passengers.map((p) => ({
            civility: p.civility,
            firstName: p.firstName,
            lastName: p.lastName,
            type: p.type,
            birthDate: p.birthDate,
            nationality: p.nationality,
            documentType: p.documentType,
            documentNumber: p.documentNumber,
            documentExpiry: p.documentExpiry,
            documentIssuingCountry: p.documentIssuingCountry,
            phone: p.phone,
            evisaFileUrl: p.evisaFileUrl,
            seatId: p.seatId,
            extraBaggageKg: p.extraBaggageKg,
            extraFullBags: p.extraFullBags,
          })),
        },
      },
    });

    await tx.flight.update({
      where: { id: flightId },
      data: { seatsAvailable: fresh.seatsAvailable - passengers.length },
    });

    if (input.creditMilesNow && input.user) {
      await tx.user.update({
        where: { id: input.user.id },
        data: {
          milesBalance:
            input.user.milesBalance - breakdown.milesRedeemed + breakdown.milesEarned,
        },
      });
    }

    return created;
  });
}

/**
 * Libère les sièges d'une réservation (paiement échoué/expiré) et restaure les
 * places du vol. À utiliser dans une transaction.
 */
export async function releaseBookingSeats(
  tx: Prisma.TransactionClient,
  bookingId: string,
  flightId: string,
  passengerCount: number,
): Promise<void> {
  const pax = await tx.passenger.findMany({
    where: { bookingId },
    select: { seatId: true },
  });
  const seatIds = pax.map((p) => p.seatId).filter((s): s is string => Boolean(s));
  if (seatIds.length > 0) {
    await tx.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { isAvailable: true, heldBy: null, heldUntil: null },
    });
    await tx.passenger.updateMany({ where: { bookingId }, data: { seatId: null } });
  }
  await tx.flight.update({
    where: { id: flightId },
    data: { seatsAvailable: { increment: passengerCount } },
  });
}

const PENDING_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Balaye les réservations restées en attente de paiement (PENDING) au-delà de
 * 30 min : les marque EXPIRED/cancelled et libère leurs sièges. Appelé
 * paresseusement (chargement du plan de cabine, nouvelle réservation) pour
 * qu'aucune réservation impayée ne bloque indéfiniment des ressources —
 * sans dépendre d'un cron.
 */
export async function expireStalePendingBookings(flightId?: string): Promise<number> {
  const cutoff = new Date(Date.now() - PENDING_TTL_MS);
  const stale = await prisma.booking.findMany({
    where: {
      status: "pending",
      paymentStatus: "PENDING",
      createdAt: { lt: cutoff },
      ...(flightId ? { flightId } : {}),
    },
    select: { id: true, flightId: true, passengerCount: true },
  });
  for (const b of stale) {
    await prisma.$transaction(async (tx) => {
      // revérifie l'état (course avec un webhook qui aurait confirmé entre-temps)
      const fresh = await tx.booking.findUnique({ where: { id: b.id } });
      if (!fresh || fresh.paymentStatus !== "PENDING") return;
      await releaseBookingSeats(tx, b.id, b.flightId, b.passengerCount);
      await tx.booking.update({
        where: { id: b.id },
        data: { paymentStatus: "EXPIRED", status: "cancelled" },
      });
    });
  }
  return stale.length;
}
