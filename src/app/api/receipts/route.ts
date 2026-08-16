import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signedReceiptUrl } from "@/lib/receipt";

export const dynamic = "force-dynamic";

// GET /api/receipts?ref=CAO-XXXXX → redirige vers une URL signée (temporaire)
// du comprobante PDF stocké. L'accès requiert la référence exacte (PNR), comme
// le reste des consultations de réservation par référence sur le site.
export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Référence requise." }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { reference: ref },
    select: { paymentStatus: true, receiptUrl: true },
  });
  if (!booking) return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
  if (booking.paymentStatus !== "PAID" || !booking.receiptUrl) {
    return NextResponse.json({ error: "Comprobante indisponible." }, { status: 404 });
  }

  const url = await signedReceiptUrl(booking.receiptUrl);
  if (!url) {
    return NextResponse.json(
      { error: "Stockage des comprobantes non configuré (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }
  return NextResponse.redirect(url);
}
