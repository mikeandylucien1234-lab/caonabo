import type { PromotionDTO } from "@/lib/data/types";
import { formatPrice, type RateInfo } from "@/lib/currency";

/**
 * "Promotions Caonabo" — 5 cartes. Les prix du proto sont en USD ; on les
 * affiche donc en USD (devise pivot), avec l'ancien prix barré.
 */
export default function Promotions({
  promotions,
  rates,
}: {
  promotions: PromotionDTO[];
  rates: Record<string, RateInfo>;
}) {
  return (
    <div style={{ padding: "72px 56px 88px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 36,
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
            style={{
              fontWeight: 800,
              fontSize: 34,
              color: "#0f0f2d",
              margin: "0 0 10px",
            }}
          >
            Promotions <span style={{ color: "#5b21b6" }}>Caonabo</span>
          </h2>
          <p style={{ fontSize: 15, color: "#5c5c7a", margin: 0 }}>
            Tarifs aller-retour toutes taxes comprises, dans la limite des
            places disponibles.
          </p>
        </div>
        <a
          href="/destinations"
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 20,
        }}
      >
        {promotions.map((p) => (
          <div
            key={p.id}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 18px rgba(20,10,60,0.08)",
              border: "1px solid #f0eef7",
            }}
          >
            <div style={{ position: "relative", height: 150 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl}
                alt={p.placeholder}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  right: 44,
                  background: p.tagColor,
                  color: "#fff",
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "5px 9px",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "fit-content",
                  maxWidth: "calc(100% - 44px)",
                }}
              >
                {p.tag}
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                ♡
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: p.categoryColor,
                  marginBottom: 8,
                }}
              >
                {p.category}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#0f0f2d",
                  marginBottom: 4,
                }}
              >
                {p.title}
              </div>
              <div style={{ fontSize: 12.5, color: "#8a8aa0", marginBottom: 10 }}>
                {p.routeLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 19, color: p.accentColor }}>
                  {formatPrice(p.priceUsdCents, "USD", rates)}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#b4b2c4",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(p.oldPriceUsdCents, "USD", rates)}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "#a0a0b4", marginBottom: 14 }}>
                Départs jusqu&apos;au 30 avril
              </div>
              <a
                href={`/book?promo=${p.slug}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: p.accentColor,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  padding: 11,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Voir l&apos;offre →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
