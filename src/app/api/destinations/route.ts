import { NextResponse } from "next/server";
import { getDestinations, getRates } from "@/lib/data/queries";
import { formatPrice, currencyForMarket, type CurrencyCode } from "@/lib/currency";

export const dynamic = "force-dynamic";

// GET /api/destinations?market=CL  → destinations phares, prix formatés.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const currency: CurrencyCode = currencyForMarket(
    searchParams.get("market") ?? undefined,
  );
  const [destinations, rates] = await Promise.all([
    getDestinations(),
    getRates(),
  ]);

  return NextResponse.json({
    currency,
    destinations: destinations.map((d) => ({
      ...d,
      priceFormatted: formatPrice(d.priceUsdCents, currency, rates),
    })),
  });
}
