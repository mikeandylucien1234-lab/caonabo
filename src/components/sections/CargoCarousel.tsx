"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Carrousel Cargo (mobile uniquement) : 2 cartes en scroll horizontal.
// La carte 1 est visible en entier + un bout de la carte 2 dépasse à droite
// pour inviter au swipe. Au clic → modale de contact (modèle ContactMessage
// existant via /api/contact).
// ─────────────────────────────────────────────────────────────────────────────

const CARDS = [
  { img: "/images/cargo/cargo-documents.png", title: "Documents & courrier" },
  { img: "/images/cargo/cargo-colis.png", title: "Colis standard" },
];

export default function CargoCarousel() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="cargo-mobile" style={{ padding: "4px 0 44px" }}>
      <div
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: 16,
          padding: "6px 16px 14px",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {CARDS.map((c) => (
          <button
            key={c.title}
            onClick={() => setActive(c.title)}
            aria-label={`En savoir plus sur ${c.title}`}
            style={{
              flex: "0 0 80%",
              scrollSnapAlign: "start",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 12px 34px rgba(20,10,60,0.16)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt={c.title} style={{ width: "100%", height: "auto", display: "block", borderRadius: 22 }} />
          </button>
        ))}
      </div>

      {active && <CargoContactModal service={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function CargoContactModal({ service, onClose }: { service: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`Je souhaite en savoir plus sur ${service}.`);
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!name.trim()) return setError("Votre nom est requis.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError("Un email valide est requis.");
    if (message.trim().length < 10) return setError("Votre message doit contenir au moins 10 caractères.");
    setStatus("sending");
    try {
      const body = {
        name: name.trim(),
        email: email.trim(),
        subject: "Autre",
        message: `[Cargo — ${service}] ${message.trim()}${phone.trim() ? `\nTéléphone : ${phone.trim()}` : ""}`,
      };
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'envoi.");
      setStatus("ok");
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi.");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,10,45,0.5)", zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "min(440px, 100%)", padding: "22px 22px 24px", boxShadow: "0 30px 80px rgba(10,5,40,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="font-heading" style={{ fontWeight: 800, fontSize: 18, color: "#1e1b4b" }}>
            {status === "ok" ? "Message envoyé" : service}
          </div>
          <button onClick={onClose} aria-label="Fermer" style={{ background: "#f2f2f8", border: "none", borderRadius: 999, width: 32, height: 32, fontSize: 17, cursor: "pointer", color: "#6b6b80" }}>×</button>
        </div>

        {status === "ok" ? (
          <div style={{ textAlign: "center", padding: "10px 4px 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "#e3f7ea", color: "#1f9d55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>✓</div>
            <p style={{ fontSize: 14.5, color: "#3a3a55", lineHeight: 1.55, margin: "0 0 18px" }}>
              Merci ! Votre demande concernant <b>{service}</b> a bien été envoyée. Notre équipe vous recontactera rapidement.
            </p>
            <button onClick={onClose} style={btnStyle}>Fermer</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: "#6b6b80", margin: "0 0 16px", lineHeight: 1.5 }}>
              Laissez-nous vos coordonnées, nous revenons vers vous au sujet de <b>{service}</b>.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input style={inputStyle} placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={inputStyle} placeholder="Votre email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input style={inputStyle} placeholder="Votre téléphone (facultatif)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <textarea style={{ ...inputStyle, minHeight: 84, resize: "vertical", fontFamily: "inherit" }} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{error}</p>}
            <button onClick={submit} disabled={status === "sending"} style={{ ...btnStyle, marginTop: 16, opacity: status === "sending" ? 0.7 : 1 }}>
              {status === "sending" ? "Envoi…" : "Envoyer"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1.5px solid #dcdae6",
  fontSize: 15,
  color: "#1e1b4b",
  width: "100%",
  background: "#fff",
};
const btnStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#3d1e8a",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  padding: "13px 20px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
};
