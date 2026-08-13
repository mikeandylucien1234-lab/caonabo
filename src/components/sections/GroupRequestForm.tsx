"use client";

import { useState } from "react";

const inputStyle: React.CSSProperties = {
  padding: "13px 15px",
  borderRadius: 12,
  border: "1.5px solid #dcdae6",
  fontSize: 14,
  color: "#1e1b4b",
  width: "100%",
  background: "#fff",
};

export default function GroupRequestForm() {
  const [travelers, setTravelers] = useState("10");
  const [route, setRoute] = useState("");
  const [approxDates, setApproxDates] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/group-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelers, route, approxDates, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 44 }}>🎉</div>
        <h3
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 22, color: "#1e1b4b", margin: "12px 0 8px" }}
        >
          Demande envoyée !
        </h3>
        <p style={{ color: "#5c5c7a", fontSize: 14 }}>
          Merci ! Un conseiller Caonabo vous prépare un devis personnalisé et vous
          contactera à <b>{email}</b>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Nombre de voyageurs *">
          <input
            type="number"
            min={2}
            style={inputStyle}
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
          />
        </Field>
        <Field label="Route souhaitée *">
          <input
            style={inputStyle}
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="ex : Santiago → Port-au-Prince"
          />
        </Field>
      </div>
      <Field label="Dates approximatives">
        <input
          style={inputStyle}
          value={approxDates}
          onChange={(e) => setApproxDates(e.target.value)}
          placeholder="ex : première quinzaine de décembre 2026"
        />
      </Field>
      <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Email de contact *">
          <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </Field>
        <Field label="Téléphone">
          <input style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 ..." />
        </Field>
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#3d1e8a",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          padding: "14px 28px",
          borderRadius: 12,
          border: "none",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Envoi…" : "Demander un devis groupe"} <span>→</span>
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#5c5c7a", marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}
