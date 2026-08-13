"use client";

import { useEffect, useRef, useState } from "react";
import type { PromotionDTO } from "@/lib/data/types";
import { formatPrice, type RateInfo } from "@/lib/currency";

/**
 * "Promotions Caonabo" — carrousel horizontal : une grande carte à la fois,
 * navigation par flèches (précédent / suivant), scroll tactile et pastilles.
 * Inspiré des cartes promo « grand format » (image pleine largeur + badges).
 */
export default function Promotions({
  promotions,
  rates,
}: {
  promotions: PromotionDTO[];
  rates: Record<string, RateInfo>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // met à jour la pastille active selon la position de défilement
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const cCenter = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cCenter - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToIndex(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(promotions.length - 1, i));
    const card = el.children[clamped] as HTMLElement | undefined;
    if (card) {
      el.scrollTo({
        left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="hz" style={{ padding: "72px 0 88px" }}>
      <div
        className="section-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 36,
          padding: "0 56px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              color: "#5b21b6",
              marginBottom: 8,
            }}
          >
            OFFRES DU MOMENT
          </div>
          <h2
            className="font-heading"
            style={{ fontWeight: 800, fontSize: 34, color: "#0f0f2d", margin: "0 0 10px" }}
          >
            Promotions <span style={{ color: "#5b21b6" }}>Caonabo</span>
          </h2>
          <p style={{ fontSize: 15, color: "#5c5c7a", margin: 0 }}>
            Tarifs aller-retour toutes taxes comprises, dans la limite des places
            disponibles.
          </p>
        </div>
        <a
          href="/destinations"
          className="promo-see-all"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            color: "#3d1e8a",
            fontWeight: 600,
            fontSize: 14,
            padding: "13px 22px",
            borderRadius: 12,
            border: "1.5px solid #3d1e8a",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          🏷 Voir toutes les promotions →
        </a>
      </div>

      {/* piste défilante */}
      <div
        ref={trackRef}
        className="promo-track"
        style={{
          display: "flex",
          gap: 24,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: "6px 56px 10px",
          scrollbarWidth: "none",
        }}
      >
        {promotions.map((p) => {
          const discount =
            p.oldPriceUsdCents > 0
              ? Math.round((1 - p.priceUsdCents / p.oldPriceUsdCents) * 100)
              : 0;
          return (
            <a
              key={p.id}
              href={`/offre/${p.slug}`}
              className="promo-card"
              style={{
                scrollSnapAlign: "center",
                flex: "0 0 auto",
                width: "min(640px, 86vw)",
                borderRadius: 22,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 14px 40px rgba(20,10,60,0.14)",
                border: "1px solid #f0eef7",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {/* image + badges superposés */}
              <div className="promo-img" style={{ position: "relative", height: 300 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.placeholder}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 18,
                    bottom: -1,
                    display: "flex",
                    alignItems: "stretch",
                  }}
                >
                  <span
                    style={{
                      background: "#fff",
                      color: "#5b21b6",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 16px",
                      borderRadius: "12px 0 0 0",
                    }}
                  >
                    ¡Destinations incontournables !
                  </span>
                  <span
                    style={{
                      background: p.accentColor,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "10px 16px",
                      borderRadius: "0 12px 0 0",
                    }}
                  >
                    {p.tag}
                  </span>
                </div>
              </div>

              {/* corps blanc */}
              <div style={{ padding: "22px 26px 26px" }}>
                <div style={{ fontWeight: 800, fontSize: 26, color: "#0f0f2d", marginBottom: 4 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 14, color: "#8a8aa0", marginBottom: 16 }}>
                  <b style={{ color: "#5c5c7a" }}>{p.routeLabel}</b>
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  <span
                    style={{
                      background: "#5b21b6",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "7px 16px",
                      borderRadius: 999,
                    }}
                  >
                    {p.category}
                  </span>
                  <span
                    style={{
                      background: "#fbe86a",
                      color: "#5c4a00",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "7px 16px",
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    ✦ Cumule des <b>miles</b>
                  </span>
                </div>

                <div style={{ fontSize: 14, color: "#5c5c7a", marginBottom: 4 }}>Prix dès</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 30, color: "#0f0f2d" }}>
                    {formatPrice(p.priceUsdCents, "USD", rates)}
                  </span>
                  {discount > 0 && (
                    <span
                      style={{
                        background: "#e11d5b",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 15,
                        padding: "5px 14px",
                        borderRadius: 999,
                      }}
                    >
                      ● −{discount}%
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 16,
                      color: "#b4b2c4",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatPrice(p.oldPriceUsdCents, "USD", rates)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#a0a0b4" }}>Taxes incluses</div>
              </div>
            </a>
          );
        })}
      </div>

      {/* contrôles : flèches + pastilles */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          marginTop: 22,
          padding: "0 56px",
        }}
      >
        <button aria-label="Précédent" onClick={() => scrollToIndex(active - 1)} style={arrowBtn}>
          ←
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {promotions.map((_, i) => (
            <button
              key={i}
              aria-label={`Aller à la promotion ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              style={{
                width: i === active ? 26 : 9,
                height: 9,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: i === active ? "#e11d5b" : "#d8d3e6",
                transition: "all .25s",
              }}
            />
          ))}
        </div>
        <button aria-label="Suivant" onClick={() => scrollToIndex(active + 1)} style={arrowBtn}>
          →
        </button>
      </div>
    </div>
  );
}

const arrowBtn: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 999,
  border: "1.5px solid #e11d5b",
  background: "#fff",
  color: "#e11d5b",
  fontSize: 20,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
