"use client";

// Pile de cartes au SCROLL (mobile) — 3 visuels "Préparez-vous".
// Technique : position: sticky. Chaque carte se fige près du haut ; la carte
// suivante remonte et vient la recouvrir (en laissant apparaître un léger bord
// de celles du dessous). Entièrement réversible et fluide (défilement natif).

const CARDS = [
  { src: "/images/prep-card-1.jpg", alt: "Effectuez votre Web Check-In" },
  { src: "/images/prep-card-2.jpg", alt: "Arrivez à l'aéroport trois heures avant" },
  { src: "/images/prep-card-3.jpg", alt: "Vérifiez les exigences de voyage" },
];

export default function PrepStack() {
  return (
    <div className="prep-scroll">
      {CARDS.map((c, i) => (
        <div
          key={i}
          className="prep-card-sticky"
          style={{
            position: "sticky",
            top: `calc(14vh + ${i * 16}px)`,
            zIndex: i + 1,
            marginTop: i === 0 ? 0 : "42vh",
            width: "100%",
            maxWidth: 440,
            marginLeft: "auto",
            marginRight: "auto",
            aspectRatio: "1381 / 1139",
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 22px 46px rgba(20,10,60,0.22)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.src}
            alt={c.alt}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      ))}
      {/* espace de fin pour laisser la dernière carte figée un instant */}
      <div style={{ height: "26vh" }} />
    </div>
  );
}
