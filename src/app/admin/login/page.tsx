"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/admin/AdminProviders";
import { INK, PURPLE, inputStyle } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // déjà connecté en admin → vers le tableau de bord
  useEffect(() => {
    if (!authLoading && session && isAdmin) router.replace("/admin");
  }, [authLoading, session, isAdmin, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabase();
    try {
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signErr) throw new Error("Identifiants invalides.");
      const { data: adminData } = await supabase.rpc("is_admin");
      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error("Ce compte n'a pas accès au back-office.");
      }
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: INK, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 22, boxShadow: "0 30px 80px rgba(0,0,0,0.35)", padding: "38px 36px", width: "min(420px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Caonabo" style={{ height: 54, width: "auto", marginBottom: 12 }} />
          <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 24, color: INK, margin: "0 0 4px" }}>
            Back-office
          </h1>
          <p style={{ color: "#8a8aa0", fontSize: 14, margin: 0 }}>Accès réservé aux administrateurs.</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="email" placeholder="Email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          <input type="password" placeholder="Mot de passe" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          {error && <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ background: PURPLE, color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px", borderRadius: 12, border: "none", cursor: loading ? "wait" : "pointer", marginTop: 4 }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
