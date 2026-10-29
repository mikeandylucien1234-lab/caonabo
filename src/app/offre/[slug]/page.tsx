import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OfferAvailability from "@/components/sections/OfferAvailability";
import { getOfferBySlug, getRates } from "@/lib/data/queries";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);
  return { title: offer ? `${offer.title} — Caonabo Airlinje` : "Offre — Caonabo Airlinje" };
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [offer, rates] = await Promise.all([getOfferBySlug(slug), getRates()]);
  if (!offer) notFound();

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" />

      {/* bandeau visuel de l'offre */}
      <div className="hz" style={{ padding: "28px 56px 0" }}>
        <div
          className="offer-hero grid-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 32,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              position: "relative",
              minHeight: 300,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 8px 30px rgba(20,10,60,0.12)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={offer.imageUrl}
              alt={offer.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: offer.accentColor,
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 1,
                padding: "7px 14px",
                borderRadius: 999,
              }}
            >
              {offer.kind === "promotion" ? "PROMOTION CAONABO" : "DESTINATION PHARE"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1
              className="font-heading"
              style={{ fontWeight: 800, fontSize: 38, color: "#0f0f2d", margin: "0 0 8px", lineHeight: 1.15 }}
            >
              {offer.title}
            </h1>
            <div style={{ fontSize: 15, color: "#7a7a92", marginBottom: 16 }}>
              ✈ {offer.subtitle}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#8a8aa0" }}>À partir de</span>
              <span style={{ fontWeight: 800, fontSize: 26, color: offer.accentColor }}>
                {formatPrice(offer.priceUsdCents, "USD", rates)}
              </span>
              {offer.oldPriceUsdCents && (
                <span style={{ fontSize: 15, color: "#b4b2c4", textDecoration: "line-through" }}>
                  {formatPrice(offer.oldPriceUsdCents, "USD", rates)}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "#a0a0b4" }}>
              Vol {offer.originCode} → {offer.destinationCode} · taxes comprises
            </div>
          </div>
        </div>
      </div>

      {/* disponibilités + réservation */}
      <div className="hz" style={{ padding: "36px 56px 90px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #eceafa",
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(30,27,75,0.08)",
            padding: "24px 28px",
          }}
        >
          <h2
            className="font-heading"
            style={{ fontWeight: 700, fontSize: 22, color: "#1e1b4b", margin: "0 0 6px" }}
          >
            Quand souhaitez-vous partir ?
          </h2>
          <p style={{ fontSize: 14, color: "#5c5c7a", margin: "0 0 20px" }}>
            Sélectionnez une date parmi les vols disponibles pour cette offre.
          </p>
          <OfferAvailability
            originCode={offer.originCode}
            destinationCode={offer.destinationCode}
            accentColor={offer.accentColor}
            kind={offer.kind}
            promoPriceCents={offer.priceUsdCents}
            oldPriceCents={offer.oldPriceUsdCents}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
