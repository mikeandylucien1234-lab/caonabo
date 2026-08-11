import { NextResponse } from "next/server";
import { getFaqs } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

// GET /api/faqs → questions fréquentes.
export async function GET() {
  const faqs = await getFaqs();
  return NextResponse.json({ faqs });
}
