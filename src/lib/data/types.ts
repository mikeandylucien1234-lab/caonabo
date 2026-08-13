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
  fareClass: string; // Économique | Premium | Business
  priceSupplementCents: number;
  isAvailable: boolean;
}

export interface BaggageOptionDTO {
  id: string;
  label: string;
  weightKg: number;
  priceCents: number;
  sortOrder: number;
}
