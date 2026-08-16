import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/payments/status → indique au tunnel si Flow est configuré (sans
// jamais exposer de clé). Sert à choisir entre paiement Flow et mode démo.
export async function GET() {
  try {
    const s = await prisma.paymentSettings.findFirst();
    return NextResponse.json({
      configured: Boolean(s?.isConfigured),
      mode: s?.mode === "PRODUCTION" ? "PRODUCTION" : "SANDBOX",
    });
  } catch {
    return NextResponse.json({ configured: false, mode: "SANDBOX" });
  }
}
