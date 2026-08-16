import { NextResponse } from "next/server";
import { getBaggagePolicy } from "@/lib/booking";
import type { BaggagePolicyDTO } from "@/lib/data/types";

export const dynamic = "force-dynamic";

// GET /api/baggage-policy → franchises incluses + tarifs des suppléments bagages.
export async function GET() {
  const p = await getBaggagePolicy();
  const dto: BaggagePolicyDTO = {
    includedCheckedKg: p.includedCheckedKg,
    includedCabinKg: p.includedCabinKg,
    extraKgPriceCents: p.extraKgPriceCents,
    extraBagPriceCents: p.extraBagPriceCents,
  };
  return NextResponse.json({ policy: dto });
}
