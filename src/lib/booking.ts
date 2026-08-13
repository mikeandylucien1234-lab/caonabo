import "server-only";
import { prisma } from "@/lib/prisma";
import type { Flight, Seat } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Logique métier de réservation (source de vérité serveur)
//   - génération / matérialisation des sièges d'un vol (à la demande)
//   - calcul de prix (jamais confiance au prix envoyé par le client)
//   - étiquettes tarifaires dynamiques ("Recommandé", "Le plus économique")
// ─────────────────────────────────────────────────────────────────────────────

export const SEAT_ROWS = 30;
export const SEAT_COLUMNS = ["A", "B", "C", "D", "E", "F"] as const;

// Type d'un siège selon sa colonne (hublot / couloir / standard)
function columnType(col: string): "WINDOW" | "AISLE" | "STANDARD" {
  if (col === "A" || col === "F") return "WINDOW";
  if (col === "C" || col === "D") return "AISLE";
  return "STANDARD";
}

// Classe tarifaire selon la rangée : Business en tête, puis Premium, puis Éco
function rowFareClass(row: number): "Business" | "Premium" | "Économique" {
  if (row <= 3) return "Business";
  if (row <= 8) return "Premium";
  return "Économique";
}

// Supplément (cents) d'un siège = supplément de classe + supplément de position
function seatSupplementCents(row: number, col: string): number {
  const fare = rowFareClass(row);
  let base = 0;
  if (fare === "Business") base = 12000;
  else if (fare === "Premium") base = 5000;
  const type = columnType(col);
  const pos = type === "WINDOW" ? 800 : type === "AISLE" ? 500 : 0;
  return base + pos;
}

// PRNG déterministe (mulberry32) — occupation reproductible par vol
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Retourne les sièges d'un vol, en les matérialisant lors du premier accès.
 * Taux d'occupation figé à la création (10–30%), déterministe par vol.
 */
export async function getOrCreateSeats(flightId: string): Promise<Seat[]> {
  const existing = await prisma.seat.findMany({
    where: { flightId },
    orderBy: [{ row: "asc" }, { column: "asc" }],
  });
  if (existing.length > 0) return existing;

  const rng = mulberry32(hashSeed(flightId));
  // taux d'occupation propre au vol, entre 10% et 30%
  const occupancy = 0.1 + rng() * 0.2;

  const data = [];
  for (let row = 1; row <= SEAT_ROWS; row++) {
    for (const col of SEAT_COLUMNS) {
      data.push({
        flightId,
        row,
        column: col,
        type: columnType(col),
        fareClass: rowFareClass(row),
        priceSupplementCents: seatSupplementCents(row, col),
        isAvailable: rng() > occupancy,
      });
    }
  }

  // createMany puis relecture (createMany ne retourne pas les lignes)
  try {
    await prisma.seat.createMany({ data });
  } catch {
    // course : un autre appel a pu créer les sièges entre-temps → on ignore
  }
  return prisma.seat.findMany({
    where: { flightId },
    orderBy: [{ row: "asc" }, { column: "asc" }],
  });
}

export interface PriceBreakdown {
  basePriceCents: number;
  baggageTotalCents: number;
  seatTotalCents: number;
  taxesCents: number;
  milesRedeemed: number;
  totalUsdCents: number;
  milesEarned: number;
}

export interface PricePassenger {
  seatId?: string | null;
  baggageOptionId?: string | null;
}

/**
 * Calcule le détail de prix côté serveur. Les suppléments sièges / bagages
 * sont relus en base (jamais depuis le client). `useMiles` est plafonné au
 * solde du compte et au montant dû.
 */
export async function computePrice(params: {
  flight: Flight;
  passengers: PricePassenger[];
  useMiles?: number;
  userMilesBalance?: number | null;
}): Promise<PriceBreakdown> {
  const { flight, passengers } = params;
  const count = passengers.length;

  const basePriceCents = flight.priceUsdCents * count;

  // Suppléments sièges (relus en base)
  const seatIds = passengers
    .map((p) => p.seatId)
    .filter((s): s is string => Boolean(s));
  let seatTotalCents = 0;
  if (seatIds.length > 0) {
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds }, flightId: flight.id },
    });
    seatTotalCents = seats.reduce((s, x) => s + x.priceSupplementCents, 0);
  }

  // Suppléments bagages (relus en base)
  const bagIds = passengers
    .map((p) => p.baggageOptionId)
    .filter((b): b is string => Boolean(b));
  let baggageTotalCents = 0;
  if (bagIds.length > 0) {
    const bags = await prisma.baggageOption.findMany({
      where: { id: { in: bagIds } },
    });
    const byId = new Map(bags.map((b) => [b.id, b.priceCents]));
    for (const p of passengers) {
      if (p.baggageOptionId)
        baggageTotalCents += byId.get(p.baggageOptionId) ?? 0;
    }
  }

  // Taxes & frais : 8% du tarif de base (arrondi au cent)
  const taxesCents = Math.round(basePriceCents * 0.08);

  const subtotal = basePriceCents + baggageTotalCents + seatTotalCents + taxesCents;

  // Miles : 1 Mile = 1 cent, plafonné au solde et au sous-total
  let milesRedeemed = 0;
  if (params.useMiles && params.useMiles > 0 && params.userMilesBalance != null) {
    milesRedeemed = Math.min(
      Math.floor(params.useMiles),
      params.userMilesBalance,
      subtotal,
    );
  }

  const totalUsdCents = subtotal - milesRedeemed;
  // Miles gagnés : 1 Mile par dollar du tarif de base (avant remise Miles)
  const milesEarned = Math.floor(basePriceCents / 100);

  return {
    basePriceCents,
    baggageTotalCents,
    seatTotalCents,
    taxesCents,
    milesRedeemed,
    totalUsdCents,
    milesEarned,
  };
}

/**
 * Étiquettes tarifaires dynamiques sur un lot de vols :
 *   - "Le plus économique" → prix le plus bas
 *   - "Recommandé"          → meilleur compromis prix/durée
 * Retourne un Map flightId → string[].
 */
export function computeFareTags(
  flights: Array<{ id: string; priceUsdCents: number; durationMinutes: number }>,
): Map<string, string[]> {
  const tags = new Map<string, string[]>();
  if (flights.length === 0) return tags;

  const cheapest = flights.reduce((a, b) =>
    b.priceUsdCents < a.priceUsdCents ? b : a,
  );

  // score = prix + pénalité de durée (≈ 1$ par minute) → plus bas = mieux
  const scored = flights.map((f) => ({
    id: f.id,
    score: f.priceUsdCents + f.durationMinutes * 100,
  }));
  const recommended = scored.reduce((a, b) => (b.score < a.score ? b : a));

  const push = (id: string, tag: string) => {
    const arr = tags.get(id) ?? [];
    if (!arr.includes(tag)) arr.push(tag);
    tags.set(id, arr);
  };

  push(recommended.id, "Recommandé");
  push(cheapest.id, "Le plus économique");
  return tags;
}
