import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  CityDTO,
  DestinationDTO,
  FaqDTO,
  PrepStepDTO,
  PromotionDTO,
} from "./types";
import type { CurrencyCode, RateInfo } from "@/lib/currency";
import { FALLBACK_RATES } from "@/lib/currency";

export async function getCities(): Promise<CityDTO[]> {
  const airports = await prisma.airport.findMany({
    orderBy: { code: "asc" },
    select: { code: true, city: true, country: true },
  });
  return airports;
}

export async function getDestinations(): Promise<DestinationDTO[]> {
  const rows = await prisma.destination.findMany({
    where: { featured: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((d) => ({
    id: d.id,
    slug: d.slug,
    city: d.city,
    country: d.country,
    priceUsdCents: d.priceUsdCents,
    discountPct: d.discountPct,
    imageUrl: d.imageUrl,
    placeholder: d.placeholder,
    originCode: d.originCode,
    destinationCode: d.destinationCode,
  }));
}

export async function getPromotions(): Promise<PromotionDTO[]> {
  const rows = await prisma.promotion.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    routeLabel: p.routeLabel,
    category: p.category,
    categoryColor: p.categoryColor,
    tag: p.tag,
    tagColor: p.tagColor,
    accentColor: p.accentColor,
    priceUsdCents: p.priceUsdCents,
    oldPriceUsdCents: p.oldPriceUsdCents,
    imageUrl: p.imageUrl,
    placeholder: p.placeholder,
    originCode: p.originCode,
    destinationCode: p.destinationCode,
  }));
}

export interface OfferDTO {
  kind: "promotion" | "destination";
  slug: string;
  title: string;
  subtitle: string; // route ou pays
  imageUrl: string;
  priceUsdCents: number;
  oldPriceUsdCents: number | null;
  originCode: string;
  destinationCode: string;
  accentColor: string;
}

/** Résout une offre (promotion ou destination) par son slug. */
export async function getOfferBySlug(slug: string): Promise<OfferDTO | null> {
  const promo = await prisma.promotion.findUnique({ where: { slug } });
  if (promo) {
    return {
      kind: "promotion",
      slug: promo.slug,
      title: promo.title,
      subtitle: promo.routeLabel,
      imageUrl: promo.imageUrl,
      priceUsdCents: promo.priceUsdCents,
      oldPriceUsdCents: promo.oldPriceUsdCents,
      originCode: promo.originCode,
      destinationCode: promo.destinationCode,
      accentColor: promo.accentColor,
    };
  }
  const dest = await prisma.destination.findUnique({ where: { slug } });
  if (dest) {
    return {
      kind: "destination",
      slug: dest.slug,
      title: dest.city,
      subtitle: dest.country,
      imageUrl: dest.imageUrl,
      priceUsdCents: dest.priceUsdCents,
      oldPriceUsdCents: null,
      originCode: dest.originCode,
      destinationCode: dest.destinationCode,
      accentColor: "#5b21b6",
    };
  }
  return null;
}

export async function getFaqs(): Promise<FaqDTO[]> {
  const rows = await prisma.faq.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((f) => ({ id: f.id, question: f.question, answer: f.answer }));
}

export interface BaggageOptionRow {
  id: string;
  label: string;
  weightKg: number;
  priceCents: number;
  sortOrder: number;
}

/** Options de bagage en soute (pour la page Politique de Bagages). */
export async function getBaggageOptions(): Promise<BaggageOptionRow[]> {
  const rows = await prisma.baggageOption.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((b) => ({
    id: b.id,
    label: b.label,
    weightKg: b.weightKg,
    priceCents: b.priceCents,
    sortOrder: b.sortOrder,
  }));
}

export async function getPrepSteps(): Promise<PrepStepDTO[]> {
  const rows = await prisma.prepStep.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((s) => ({
    id: s.id,
    icon: s.icon,
    title: s.title,
    description: s.description,
  }));
}

export interface UserBookingDTO {
  id: string;
  reference: string;
  status: string;
  tripType: string;
  totalUsdCents: number;
  milesEarned: number;
  milesRedeemed: number;
  createdAt: string;
  passengerCount: number;
  flight: {
    flightNumber: string;
    origin: string;
    destination: string;
    departAt: string;
  };
}

/** Réservations d'un compte (page "Mes réservations"). */
export async function getUserBookings(userId: string): Promise<UserBookingDTO[]> {
  const rows = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      flight: {
        include: { route: { include: { origin: true, destination: true } } },
      },
    },
  });
  return rows.map((b) => ({
    id: b.id,
    reference: b.reference,
    status: b.status,
    tripType: b.tripType,
    totalUsdCents: b.totalUsdCents,
    milesEarned: b.milesEarned,
    milesRedeemed: b.milesRedeemed,
    createdAt: b.createdAt.toISOString(),
    passengerCount: b.passengerCount,
    flight: {
      flightNumber: b.flight.flightNumber,
      origin: b.flight.route.origin.city,
      destination: b.flight.route.destination.city,
      departAt: b.flight.departAt.toISOString(),
    },
  }));
}

/** Table de taux prête pour formatPrice(). Retombe sur les taux de secours. */
export async function getRates(): Promise<Record<string, RateInfo>> {
  try {
    const rows = await prisma.exchangeRate.findMany();
    if (rows.length === 0) return FALLBACK_RATES;
    const map: Record<string, RateInfo> = {};
    for (const r of rows) {
      map[r.currency] = {
        currency: r.currency as CurrencyCode,
        symbol: r.symbol,
        ratePerUsd: r.ratePerUsd,
      };
    }
    return map;
  } catch {
    return FALLBACK_RATES;
  }
}
