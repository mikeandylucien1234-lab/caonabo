import "server-only";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Limitation de débit basée sur Postgres (pas de service externe) : chaque
// requête autorisée écrit une ligne, on compte les lignes récentes pour une
// clé (endpoint + identifiant) sur une fenêtre glissante. Fonctionne de façon
// fiable même sur des fonctions serverless sans état partagé en mémoire.
// ─────────────────────────────────────────────────────────────────────────────

/** IP du client à partir des en-têtes de proxy (Vercel les renseigne toujours). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Vérifie et enregistre une tentative pour `key`. Renvoie `true` si la
 * requête est autorisée (sous la limite), `false` si elle doit être rejetée.
 * Purge au passage les vieilles entrées de cette clé pour éviter une
 * croissance illimitée de la table.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: since } },
  });
  if (count >= limit) return false;

  await prisma.rateLimitHit.create({ data: { key } });
  // Purge best-effort (ne bloque pas la réponse en cas d'échec).
  prisma.rateLimitHit
    .deleteMany({ where: { key, createdAt: { lt: since } } })
    .catch(() => {});
  return true;
}

export function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Trop de tentatives. Réessayez dans quelques minutes." }),
    { status: 429, headers: { "Content-Type": "application/json" } },
  );
}
