import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Valeurs publiques (identiques au client navigateur) — sans danger.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xfdugmfqyphmjdbghlow.supabase.co";
const ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZHVnbWZxeXBobWpkYmdobG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTExMTIsImV4cCI6MjEwMjAyNzExMn0.G9iC98mvEb3MN_Ug3KnZ9NIY0rv8B51Igrl2Xl8gi-E";

/**
 * Vérifie qu'une requête API provient bien d'un ADMIN authentifié.
 * Le client envoie le jeton d'accès Supabase (Authorization: Bearer <token>).
 * On valide le jeton (signature) via getUser puis on contrôle is_admin() (RLS).
 */
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  const sb = createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error } = await sb.auth.getUser();
  if (error || !userData.user) return false;
  const { data: adminData } = await sb.rpc("is_admin");
  return Boolean(adminData);
}

/**
 * Client Supabase avec la clé service_role (contourne la RLS) — réservé aux
 * opérations serveur qui n'ont pas de session admin, ex. écriture du
 * comprobante dans Storage depuis le webhook Flow. Null si la clé n'est pas
 * configurée (SUPABASE_SERVICE_ROLE_KEY).
 */
export function getServiceClient(): SupabaseClient | null {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!svc) return null;
  return createClient(URL, svc, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isServiceRoleAvailable(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
