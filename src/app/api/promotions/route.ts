import { NextResponse } from "next/server";
import { getPromotions, getRates } from "@/lib/data/queries";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

// GET /api/promotions → promotions, prix (USD) formatés.
export async function GET() {
  const [promotions, rates] = await Promise.all([getPromotions(), getRates()]);

  return NextResponse.json({
    promotions: promotions.map((p) => ({
      ...p,
      priceFormatted: formatPrice(p.priceUsdCents, "USD", rates),
      oldPriceFormatted: formatPrice(p.oldPriceUsdCents, "USD", rates),
    })),
  });
}
