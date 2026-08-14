import { cookies } from "next/headers";
import { isLocale, DEFAULT_LOCALE, type Locale } from "./i18n";
import type { CurrencyCode } from "./currency";

// Devises proposées dans le sélecteur et devise par défaut.
export const OFFERED_CURRENCIES: CurrencyCode[] = ["USD", "CLP", "CAD"];
export const DEFAULT_CURRENCY: CurrencyCode = "CLP";

export const CURRENCY_LABELS: Record<string, string> = {
  USD: "USD — $ (dollar)",
  CLP: "CLP — peso chilien",
  CAD: "CAD — dollar canadien",
};

// Lit les préférences (langue + devise) depuis les cookies, côté serveur.
export async function getPrefs(): Promise<{ locale: Locale; currency: CurrencyCode }> {
  const c = await cookies();
  const localeRaw = c.get("locale")?.value;
  const currRaw = c.get("currency")?.value as CurrencyCode | undefined;
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const currency: CurrencyCode = currRaw && OFFERED_CURRENCIES.includes(currRaw) ? currRaw : DEFAULT_CURRENCY;
  return { locale, currency };
}
