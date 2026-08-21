"use client";

import { useState } from "react";

const SUBJECTS = ["Réservation", "Réclamation", "Presse", "Cargo", "Autre"];

const inputStyle: React.CSSProperties = {
  padding: "13px 15px",
  borderRadius: 12,
  border: "1.5px solid #dcdae6",
  fontSize: 14,
  color: "#1e1b4b",
  width: "100%",
  background: "#fff",
};

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Réservation");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
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
        <div style={{ fontSize: 44 }}>✅</div>
        <h3
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 22, color: "#1e1b4b", margin: "12px 0 8px" }}
        >
          Message envoyé !
        </h3>
        <p style={{ color: "#5c5c7a", fontSize: 14 }}>
          Votre message a bien été envoyé, nous vous répondrons sous 24-48h à <b>{email}</b>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="bk-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Nom complet *">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        </Field>
        <Field label="Email *">
          <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </Field>
      </div>
      <Field label="Téléphone (facultatif)">
        <input type="tel" style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+509 3712 3456" />
      </Field>
      <Field label="Sujet *">
        <select style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Message *">
        <textarea
          style={{ ...inputStyle, minHeight: 140, resize: "vertical", fontFamily: "inherit" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Comment pouvons-nous vous aider ?"
        />
      </Field>
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
        {loading ? "Envoi…" : "Envoyer le message"} <span>→</span>
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
