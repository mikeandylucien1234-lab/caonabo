import "server-only";
import { prisma } from "@/lib/prisma";
import type { Flight, Seat } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Logique métier de réservation (source de vérité serveur)
//   - génération / matérialisation des sièges d'un vol (à la demande)
//   - calcul de prix (jamais confiance au prix envoyé par le client)
//   - étiquettes tarifaires dynamiques ("Recommandé", "Le plus économique")
// ─────────────────────────────────────────────────────────────────────────────

// ─── Configuration cabine Boeing 737-400 (affrètement complet, 150 places) ────
//   Première classe : 12 sièges, disposition 2-2, à l'avant (rangées 1 à 3)
//   Économique      : 138 sièges, disposition 3-3, rangées 10 à 32 (23 rangées)
export const FIRST_ROWS = [1, 2, 3] as const; // 3 × 4 = 12
export const FIRST_COLUMNS = ["A", "B", "C", "D"] as const; // 2-2 (couloir B|C)
export const ECON_ROW_START = 10;
export const ECON_ROW_COUNT = 23; // rangées 10 à 32
export const ECON_COLUMNS = ["A", "B", "C", "D", "E", "F"] as const; // 3-3 (couloir C|D)
export const FIRST_SEAT_SUPPLEMENT_CENTS = 15000; // supplément « Première classe »

export type FareClass = "Première classe" | "Économique";

// Type d'un siège selon sa position dans la rangée (hublot / couloir / standard).
// Le couloir est au milieu : sièges couloir = 2 du centre, hublots = extrémités.
function columnType(
  col: string,
  cols: readonly string[],
): "WINDOW" | "AISLE" | "STANDARD" {
  const i = cols.indexOf(col);
  const mid = cols.length / 2;
  if (i === 0 || i === cols.length - 1) return "WINDOW";
  if (i === mid - 1 || i === mid) return "AISLE";
  return "STANDARD";
}

// Supplément (cents) d'un siège = supplément de classe + supplément de position
function seatSupplementCents(
  fare: FareClass,
  type: "WINDOW" | "AISLE" | "STANDARD",
): number {
  const base = fare === "Première classe" ? FIRST_SEAT_SUPPLEMENT_CENTS : 0;
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

// Construit le plan de cabine complet du 737-400 (150 sièges) pour un vol.
function buildCabinPlan(flightId: string, rng: () => number, occupancy: number) {
  const data: Array<{
    flightId: string;
    row: number;
    column: string;
    type: string;
    fareClass: FareClass;
    priceSupplementCents: number;
    isAvailable: boolean;
  }> = [];

  const addRow = (row: number, cols: readonly string[], fare: FareClass) => {
    for (const col of cols) {
      const type = columnType(col, cols);
      data.push({
        flightId,
        row,
        column: col,
        type,
        fareClass: fare,
        priceSupplementCents: seatSupplementCents(fare, type),
        isAvailable: rng() > occupancy,
      });
    }
  };

  // Première classe (avant, 2-2)
  for (const row of FIRST_ROWS) addRow(row, FIRST_COLUMNS, "Première classe");
  // Économique (3-3)
  for (let i = 0; i < ECON_ROW_COUNT; i++)
    addRow(ECON_ROW_START + i, ECON_COLUMNS, "Économique");

  return data;
}

/**
 * Retourne les sièges d'un vol, en les matérialisant lors du premier accès.
 * Plan réel Boeing 737-400 : 12 Première (2-2) + 138 Économique (3-3) = 150.
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
  const data = buildCabinPlan(flightId, rng, occupancy);

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
  extraBaggageKg?: number | null; // kg au-delà de la franchise soute (23 kg)
  extraFullBags?: number | null; // valises entières supplémentaires
}

export interface BaggagePolicyInfo {
  includedCheckedKg: number;
  includedCabinKg: number;
  extraKgPriceCents: number;
  extraBagPriceCents: number;
}

// Valeurs par défaut si la table de configuration est vide (jamais en prod).
const DEFAULT_BAGGAGE_POLICY: BaggagePolicyInfo = {
  includedCheckedKg: 23,
  includedCabinKg: 8,
  extraKgPriceCents: 500,
  extraBagPriceCents: 6800,
};

/** Politique de bagages (ligne de configuration unique). */
export async function getBaggagePolicy(): Promise<BaggagePolicyInfo> {
  const row = await prisma.baggagePolicy.findFirst();
  if (!row) return DEFAULT_BAGGAGE_POLICY;
  return {
    includedCheckedKg: row.includedCheckedKg,
    includedCabinKg: row.includedCabinKg,
    extraKgPriceCents: row.extraKgPriceCents,
    extraBagPriceCents: row.extraBagPriceCents,
  };
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

  // Suppléments bagages : franchise (1 soute 23 kg + 1 cabine 8 kg) incluse pour
  // tous. On facture uniquement le poids en supplément (5 USD/kg) et les valises
  // entières supplémentaires (68 USD pièce). Tarifs relus en base.
  const policy = await getBaggagePolicy();
  let baggageTotalCents = 0;
  for (const p of passengers) {
    const kg = Math.max(0, Math.floor(p.extraBaggageKg ?? 0));
    const bags = Math.max(0, Math.floor(p.extraFullBags ?? 0));
    baggageTotalCents +=
      kg * policy.extraKgPriceCents + bags * policy.extraBagPriceCents;
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
