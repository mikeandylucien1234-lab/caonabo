import "server-only";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Client de l'API Flow (flow.cl).
//   - Authentification : chaque requête est signée (HMAC-SHA256 des paramètres
//     triés, avec la clé secrète). Le paramètre `s` porte la signature.
//   - Environnements : SANDBOX (test) vs PRODUCTION, choisis en base (mode).
//   - Les clés (apiKey/secret) sont DÉCHIFFRÉES ici uniquement, jamais loguées,
//     jamais renvoyées au frontend.
// Réf. API : https://www.flow.cl/docs/api.html
// ─────────────────────────────────────────────────────────────────────────────

const SANDBOX_BASE = "https://sandbox.flow.cl/api";
const PRODUCTION_BASE = "https://www.flow.cl/api";

export interface FlowContext {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  mode: "SANDBOX" | "PRODUCTION";
}

/** Signature Flow : params triés par nom, concaténés name+value, HMAC-SHA256 hex. */
export function signFlow(params: Record<string, string>, secretKey: string): string {
  const sorted = Object.keys(params).sort();
  const toSign = sorted.map((k) => k + params[k]).join("");
  return createHmac("sha256", secretKey).update(toSign).digest("hex");
}

/**
 * Charge la configuration Flow (clés déchiffrées + URL selon le mode).
 * Lève une erreur SANS jamais exposer les clés si non configuré.
 */
export async function getFlowContext(): Promise<FlowContext> {
  const s = await prisma.paymentSettings.findFirst();
  if (!s || !s.isConfigured || !s.apiKeyEncrypted || !s.secretKeyEncrypted) {
    throw new Error("FLOW_NOT_CONFIGURED");
  }
  const mode = s.mode === "PRODUCTION" ? "PRODUCTION" : "SANDBOX";
  return {
    apiKey: decryptSecret(s.apiKeyEncrypted),
    secretKey: decryptSecret(s.secretKeyEncrypted),
    baseUrl: mode === "PRODUCTION" ? PRODUCTION_BASE : SANDBOX_BASE,
    mode,
  };
}

function baseUrlFor(mode: string): string {
  return mode === "PRODUCTION" ? PRODUCTION_BASE : SANDBOX_BASE;
}

// Requête signée générique. Ne loggue jamais apiKey / secret / signature.
async function flowRequest(
  ctx: FlowContext,
  endpoint: string,
  method: "GET" | "POST",
  params: Record<string, string | number>,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const all: Record<string, string> = { apiKey: ctx.apiKey };
  for (const [k, v] of Object.entries(params)) all[k] = String(v);
  all.s = signFlow(all, ctx.secretKey);

  let res: Response;
  if (method === "GET") {
    const qs = new URLSearchParams(all).toString();
    res = await fetch(`${ctx.baseUrl}${endpoint}?${qs}`, { method: "GET" });
  } else {
    res = await fetch(`${ctx.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(all).toString(),
    });
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = { message: await res.text().catch(() => "") };
  }
  return { ok: res.ok, status: res.status, data };
}

export interface CreatePaymentInput {
  commerceOrder: string; // notre référence de réservation (unique)
  subject: string; // libellé
  amount: number; // entier pour CLP, décimales possibles pour USD
  currency: string; // "CLP" | "USD" ...
  email: string;
  urlConfirmation: string; // webhook (Flow POST) — doit être public
  urlReturn: string; // retour utilisateur
}

export interface CreatePaymentResult {
  token: string;
  url: string; // page de paiement Flow (rediriger vers url?token=token)
  flowOrder: number;
  redirectUrl: string;
}

/** Crée un paiement Flow. Retourne le token + l'URL de redirection. */
export async function createFlowPayment(
  ctx: FlowContext,
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const { ok, data } = await flowRequest(ctx, "/payment/create", "POST", {
    commerceOrder: input.commerceOrder,
    subject: input.subject,
    currency: input.currency,
    amount: input.amount,
    email: input.email,
    urlConfirmation: input.urlConfirmation,
    urlReturn: input.urlReturn,
    paymentMethod: 9, // 9 = tous les moyens de paiement disponibles
  });
  const d = data as { token?: string; url?: string; flowOrder?: number; message?: string };
  if (!ok || !d.token || !d.url) {
    throw new Error(d.message || "Échec de création du paiement Flow.");
  }
  return {
    token: d.token,
    url: d.url,
    flowOrder: d.flowOrder ?? 0,
    redirectUrl: `${d.url}?token=${d.token}`,
  };
}

export interface FlowStatus {
  status: number; // 1 en attente · 2 payé · 3 rejeté · 4 annulé
  commerceOrder: string;
  amount: number;
  currency: string;
  media: string | null; // moyen de paiement (paymentData.media)
  paymentDate: string | null;
}

/**
 * Interroge Flow pour l'état RÉEL d'un paiement (source de vérité). Utilisé par
 * le webhook : le webhook fournit seulement un token, on vérifie l'authenticité
 * en interrogeant directement l'API Flow (requête signée avec notre secret).
 */
export async function getFlowStatus(ctx: FlowContext, token: string): Promise<FlowStatus> {
  const { ok, data } = await flowRequest(ctx, "/payment/getStatus", "GET", { token });
  const d = data as {
    status?: number;
    commerceOrder?: string;
    amount?: number | string;
    currency?: string;
    paymentData?: { media?: string; date?: string };
    message?: string;
  };
  if (!ok || typeof d.status !== "number") {
    throw new Error(d.message || "Impossible de vérifier le statut du paiement.");
  }
  return {
    status: d.status,
    commerceOrder: d.commerceOrder ?? "",
    amount: typeof d.amount === "string" ? parseFloat(d.amount) : d.amount ?? 0,
    currency: d.currency ?? "",
    media: d.paymentData?.media ?? null,
    paymentDate: d.paymentData?.date ?? null,
  };
}

/**
 * Test de connexion non destructif : appelle un endpoint en lecture seule
 * (liste des clients) avec les clés fournies. Succès = réponse valide de Flow ;
 * échec = clé/signature invalide. Ne crée aucune ressource.
 */
export async function testFlowConnection(
  apiKey: string,
  secretKey: string,
  mode: "SANDBOX" | "PRODUCTION",
): Promise<{ success: boolean; message: string }> {
  const ctx: FlowContext = { apiKey, secretKey, baseUrl: baseUrlFor(mode), mode };
  try {
    const { ok, status, data } = await flowRequest(ctx, "/customer/list", "GET", {
      start: 0,
      limit: 1,
    });
    if (ok) {
      return { success: true, message: "Connexion Flow réussie." };
    }
    const msg =
      (data as { message?: string })?.message ||
      `Échec (HTTP ${status}). Vérifiez les clés et le mode.`;
    return { success: false, message: msg };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Erreur réseau vers Flow.",
    };
  }
}
