import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signedReceiptUrl } from "@/lib/receipt";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// GET /api/receipts?ref=MVC-XXXXX → redirige vers une URL signée (temporaire)
// du comprobante PDF stocké. L'accès requiert la référence exacte (PNR), comme
// le reste des consultations de réservation par référence sur le site.
export async function GET(req: Request) {
  // Anti-énumération de références : 20 essais / 15 min par IP.
  if (!(await rateLimit(`receipts:${clientIp(req)}`, 20, 15 * 60 * 1000))) {
    return rateLimitResponse();
  }

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
