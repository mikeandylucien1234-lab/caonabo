import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import QRCode from "qrcode";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getServiceClient } from "@/lib/supabase/admin";
import { boardingTimeFor, formatTicketNumber } from "@/lib/checkin";

const BUCKET = "boarding-passes"; // bucket privé (accès via URL signée)

// Palette (navy/or, cohérente avec la charte Caonabo)
const NAVY = rgb(0.055, 0.086, 0.22);
const NAVY_LIGHT = rgb(0.1, 0.14, 0.3);
const GOLD = rgb(0.78, 0.62, 0.18);
const RED = rgb(0.82, 0.12, 0.12);
const GREEN = rgb(0.12, 0.55, 0.28);
const GREY = rgb(0.42, 0.44, 0.52);
const GREY_LIGHT = rgb(0.95, 0.955, 0.97);
const BORDER = rgb(0.86, 0.86, 0.9);
const WHITE = rgb(1, 1, 1);
const INK = rgb(0.08, 0.08, 0.16);

// Caractères hors WinAnsi (accents non pris en charge par une police standard,
// symboles Unicode) remplacés par des équivalents sûrs.
function safe(s: string): string {
  return s
    .normalize("NFC")
    .replace(/→/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[«»]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x00-\xFF]/g, "");
}

const CABIN_CODE: Record<string, string> = {
  "Économique": "Y",
  "Première classe": "F",
};

interface BoardingPassData {
  ticketNumber: string;
  reference: string;
  passengerName: string;
  cabinClass: string;
  seatLabel: string | null; // ex: "18A"
  gate: string | null;
  terminal: string;
  boardingAt: Date;
  originCode: string;
  originCity: string;
  originCountry: string;
  destinationCode: string;
  destinationCity: string;
  destinationCountry: string;
  flightNumber: string;
  departAt: Date;
  arriveAt: Date;
  durationMinutes: number;
  includedCheckedKg: number;
  includedCabinKg: number;
  verifyUrl: string;
}

// ── Icônes minimalistes (rectangles/ellipses uniquement — rendu Y-up sûr) ──
function planeIcon(page: PDFPage, cx: number, cy: number, size: number, color: RGB) {
  // silhouette abstraite : fuselage + ailes (croix effilée), lisible en petit format
  page.drawRectangle({ x: cx - size * 0.5, y: cy - size * 0.08, width: size, height: size * 0.16, color });
  page.drawRectangle({ x: cx - size * 0.14, y: cy - size * 0.32, width: size * 0.16, height: size * 0.64, color });
}
function suitcaseIcon(page: PDFPage, cx: number, cy: number, size: number, color: RGB) {
  page.drawRectangle({ x: cx - size / 2, y: cy - size * 0.38, width: size, height: size * 0.72, color, borderColor: color, borderWidth: 0 });
  page.drawRectangle({ x: cx - size * 0.22, y: cy + size * 0.34, width: size * 0.44, height: size * 0.16, borderColor: color, borderWidth: size * 0.06 });
}
function badgeCircle(page: PDFPage, cx: number, cy: number, r: number, bg: RGB) {
  page.drawEllipse({ x: cx, y: cy, xScale: r, yScale: r, color: bg });
}

function textAt(
  page: PDFPage,
  s: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB = INK,
) {
  page.drawText(safe(s), { x, y, size, font, color });
}
function textCentered(
  page: PDFPage,
  s: string,
  cx: number,
  y: number,
  size: number,
  font: PDFFont,
  color: RGB = INK,
) {
  const t = safe(s);
  const w = font.widthOfTextAtSize(t, size);
  page.drawText(t, { x: cx - w / 2, y, size, font, color });
}

/** Construit le PDF de la carte d'embarquement (1 page, 1 passager). */
export async function buildBoardingPassPdf(d: BoardingPassData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const W = 760;
  const H = 720;
  const page = pdf.addPage([W, H]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Logo réel du site (fichier PNG, RGBA)
  let logoImg = null;
  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public/images/logo.png"));
    logoImg = await pdf.embedPng(logoBytes);
  } catch {
    logoImg = null;
  }

  // ── Bordure extérieure de la carte ──────────────────────────────────────
  page.drawRectangle({ x: 4, y: 4, width: W - 8, height: H - 8, borderColor: BORDER, borderWidth: 1.5 });

  // ═══════════════════ SECTION HAUT — BILLET ÉLECTRONIQUE ═══════════════════
  // Logo (haut gauche)
  let logoBottomY = H - 66;
  if (logoImg) {
    const lw = 130;
    const lh = lw / (logoImg.width / logoImg.height);
    const logoY = H - 30 - lh;
    page.drawImage(logoImg, { x: 30, y: logoY, width: lw, height: lh });
    logoBottomY = logoY;
  } else {
    textAt(page, "CAONABO AIRLINES", 30, H - 60, 20, bold, NAVY);
  }

  // Bandeau "BILLET ÉLECTRONIQUE" (haut droit)
  const ticketBandW = 270;
  const ticketBandX = W - 30 - ticketBandW;
  page.drawRectangle({ x: ticketBandX, y: H - 66, width: ticketBandW, height: 34, color: NAVY });
  planeIcon(page, ticketBandX + 22, H - 49, 14, GOLD);
  textAt(page, "BILLET ELECTRONIQUE", ticketBandX + 40, H - 54, 13, bold, WHITE);

  // N° de billet / référence — toujours SOUS le logo (marge de sécurité)
  const infoY = Math.min(H - 118, logoBottomY - 40);
  textAt(page, "N. DE BILLET", 30, infoY, 9, bold, GREY);
  textAt(page, formatTicketNumber(d.ticketNumber), 30, infoY - 22, 19, bold, RED);
  textAt(page, "REFERENCE DE RESERVATION", 300, infoY, 9, bold, GREY);
  textAt(page, d.reference, 300, infoY - 22, 19, bold, RED);

  // Passager
  const paxY = infoY - 62;
  badgeCircle(page, 44, paxY + 4, 14, GREY_LIGHT);
  page.drawEllipse({ x: 44, y: paxY + 9, xScale: 5, yScale: 5, color: NAVY });
  page.drawEllipse({ x: 44, y: paxY - 1, xScale: 9, yScale: 6, color: NAVY });
  textAt(page, "PASSAGER", 66, paxY + 10, 9, bold, GREY);
  textAt(page, d.passengerName.toUpperCase(), 66, paxY - 6, 15, bold, INK);

  // Bloc principal (fond gris clair)
  const boxTop = paxY - 26;
  const boxH = 132;
  const boxY = boxTop - boxH;
  page.drawRectangle({ x: 30, y: boxY, width: W - 60, height: boxH, color: GREY_LIGHT });
  const cutY = boxY - 20; // séparation billet / carte d'embarquement

  const rowAY = boxY + boxH - 24;
  // DE / FROM
  textAt(page, "DE / FROM", 52, rowAY, 8, bold, GREY);
  textAt(page, d.originCode, 52, rowAY - 24, 22, bold, INK);
  textAt(page, safe(d.originCity), 52, rowAY - 40, 9, font, GREY);
  textAt(page, safe(d.originCountry), 52, rowAY - 51, 9, font, GREY);
  // avion (icône entre DE et A)
  planeIcon(page, 240, rowAY - 20, 20, NAVY_LIGHT);
  // A / TO
  textAt(page, "A / TO", 290, rowAY, 8, bold, GREY);
  textAt(page, d.destinationCode, 290, rowAY - 24, 22, bold, INK);
  textAt(page, safe(d.destinationCity), 290, rowAY - 40, 9, font, GREY);
  textAt(page, safe(d.destinationCountry), 290, rowAY - 51, 9, font, GREY);

  // colonnes compactes : VOL, DATE, DEPART, ARRIVEE
  const colX = [430, 520, 615, 690];
  const weekday = d.departAt.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayMonth = d.departAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).toUpperCase();
  const arriveNextDay = d.arriveAt.toDateString() !== d.departAt.toDateString();
  const depTime = d.departAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const arrTime = d.arriveAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  textAt(page, "VOL / FLIGHT", colX[0], rowAY, 8, bold, GREY);
  textAt(page, d.flightNumber, colX[0], rowAY - 24, 13, bold, INK);

  textAt(page, "DATE", colX[1], rowAY, 8, bold, GREY);
  textAt(page, dayMonth + " " + d.departAt.getFullYear(), colX[1], rowAY - 24, 11, bold, INK);
  textAt(page, safe(weekday.toUpperCase()), colX[1], rowAY - 37, 8, font, GREY);

  textAt(page, "DEPART", colX[2], rowAY, 8, bold, GREY);
  textAt(page, depTime, colX[2], rowAY - 24, 13, bold, INK);
  textAt(page, d.originCode, colX[2], rowAY - 37, 8, font, GREY);

  textAt(page, "ARRIVEE", colX[3], rowAY, 8, bold, GREY);
  textAt(page, arrTime + (arriveNextDay ? " +1" : ""), colX[3], rowAY - 24, 13, bold, INK);
  textAt(page, d.destinationCode, colX[3], rowAY - 37, 8, font, GREY);

  // ligne 2 : durée / terminal / statut
  const rowBY = boxY + 24;
  page.drawLine({ start: { x: 52, y: rowBY + 22 }, end: { x: W - 52, y: rowBY + 22 }, thickness: 1, color: BORDER });
  const hh = Math.floor(d.durationMinutes / 60);
  const mm = d.durationMinutes % 60;
  textAt(page, "DUREE", 52, rowBY, 8, bold, GREY);
  textAt(page, `${hh}h${String(mm).padStart(2, "0")}m`, 52, rowBY - 15, 12, bold, INK);

  textAt(page, "TERMINAL", 220, rowBY, 8, bold, GREY);
  textAt(page, d.terminal, 220, rowBY - 15, 12, bold, INK);

  textAt(page, "STATUT", 390, rowBY, 8, bold, GREY);
  textAt(page, "CONFIRME", 390, rowBY - 15, 12, bold, GREEN);

  // ── Ligne de découpe pointillée + encoches ─────────────────────────────
  page.drawLine({
    start: { x: 20, y: cutY },
    end: { x: W - 20, y: cutY },
    thickness: 1.4,
    color: BORDER,
    dashArray: [5, 4],
  });
  page.drawEllipse({ x: 4, y: cutY, xScale: 13, yScale: 13, color: WHITE });
  page.drawEllipse({ x: W - 4, y: cutY, xScale: 13, yScale: 13, color: WHITE });

  // ═══════════════════ SECTION BAS — CARTE D'EMBARQUEMENT ═══════════════════
  const bandH = 42;
  const bandY = cutY - bandH - 12;
  page.drawRectangle({ x: 4, y: bandY, width: W - 8, height: bandH, color: NAVY });
  planeIcon(page, 46, bandY + bandH / 2, 18, GOLD);
  textAt(page, "CARTE D'EMBARQUEMENT", 66, bandY + bandH / 2 - 6, 15, bold, GOLD);
  textAt(page, "CAONABO AIRLINES", W - 210, bandY + bandH / 2 - 5, 13, bold, WHITE);
  planeIcon(page, W - 34, bandY + bandH / 2, 14, WHITE);

  const contentTop = bandY - 14;
  const rightColX = W - 220;
  const dividerX = rightColX - 20;
  page.drawLine({
    start: { x: dividerX, y: bandY - 8 },
    end: { x: dividerX, y: 46 },
    thickness: 1,
    color: BORDER,
    dashArray: [4, 4],
  });

  // ── colonne gauche : classe / siège / porte / embarquement ──────────────
  const gCols = [30, 150, 260, 360];
  textAt(page, "CLASSE", gCols[0], contentTop, 9, bold, GREY);
  textAt(page, d.cabinClass.toUpperCase(), gCols[0], contentTop - 20, 14, bold, INK);
  textAt(page, CABIN_CODE[d.cabinClass] ?? "Y", gCols[0], contentTop - 34, 11, bold, GREY);

  textAt(page, "SIEGE", gCols[1], contentTop, 9, bold, GREY);
  textAt(page, d.seatLabel ?? "A ASSIGNER", gCols[1], contentTop - 20, 16, bold, INK);

  textAt(page, "PORTE", gCols[2], contentTop, 9, bold, GREY);
  textAt(page, d.gate ?? "A CONFIRMER", gCols[2], contentTop - 20, 16, bold, INK);

  textAt(page, "EMBARQUEMENT", gCols[3], contentTop, 9, bold, GREY);
  textAt(
    page,
    d.boardingAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    gCols[3],
    contentTop - 20,
    16,
    bold,
    INK,
  );

  const divY = contentTop - 50;
  page.drawLine({ start: { x: 30, y: divY }, end: { x: dividerX - 10, y: divY }, thickness: 1, color: BORDER });

  // bagages
  const bagY = divY - 24;
  suitcaseIcon(page, 44, bagY, 20, NAVY_LIGHT);
  textAt(page, `1 x ${d.includedCheckedKg} kg`, 66, bagY + 6, 11, bold, INK);
  textAt(page, "Bagage en soute", 66, bagY - 8, 9, font, GREY);

  suitcaseIcon(page, 244, bagY, 16, NAVY_LIGHT);
  textAt(page, `1 x ${d.includedCabinKg} kg`, 264, bagY + 6, 11, bold, INK);
  textAt(page, "Bagage a main", 264, bagY - 8, 9, font, GREY);

  const svcY = bagY - 44;
  badgeCircle(page, 44, svcY, 12, rgb(0.93, 0.9, 0.98));
  textAt(page, "Service a bord", 66, svcY + 6, 11, bold, INK);
  textAt(
    page,
    d.cabinClass === "Première classe" ? "Repas et boissons premium" : "Boissons et collation incluses",
    66,
    svcY - 8,
    9,
    font,
    GREY,
  );

  badgeCircle(page, 244, svcY, 12, rgb(0.93, 0.9, 0.98));
  textAt(page, "Assistance", 264, svcY + 6, 11, bold, INK);
  textAt(page, "Assistance de voyage incluse", 264, svcY - 8, 9, font, GREY);

  // ── colonne droite : QR code ─────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(d.verifyUrl, { margin: 1, width: 300 });
  const qrPngBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImg = await pdf.embedPng(qrPngBytes);
  const qrSize = 132;
  const qrX = rightColX + (W - 20 - rightColX - qrSize) / 2;
  const qrY = contentTop - qrSize + 6;
  page.drawImage(qrImg, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  textCentered(page, "PRESENTEZ CE CODE", rightColX + (W - 20 - rightColX) / 2, qrY - 18, 10, bold, NAVY);
  textCentered(page, "A LA PORTE D'EMBARQUEMENT", rightColX + (W - 20 - rightColX) / 2, qrY - 31, 10, bold, NAVY);

  // ── Footer ────────────────────────────────────────────────────────────
  const footerH = 30;
  page.drawRectangle({ x: 4, y: 20, width: W - 8, height: footerH, color: NAVY });
  const fy = 20 + footerH / 2 - 4;
  textAt(page, "www.caonaboairlines.com", 30, fy, 9.5, bold, WHITE);
  textAt(page, "+509 2810 4040", 250, fy, 9.5, bold, WHITE);
  textAt(page, "@caonaboairlines", 420, fy, 9.5, bold, WHITE);

  textCentered(
    page,
    "Les portes ferment 20 minutes avant le depart. Verifiez les ecrans pour toute mise a jour de vol.",
    W / 2,
    6,
    8,
    font,
    GREY,
  );

  return pdf.save();
}

/**
 * Génère (si nécessaire) la carte d'embarquement d'un passager check-iné,
 * la stocke dans Supabase Storage et renvoie le chemin du fichier. Idempotent :
 * si un boardingPassUrl existe déjà, ne régénère rien.
 */
export async function generateBoardingPassForPassenger(passengerId: string): Promise<string | null> {
  const p = await prisma.passenger.findUnique({
    where: { id: passengerId },
    include: {
      seat: true,
      booking: {
        include: {
          flight: { include: { route: { include: { origin: true, destination: true } } } },
        },
      },
    },
  });
  if (!p || !p.ticketNumber || !p.checkedInAt) return null;
  if (p.boardingPassUrl) return p.boardingPassUrl; // déjà généré (idempotent)

  const booking = p.booking;
  const flight = booking.flight;
  const origin = flight.route.origin;
  const destination = flight.route.destination;

  const policy = await prisma.baggagePolicy.findFirst();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://caonabo.vercel.app").replace(/\/$/, "");

  const bytes = await buildBoardingPassPdf({
    ticketNumber: p.ticketNumber,
    reference: booking.reference,
    passengerName: `${civilityLabel(p.civility)} ${p.firstName} ${p.lastName}`,
    cabinClass: booking.cabinClass,
    seatLabel: p.seat ? `${p.seat.row}${p.seat.column}` : null,
    gate: flight.gate,
    terminal: flight.terminal,
    boardingAt: boardingTimeFor(flight.departAt),
    originCode: origin.code,
    originCity: origin.city,
    originCountry: origin.country,
    destinationCode: destination.code,
    destinationCity: destination.city,
    destinationCountry: destination.country,
    flightNumber: flight.flightNumber,
    departAt: flight.departAt,
    arriveAt: flight.arriveAt,
    durationMinutes: flight.durationMinutes,
    includedCheckedKg: policy?.includedCheckedKg ?? 23,
    includedCabinKg: policy?.includedCabinKg ?? 8,
    verifyUrl: `${siteUrl}/verify/${p.ticketNumber}`,
  });

  const svc = getServiceClient();
  if (!svc) return null; // stockage serveur non configuré

  const objectPath = `${booking.reference}/${p.ticketNumber}.pdf`;
  const { error } = await svc.storage
    .from(BUCKET)
    .upload(objectPath, Buffer.from(bytes), { contentType: "application/pdf", upsert: true });
  if (error) throw new Error("Échec du stockage de la carte d'embarquement.");
  return objectPath;
}

function civilityLabel(c: string): string {
  return c === "MME" ? "Mme" : c === "MLLE" ? "Mlle" : "M.";
}

/** URL signée temporaire pour télécharger une carte d'embarquement stockée. */
export async function signedBoardingPassUrl(objectPath: string, expiresSec = 300): Promise<string | null> {
  const svc = getServiceClient();
  if (!svc) return null;
  const { data, error } = await svc.storage.from(BUCKET).createSignedUrl(objectPath, expiresSec);
  if (error || !data) return null;
  return data.signedUrl;
}
