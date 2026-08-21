import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// Règles réelles d'aéroport pour le check-in en ligne :
//   - ouverture 24h avant le départ
//   - fermeture 1h avant le départ (heure qui sert aussi d'heure d'embarquement
//     affichée sur la carte — cohérent avec le billet de référence : départ
//     08:30, embarquement 07:30)
// L'heure d'embarquement n'est jamais stockée en base : elle se déduit
// toujours de departAt, pour rester cohérente si un vol est retardé/avancé.
// ─────────────────────────────────────────────────────────────────────────────

export const CHECKIN_OPENS_HOURS_BEFORE = 24;
export const CHECKIN_CLOSES_HOURS_BEFORE = 1;

export type CheckInWindowState = "too-early" | "open" | "too-late";

export interface CheckInWindow {
  state: CheckInWindowState;
  opensAt: Date;
  closesAt: Date;
}

/** Heure d'embarquement affichée : départ - 1h (fermeture des portes). */
export function boardingTimeFor(departAt: Date): Date {
  return new Date(departAt.getTime() - CHECKIN_CLOSES_HOURS_BEFORE * 3600 * 1000);
}

/** Détermine si le check-in en ligne est ouvert pour un vol, à l'instant `now`. */
export function checkInWindow(departAt: Date, now: Date = new Date()): CheckInWindow {
  const opensAt = new Date(departAt.getTime() - CHECKIN_OPENS_HOURS_BEFORE * 3600 * 1000);
  const closesAt = boardingTimeFor(departAt);
  let state: CheckInWindowState;
  if (now < opensAt) state = "too-early";
  else if (now > closesAt) state = "too-late";
  else state = "open";
  return { state, opensAt, closesAt };
}

/**
 * Message utilisateur clair selon l'état de la réservation/fenêtre. Retourne
 * null si le check-in peut être présenté (paiement OK, réservation active,
 * fenêtre ouverte).
 */
export function checkInBlockReason(params: {
  paymentStatus: string;
  bookingStatus: string;
  window: CheckInWindowState;
  opensAt: Date;
}): string | null {
  if (params.bookingStatus === "cancelled") {
    return "Cette réservation a été annulée. Le check-in n'est pas disponible.";
  }
  if (params.paymentStatus !== "PAID") {
    return "Cette réservation n'est pas encore payée. Le check-in en ligne n'est disponible qu'après confirmation du paiement.";
  }
  if (params.window === "too-early") {
    const d = params.opensAt.toLocaleString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Le check-in en ligne n'est pas encore ouvert. Il ouvre le ${d} (24h avant le départ).`;
  }
  if (params.window === "too-late") {
    return "Le check-in en ligne est fermé (moins d'1h avant le départ). Présentez-vous directement au comptoir de l'aéroport.";
  }
  return null;
}

/** Génère un numéro de billet réaliste : CAO + AAMMJJ (jour du check-in) + 6 chiffres. */
export function makeTicketNumber(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `CAO${yy}${mm}${dd}${seq}`;
}

/** Affichage lisible du numéro de billet : "CAO 250912345678". */
export function formatTicketNumber(ticketNumber: string): string {
  return `${ticketNumber.slice(0, 3)} ${ticketNumber.slice(3)}`;
}
