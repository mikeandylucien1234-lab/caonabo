"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Section newsletter « Ne manquez jamais une offre » (desktop uniquement).
// Gauche : visuel. Droite : formulaire fonctionnel (POST /api/newsletter/subscribe).
// ─────────────────────────────────────────────────────────────────────────────

const INK = "#1e1b4b";
const VIOLET = "#a78bfa"; // violet clair lisible sur fond indigo foncé

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [already, setAlready] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const canSubmit = emailValid && consent && status !== "sending";

  async function subscribe() {
    setError(null);
    if (!emailValid) return setError("Veuillez saisir une adresse e-mail valide.");
    if (!consent) return setError("Veuillez cocher la case pour accepter de recevoir nos communications.");
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consentGiven: consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue.");
      setAlready(Boolean(data.already));
      setStatus("ok");
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    }
  }

  return (
    <section className="newsletter-desktop" style={{ padding: "10px 0 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 460, borderRadius: 28, overflow: "hidden", boxShadow: "0 18px 50px rgba(20,10,60,0.18)" }}>
        {/* GAUCHE : visuel + dégradé de fondu vers le bloc indigo (jonction douce) */}
        <div
          style={{
            position: "relative",
            backgroundImage: "url('/images/newsletter-hero.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(30,27,75,0) 52%, rgba(30,27,75,0.55) 80%, rgba(30,27,75,0.92) 96%, #1e1b4b 100%)",
            }}
          />
        </div>

        {/* DROITE : formulaire */}
        <div style={{ background: INK, padding: "54px 56px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {status === "ok" ? (
            <div>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(167,139,250,0.18)", color: VIOLET, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20 }}>✓</div>
              <h2 className="font-heading" style={{ color: "#fff", fontSize: 34, fontWeight: 800, margin: "0 0 12px" }}>
                {already ? "Vous êtes déjà inscrit !" : "Merci, vous êtes inscrit !"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, lineHeight: 1.55, margin: 0, maxWidth: 460 }}>
                {already
                  ? "Cette adresse recevait déjà nos offres exclusives. Rien à faire de plus."
                  : "Vous recevrez désormais nos offres exclusives en avant-première. Surveillez votre boîte mail !"}
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-heading" style={{ color: "#fff", fontSize: 44, fontWeight: 800, lineHeight: 1.1, margin: "0 0 14px" }}>
                Ne manquez jamais <span style={{ color: VIOLET }}>une offre</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 17, lineHeight: 1.5, margin: "0 0 26px", maxWidth: 460 }}>
                Abonnez-vous et soyez les premiers à recevoir nos offres exclusives.
              </p>

              {/* champ email avec icône enveloppe */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 999, padding: "6px 8px 6px 20px", maxWidth: 520 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M3.5 6.5l8.5 6 8.5-6" />
                </svg>
                <input
                  type="email"
                  placeholder="Adresse e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && subscribe()}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: INK, background: "transparent", padding: "10px 4px" }}
                />
              </div>

              {/* consentement */}
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 20, maxWidth: 520, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  style={{ marginTop: 3, width: 18, height: 18, accentColor: VIOLET, flexShrink: 0, cursor: "pointer" }}
                />
                <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 13.5, lineHeight: 1.5 }}>
                  J&rsquo;aimerais recevoir des offres et des actualités de <b style={{ color: "#fff" }}>Caonabo</b>. Je comprends que je peux me désabonner à tout moment en utilisant le lien en bas de chaque message.
                </span>
              </label>

              {error && <p style={{ color: "#ffb4b4", fontSize: 13.5, marginTop: 12 }}>{error}</p>}

              <button
                onClick={subscribe}
                disabled={!canSubmit}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 22,
                  alignSelf: "flex-start",
                  background: "#5b21b6",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  padding: "15px 32px",
                  borderRadius: 999,
                  border: "none",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.55,
                }}
              >
                {status === "sending" ? "Inscription…" : "S'abonner"} <span aria-hidden>→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
