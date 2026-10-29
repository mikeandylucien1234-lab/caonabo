"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Section « processus de réservation » (desktop uniquement) :
//   • Gauche : visuel fixe « Vos bagages, notre priorité ».
//   • Droite : carrousel automatique des 4 étapes, façon stories (barre de
//     progression segmentée), avec flèches préc./suiv. et pause/lecture.
// Les images portent leur propre texte → aucune chaîne à traduire ici.
// L'habillage (barre, flèches, contrôles) reste aux couleurs Caonabo pour
// harmoniser la section malgré les couleurs propres à chaque étape.
// ─────────────────────────────────────────────────────────────────────────────

const PURPLE = "#5b21b6";
const PURPLE_DK = "#3d1e8a";
const DURATION = 4500; // ms par étape
const TICK = 50;

const STEPS = [
  { src: "/images/booking-steps/step-1-search.jpg", alt: "Étape 1 — Rechercher un vol" },
  { src: "/images/booking-steps/step-2-select.jpg", alt: "Étape 2 — Sélectionner votre vol" },
  { src: "/images/booking-steps/step-3-passengers.jpg", alt: "Étape 3 — Informations passagers" },
  { src: "/images/booking-steps/step-4-baggage.jpg", alt: "Étape 4 — Bagages & confirmation" },
];
const N = STEPS.length;

export default function BookingStepsShowcase() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  // Avance la progression de l'étape courante.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setProgress((p) => p + (TICK / DURATION) * 100), TICK);
    return () => clearInterval(id);
  }, [paused]);

  // Passe à l'étape suivante quand la progression est pleine.
  useEffect(() => {
    if (progress >= 100) {
      setProgress(0);
      setIndex((i) => (i + 1) % N);
    }
  }, [progress]);

  function go(next: number) {
    setIndex(((next % N) + N) % N);
    setProgress(0);
  }

  return (
    <section className="bookflow hz" style={{ padding: "20px 56px 60px" }}>
      <div
        className="bf-card"
        style={{
          display: "grid",
          gridTemplateColumns: "36% 1fr",
          gap: 24,
          alignItems: "stretch",
          background: "#fff",
          border: "1px solid #eceafa",
          borderRadius: 24,
          padding: 20,
          boxShadow: "0 10px 34px rgba(30,27,75,0.08)",
        }}
      >
        {/* GAUCHE : visuel fixe (desktop) OU texte équivalent (mobile) */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            background: "#f3effe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="bf-left-img"
            src="/images/booking-steps/security-trust.jpg"
            alt="Vos bagages, notre priorité"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
          <div className="bf-left-text">
            <div className="font-heading bf-left-title" style={{ color: PURPLE_DK, fontWeight: 800, lineHeight: 1.15 }}>
              Vos bagages, <span style={{ color: PURPLE }}>notre priorité</span>
            </div>
            <p className="bf-left-sub" style={{ color: "#5c5c7a", lineHeight: 1.45, margin: 0 }}>
              Vos bagages voyagent en toute sécurité, du départ à l&rsquo;arrivée. Personne ne les ouvre, rien ne disparaît.
            </p>
          </div>
        </div>

        {/* DROITE : carrousel des 4 étapes */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* barre de progression segmentée */}
          <div className="bf-bar" style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {STEPS.map((_, i) => {
              const fill = i < index ? 100 : i === index ? Math.min(progress, 100) : 0;
              return (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: "#e6e1f5", overflow: "hidden" }}>
                  <div style={{ width: `${fill}%`, height: "100%", background: PURPLE, transition: "width .05s linear" }} />
                </div>
              );
            })}
          </div>

          {/* visionneuse (16:9), crossfade entre étapes */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 16, overflow: "hidden", background: "#f6f4fc" }}>
            {STEPS.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: i === index ? 1 : 0,
                  transition: "opacity .4s ease",
                }}
              />
            ))}
          </div>

          {/* contrôles : pause/lecture · flèches · indicateur */}
          <div className="bf-controls" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Lecture" : "Pause"}
              className="bf-ctrl"
              style={ctrlStyle}
            >
              {paused ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={PURPLE_DK} aria-hidden><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill={PURPLE_DK} aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              )}
            </button>

            <div className="bf-nav" style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => go(index - 1)} aria-label="Étape précédente" className="bf-ctrl" style={ctrlStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE_DK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <span className="bf-idx" style={{ fontWeight: 800, fontSize: 14, color: "#1e1b4b", minWidth: 34, textAlign: "center" }}>
                {index + 1}/{N}
              </span>
              <button onClick={() => go(index + 1)} aria-label="Étape suivante" className="bf-ctrl" style={ctrlStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PURPLE_DK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ctrlStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1.5px solid #e0dcf0",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
