// Types partagés entre serveur (Prisma) et composants clients.

export interface CityDTO {
  code: string;
  city: string;
  country: string;
}

export interface DestinationDTO {
  id: string;
  city: string;
  country: string;
  priceUsdCents: number;
  discountPct: number;
  imageUrl: string;
  placeholder: string;
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
  priceUsdCents: number;
  seatsAvailable: number;
}
