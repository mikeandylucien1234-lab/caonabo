"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    padding: "13px 16px",
    borderRadius: 12,
    border: "1.5px solid #dcdae6",
    fontSize: 15,
    color: "#1e1b4b",
    width: "100%",
  };

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? { email, password, firstName, lastName }
            : { email, password },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      router.push("/account");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hz" style={{ padding: "56px 56px 100px", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 8px 30px rgba(20,10,60,0.10)",
          border: "1px solid #eceafa",
          padding: "34px 34px",
        }}
      >
        <h1
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 26, color: "#0f0f2d", margin: "0 0 6px" }}
        >
          {isRegister ? "Créer un compte" : "Connexion"}
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 14, margin: "0 0 24px" }}>
          {isRegister
            ? "Rejoignez Caonabo pour gérer vos réservations."
            : "Accédez à vos réservations Caonabo."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isRegister && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Prénom" style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <input placeholder="Nom" style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          )}
          <input placeholder="Email" type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Mot de passe" type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              marginTop: 4,
              background: "#3d1e8a",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "14px",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "…" : isRegister ? "Créer mon compte" : "Se connecter"}
          </button>
        </div>

        <div style={{ marginTop: 20, fontSize: 14, color: "#5c5c7a", textAlign: "center" }}>
          {isRegister ? (
            <>Déjà un compte ? <Link href="/login">Se connecter</Link></>
          ) : (
            <>Pas encore de compte ? <Link href="/register">Créer un compte</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
