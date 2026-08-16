import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computePrice, type PriceBreakdown } from "@/lib/booking";
import type { PreparedPassenger } from "@/lib/bookingCreate";
import type { Flight } from "@prisma/client";

export interface PassengerInput {
  civility?: string;
  firstName?: string;
  lastName?: string;
  type?: string;
  birthDate?: string | null;
  nationality?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  documentExpiry?: string | null;
  documentIssuingCountry?: string | null;
  phone?: string | null;
  evisaFileUrl?: string | null;
  seatId?: string | null;
  extraBaggageKg?: number | null;
  extraFullBags?: number | null;
}

export interface BookingBody {
  flightId?: string;
  tripType?: string;
  cabinClass?: string;
  contactEmail?: string;
  contactPhone?: string;
  passengers?: PassengerInput[];
  useMiles?: number;
  holdToken?: string;
}

const CIVILITIES = new Set(["M", "MME", "MLLE"]);
const DOC_TYPES = new Set(["PASSPORT", "ID_CARD"]);
const CABIN_CLASSES = new Set(["Économique", "Première classe"]);

function parseDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export interface PreparedBooking {
  flight: Flight;
  cabinClass: string;
  tripType: string;
  contactEmail: string;
  contactPhone: string | null;
  passengers: PreparedPassenger[];
  requestedSeatIds: string[];
  holdToken: string | null;
  breakdown: PriceBreakdown;
  user: { id: string; milesBalance: number } | null;
}

export type PrepareResult =
  | { ok: true; data: PreparedBooking }
  | { ok: false; error: string; status: number };

/**
 * Validation + préparation communes (mode démo ET Flow) : contrôle des champs,
 * du vol, des sièges, et RECALCUL du prix côté serveur (jamais le prix client).
 */
export async function prepareBooking(body: BookingBody): Promise<PrepareResult> {
  const { flightId, contactEmail } = body;
  const raw = (body.passengers ?? []).filter((p) => p.firstName && p.lastName);

  if (!flightId) return { ok: false, error: "flightId requis.", status: 400 };
  if (!contactEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
    return { ok: false, error: "Email de contact valide requis.", status: 400 };
  }
  if (raw.length === 0) {
    return { ok: false, error: "Au moins un passager (prénom + nom) requis.", status: 400 };
  }
  for (const p of raw) {
    if (p.civility && !CIVILITIES.has(p.civility)) {
      return { ok: false, error: "Civilité invalide.", status: 400 };
    }
    if (p.documentType && !DOC_TYPES.has(p.documentType)) {
      return { ok: false, error: "Type de document invalide.", status: 400 };
    }
  }
  if (body.cabinClass && !CABIN_CLASSES.has(body.cabinClass)) {
    return { ok: false, error: "Classe invalide.", status: 400 };
  }

  const flight = await prisma.flight.findUnique({ where: { id: flightId } });
  if (!flight) return { ok: false, error: "Vol introuvable.", status: 404 };
  if (flight.seatsAvailable < raw.length) {
    return { ok: false, error: "Pas assez de places disponibles sur ce vol.", status: 409 };
  }

  const requestedSeatIds = raw
    .map((p) => p.seatId)
    .filter((s): s is string => Boolean(s));
  if (new Set(requestedSeatIds).size !== requestedSeatIds.length) {
    return { ok: false, error: "Un même siège a été choisi pour plusieurs passagers.", status: 400 };
  }

  const user = await getCurrentUser();
  const breakdown = await computePrice({
    flight,
    passengers: raw,
    useMiles: body.useMiles,
    userMilesBalance: user?.milesBalance ?? null,
  });

  const passengers: PreparedPassenger[] = raw.map((p) => ({
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
    extraBaggageKg: Math.max(0, Math.floor(p.extraBaggageKg ?? 0)),
    extraFullBags: Math.max(0, Math.floor(p.extraFullBags ?? 0)),
  }));

  return {
    ok: true,
    data: {
      flight,
      cabinClass: CABIN_CLASSES.has(body.cabinClass ?? "") ? body.cabinClass! : "Économique",
      tripType: body.tripType ?? "aller-retour",
      contactEmail,
      contactPhone: body.contactPhone ?? null,
      passengers,
      requestedSeatIds,
      holdToken: body.holdToken ?? null,
      breakdown,
      user: user ? { id: user.id, milesBalance: user.milesBalance } : null,
    },
  };
}
