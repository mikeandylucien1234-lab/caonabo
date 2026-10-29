import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { getServiceClient } from "@/lib/supabase/admin";

const RECEIPTS_BUCKET = "receipts"; // bucket privé (accès via URL signée)

const COMPANY = {
  name: "Caonabo Airlinje",
  tagline: "Voyagez Plus Loin, Vivez Plus Fort",
  contact: "contacto@caonabo-airlinje.cl · www.caonabo-airlinje.cl",
};

/** Numéro de comprobante lisible : CAO-<année>-<6 chiffres>. */
export function formatReceiptNumber(seq: number, year: number): string {
  return `CAO-${year}-${String(seq).padStart(6, "0")}`;
}

function eur(cents: number): string {
  return `US$ ${(cents / 100).toFixed(2)}`;
}

// Les polices standard (Helvetica) utilisent l'encodage WinAnsi (Latin-1) : les
// accents français passent, mais pas les symboles Unicode (→, ✓, …). On les
// remplace par des équivalents ASCII avant le rendu PDF.
function safe(s: string): string {
  return s
    .replace(/→/g, "->")
    .replace(/[«»]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/[✓✔]/g, "")
    .replace(/[•·]/g, "-")
    .replace(/…/g, "...")
    // retire tout caractère hors Latin-1 restant
    .replace(/[^\x00-\xFF]/g, "");
}

interface ReceiptData {
  receiptNumber: string;
  reference: string;
  paidAt: Date;
  cabinClass: string;
  paymentMethodDisplay: string | null;
  flowPaymentToken: string | null;
  basePriceCents: number;
  baggageTotalCents: number;
  seatTotalCents: number;
  taxesCents: number;
  totalUsdCents: number;
  passengers: Array<{ civility: string; firstName: string; lastName: string }>;
  route: string;
  flightNumber: string;
  flightDate: string;
}

/** Construit le PDF du comprobante (mise en page A4, une page). */
export async function buildReceiptPdf(d: ReceiptData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4 portrait (points)
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const indigo = rgb(0.12, 0.11, 0.29);
  const violet = rgb(0.36, 0.13, 0.72);
  const grey = rgb(0.42, 0.42, 0.5);
  const line = rgb(0.9, 0.89, 0.95);

  let y = 800;
  const L = 48;
  const R = 547;

  const text = (s: string, x: number, yy: number, size = 10, f = font, color = indigo) =>
    page.drawText(safe(s), { x, y: yy, size, font: f, color });
  const right = (s: string, xr: number, yy: number, size = 10, f = font, color = indigo) => {
    const t = safe(s);
    const w = f.widthOfTextAtSize(t, size);
    page.drawText(t, { x: xr - w, y: yy, size, font: f, color });
  };
  const hr = (yy: number) =>
    page.drawLine({ start: { x: L, y: yy }, end: { x: R, y: yy }, thickness: 1, color: line });

  // En-tête
  text(COMPANY.name, L, y, 20, bold, violet);
  right("COMPROBANTE DE PAIEMENT", R, y + 2, 12, bold, indigo);
  y -= 18;
  text(COMPANY.tagline, L, y, 9, font, grey);
  right(d.receiptNumber, R, y, 10, bold, indigo);
  y -= 14;
  text(COMPANY.contact, L, y, 8, font, grey);
  y -= 20;
  hr(y);
  y -= 26;

  // Bloc infos paiement
  const label = (s: string, x: number, yy: number) => text(s, x, yy, 8, bold, grey);
  label("RÉFÉRENCE (PNR)", L, y);
  label("DATE DE PAIEMENT", 230, y);
  label("MOYEN DE PAIEMENT", 400, y);
  y -= 14;
  text(d.reference, L, y, 12, bold, indigo);
  text(d.paidAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }), 230, y, 10);
  text(d.paymentMethodDisplay ?? "—", 400, y, 10);
  y -= 26;
  label("TRANSACTION FLOW", L, y);
  y -= 13;
  text(d.flowPaymentToken ?? "—", L, y, 9, font, grey);
  y -= 24;
  hr(y);
  y -= 24;

  // Vol
  label("VOL", L, y);
  y -= 15;
  text(d.route, L, y, 12, bold, indigo);
  y -= 15;
  text(`Vol ${d.flightNumber} · ${d.flightDate} · Classe ${d.cabinClass}`, L, y, 10, font, grey);
  y -= 24;

  // Passagers
  label("PASSAGER(S)", L, y);
  y -= 15;
  for (const p of d.passengers) {
    const civ = p.civility === "MME" ? "Mme" : p.civility === "MLLE" ? "Mlle" : "M.";
    text(`${civ} ${p.firstName} ${p.lastName}`, L, y, 10);
    y -= 14;
  }
  y -= 10;
  hr(y);
  y -= 24;

  // Détail du prix
  label("DÉTAIL DU MONTANT PAYÉ", L, y);
  y -= 18;
  const row = (name: string, val: string, f = font, color = indigo) => {
    text(name, L, y, 10, f, color);
    right(val, R, y, 10, f, color);
    y -= 16;
  };
  row("Tarif vol", eur(d.basePriceCents));
  if (d.baggageTotalCents > 0) row("Bagages supplémentaires", eur(d.baggageTotalCents));
  if (d.seatTotalCents > 0) row("Sièges", eur(d.seatTotalCents));
  row("Taxes & frais", eur(d.taxesCents));
  y -= 4;
  hr(y);
  y -= 22;
  text("TOTAL PAYÉ", L, y, 13, bold, indigo);
  right(eur(d.totalUsdCents), R, y, 15, bold, violet);
  y -= 40;

  hr(y);
  y -= 16;
  text(
    "Document généré automatiquement à la confirmation du paiement. Conservez-le comme preuve de règlement.",
    L,
    y,
    8,
    font,
    grey,
  );

  return pdf.save();
}

/**
 * Génère le comprobante d'une réservation payée, le stocke dans Supabase
 * Storage (bucket privé), et retourne le CHEMIN du fichier (ou null si le
 * stockage serveur n'est pas configuré — SUPABASE_SERVICE_ROLE_KEY manquante).
 * receiptNumber doit déjà avoir été attribué à la réservation.
 */
export async function generateReceiptForBooking(bookingId: string): Promise<string | null> {
  const b = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      passengers: { select: { civility: true, firstName: true, lastName: true } },
      flight: { include: { route: { include: { origin: true, destination: true } } } },
    },
  });
  if (!b || !b.receiptNumber || !b.paidAt) return null;

  const o = b.flight?.route?.origin;
  const dest = b.flight?.route?.destination;
  const route = o && dest ? `${o.city} (${o.code}) → ${dest.city} (${dest.code})` : "—";
  const flightDate = b.flight?.departAt
    ? new Date(b.flight.departAt).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : "—";

  const bytes = await buildReceiptPdf({
    receiptNumber: b.receiptNumber,
    reference: b.reference,
    paidAt: b.paidAt,
    cabinClass: b.cabinClass,
    paymentMethodDisplay: b.paymentMethodDisplay,
    flowPaymentToken: b.flowPaymentToken,
    basePriceCents: b.basePriceCents,
    baggageTotalCents: b.baggageTotalCents,
    seatTotalCents: b.seatTotalCents,
    taxesCents: b.taxesCents,
    totalUsdCents: b.totalUsdCents,
    passengers: b.passengers,
    route,
    flightNumber: b.flight?.flightNumber ?? "—",
    flightDate,
  });

  const svc = getServiceClient();
  if (!svc) return null; // stockage serveur non configuré

  const path = `${b.reference}/${b.receiptNumber}.pdf`;
  const { error } = await svc.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, Buffer.from(bytes), { contentType: "application/pdf", upsert: true });
  if (error) throw new Error("Échec du stockage du comprobante.");
  return path;
}

/** Génère une URL signée (temporaire) pour télécharger un comprobante stocké. */
export async function signedReceiptUrl(path: string, expiresSec = 300): Promise<string | null> {
  const svc = getServiceClient();
  if (!svc) return null;
  const { data, error } = await svc.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(path, expiresSec);
  if (error || !data) return null;
  return data.signedUrl;
}
