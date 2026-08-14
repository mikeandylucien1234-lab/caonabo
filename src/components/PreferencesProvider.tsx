"use client";

import { createContext, useContext } from "react";
import type { Locale, Dict } from "@/lib/i18n";
import type { CurrencyCode, RateInfo } from "@/lib/currency";

export interface Prefs {
  locale: Locale;
  currency: CurrencyCode;
  dict: Dict;
  rates: Record<string, RateInfo>;
}

const Ctx = createContext<Prefs | null>(null);

export function PreferencesProvider({ value, children }: { value: Prefs; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePrefs doit être utilisé dans <PreferencesProvider>");
  return v;
}

// Enregistre une préférence dans un cookie (1 an) puis recharge le rendu serveur.
export function setPrefCookie(name: "locale" | "currency", value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}
