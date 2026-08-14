import Link from "next/link";
import type { DestinationDTO } from "@/lib/data/types";
import { formatPrice, type RateInfo } from "@/lib/currency";
import { getPrefs } from "@/lib/prefs";
import { getDictionary } from "@/lib/i18n";

/**
 * "Destinations populaires" — les prix du proto étaient affichés en CLP
 * (marché chilien). On les affiche donc en CLP par conversion depuis l'USD.
 */
export default async function PopularDestinations({
  destinations,
  rates,
}: {
  destinations: DestinationDTO[];
  rates: Record<string, RateInfo>;
}) {
  const { locale, currency } = await getPrefs();
  const t = getDictionary(locale);
  return (
    <div className="hz" style={{ position: "relative", padding: "72px 56px", overflow: "hidden" }}>
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 640 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#f0ecfb",
              color: "#5b21b6",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              padding: "8px 16px",
              borderRadius: 999,
            }}
          >
            {t.dest.badge}
          </div>
          <h2
            className="font-heading"
            style={{
              fontWeight: 800,
              fontSize: 40,
              color: "#0f0f2d",
              margin: "18px 0 14px",
              lineHeight: 1.15,
            }}
          >
            {t.dest.titleA}{" "}
            <span style={{ color: "#5b21b6" }}>{t.dest.hi}</span>
          </h2>
          <p style={{ fontSize: 16, color: "#5c5c7a", lineHeight: 1.6, margin: 0 }}>
            {t.dest.subtitle}
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
          {t.dest.cta}
        </a>
      </div>

      <div
        className="grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
          marginTop: 40,
        }}
      >
        {destinations.map((d) => (
          <Link
            key={d.id}
            href={`/offre/${d.slug}`}
            style={{
              display: "block",
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              height: 380,
              boxShadow: "0 8px 30px rgba(20,10,60,0.12)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={d.imageUrl}
              alt={d.placeholder}
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
                top: 16,
                left: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#3d1e8a",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                padding: "8px 14px",
                borderRadius: 999,
              }}
            >
              🏳 {d.country}
            </div>
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 38,
                height: 38,
                borderRadius: 999,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              ♡
            </div>
            <div
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: 14,
                background: "rgba(255,255,255,0.94)",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "#5c5c7a",
                    marginBottom: 4,
                  }}
                >
                  ✈ {t.dest.direct}
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0f0f2d" }}>
                  {d.city}
                </div>
                <div style={{ fontSize: 13, color: "#7a7a92" }}>{d.country}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#7a7a92" }}>{t.dest.from}</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: "2px 0 8px",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 17, color: "#0f0f2d" }}>
                    {formatPrice(d.priceUsdCents, currency, rates)}
                  </span>
                  <span
                    style={{
                      background: "#e0402c",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    -{d.discountPct}%
                  </span>
                </div>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: "#3d1e8a",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    marginLeft: "auto",
                  }}
                >
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
