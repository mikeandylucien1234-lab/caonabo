// ─────────────────────────────────────────────────────────────────────────────
// Gestion des devises
//
// Principe : la base stocke TOUJOURS des prix en USD (entiers, en cents).
// L'affichage se fait dans la devise du marché via un taux de change.
//   - Marché chilien  → CLP (comme dans le prototype pour les destinations)
//   - Ailleurs        → USD (comme dans le prototype pour les promotions)
// ─────────────────────────────────────────────────────────────────────────────

export type CurrencyCode = "USD" | "CLP" | "CAD" | "PEN";

// Devises proposées dans le sélecteur (client-safe : aucun import serveur ici).
export const OFFERED_CURRENCIES: CurrencyCode[] = ["USD", "CLP", "CAD"];
export const DEFAULT_CURRENCY: CurrencyCode = "CLP";
export const CURRENCY_LABELS: Record<string, string> = {
  USD: "USD — $ (dollar)",
  CLP: "CLP — peso chilien",
  CAD: "CAD — dollar canadien",
};

export interface RateInfo {
  currency: CurrencyCode;
  symbol: string;
  ratePerUsd: number;
}

// Taux de secours si la table ExchangeRate n'est pas encore renseignée.
export const FALLBACK_RATES: Record<CurrencyCode, RateInfo> = {
  USD: { currency: "USD", symbol: "$", ratePerUsd: 1 },
  CLP: { currency: "CLP", symbol: "CLP", ratePerUsd: 950 },
  CAD: { currency: "CAD", symbol: "CA$", ratePerUsd: 1.37 },
  PEN: { currency: "PEN", symbol: "S/", ratePerUsd: 3.75 },
};

/** Convertit un montant USD (en cents) vers une devise cible (unités entières). */
export function convertFromUsdCents(usdCents: number, rate: RateInfo): number {
  return (usdCents / 100) * rate.ratePerUsd;
}

/**
 * Formate un prix stocké en USD (cents) dans la devise voulue.
 * - USD  → "$349"  (les promos du proto étaient en USD entiers)
 * - CLP  → "CLP 331.550" (séparateur de milliers ".", pas de décimales)
 * - CAD  → "CA$ 478"
 */
export function formatPrice(
  usdCents: number,
  currency: CurrencyCode = "USD",
  rates: Record<string, RateInfo> = FALLBACK_RATES,
): string {
  const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? FALLBACK_RATES.USD;
  const value = convertFromUsdCents(usdCents, rate);

  if (currency === "CLP") {
    // pas de décimales, séparateur de milliers "."
    const rounded = Math.round(value);
    return `CLP ${rounded.toLocaleString("es-CL")}`;
  }

  if (currency === "USD") {
    // le proto affiche des montants entiers ("349 $")
    return `${Math.round(value)} $`;
  }

  return `${rate.symbol} ${Math.round(value).toLocaleString("fr-FR")}`;
}

/** Devise d'affichage par défaut selon le marché (code pays ISO simplifié). */
export function currencyForMarket(market?: string): CurrencyCode {
  switch ((market ?? "").toUpperCase()) {
    case "CL":
      return "CLP";
    case "CA":
      return "CAD";
    case "PE":
      return "PEN";
    default:
      return "USD";
  }
}
