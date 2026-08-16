// Types partagés entre serveur (Prisma) et composants clients.

export interface CityDTO {
  code: string;
  city: string;
  country: string;
}

export interface DestinationDTO {
  id: string;
  slug: string;
  city: string;
  country: string;
  priceUsdCents: number;
  discountPct: number;
  imageUrl: string;
  placeholder: string;
  originCode: string;
  destinationCode: string;
}

export interface PromotionDTO {
  id: string;
  slug: string;
  title: string;
  routeLabel: string;
  category: string;
  categoryColor: string;
  tag: string;
  tagColor: string;
  accentColor: string;
  priceUsdCents: number;
  oldPriceUsdCents: number;
  imageUrl: string;
  placeholder: string;
  originCode: string;
  destinationCode: string;
}

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
}

export interface PrepStepDTO {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FlightResultDTO {
  id: string;
  flightNumber: string;
  origin: CityDTO;
  destination: CityDTO;
  departAt: string; // ISO
  arriveAt: string; // ISO
  direct: boolean;
  stops: number;
  stopAirports: string[]; // codes IATA des escales
  durationMinutes: number;
  operatedBy: string;
  priceUsdCents: number;
  seatsAvailable: number;
  fareTags: string[]; // ex: ["Recommandé", "Le plus économique"]
}

export interface SeatDTO {
  id: string;
  row: number;
  column: string;
  type: string; // WINDOW | AISLE | STANDARD
  fareClass: string; // Économique | Première classe
  priceSupplementCents: number;
  isAvailable: boolean;
  heldByOther: boolean; // tenu temporairement par un autre tunnel
}

// Politique de bagages (franchise incluse + tarifs des suppléments).
export interface BaggagePolicyDTO {
  includedCheckedKg: number;
  includedCabinKg: number;
  extraKgPriceCents: number;
  extraBagPriceCents: number;
}
