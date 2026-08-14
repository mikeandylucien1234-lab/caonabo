import { cookies } from "next/headers";
import { isLocale, DEFAULT_LOCALE, type Locale } from "./i18n";
import { OFFERED_CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "./currency";

// ⚠️ Ce module est SERVEUR uniquement (il importe next/headers).
// Les constantes de devise partagées sont dans lib/currency.ts (client-safe).

// Lit les préférences (langue + devise) depuis les cookies, côté serveur.
export async function getPrefs(): Promise<{ locale: Locale; currency: CurrencyCode }> {
  const c = await cookies();
  const localeRaw = c.get("locale")?.value;
  const currRaw = c.get("currency")?.value as CurrencyCode | undefined;
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const currency: CurrencyCode = currRaw && OFFERED_CURRENCIES.includes(currRaw) ? currRaw : DEFAULT_CURRENCY;
  return { locale, currency };
}
