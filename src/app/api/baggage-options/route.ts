import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { BaggageOptionDTO } from "@/lib/data/types";

export const dynamic = "force-dynamic";

// GET /api/baggage-options → catalogue des options de bagage en soute
export async function GET() {
  const rows = await prisma.baggageOption.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const dto: BaggageOptionDTO[] = rows.map((b) => ({
    id: b.id,
    label: b.label,
    weightKg: b.weightKg,
    priceCents: b.priceCents,
    sortOrder: b.sortOrder,
  }));
  return NextResponse.json({ options: dto });
}
