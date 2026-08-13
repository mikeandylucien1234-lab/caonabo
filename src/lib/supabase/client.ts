"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client Supabase navigateur (clé anon publique). Toutes les lectures/écritures
// de l'admin passent par lui, sous protection des politiques RLS (rôle admin).
let cached: SupabaseClient | null = null;

// Valeurs PUBLIQUES de repli (URL + clé anon Supabase) : sans danger à exposer,
// l'accès reste protégé par les politiques RLS. Les variables d'environnement,
// si définies, ont la priorité (permet de basculer vers un autre projet).
const FALLBACK_URL = "https://xfdugmfqyphmjdbghlow.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZHVnbWZxeXBobWpkYmdobG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTExMTIsImV4cCI6MjEwMjAyNzExMn0.G9iC98mvEb3MN_Ug3KnZ9NIY0rv8B51Igrl2Xl8gi-E";

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON;
  if (!url || !key) {
    throw new Error("Configuration Supabase manquante.");
  }
  cached = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return cached;
}
