import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PopularDestinations from "@/components/sections/PopularDestinations";
import Promotions from "@/components/sections/Promotions";
import { getDestinations, getPromotions, getRates } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Destinations — Caonabo Airlinje",
};

export default async function DestinationsPage() {
  const [destinations, promotions, rates] = await Promise.all([
    getDestinations(),
    getPromotions(),
    getRates(),
  ]);

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/destinations" />
      <div className="hz" style={{ padding: "48px 56px 0" }}>
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
          ✈ TOUTES NOS DESTINATIONS
        </div>
        <h1
          className="font-heading"
          style={{
            fontWeight: 800,
            fontSize: 44,
            color: "#0f0f2d",
            margin: "16px 0 0",
          }}
        >
          Où souhaitez-vous <span style={{ color: "#5b21b6" }}>voyager</span> ?
        </h1>
      </div>
      <PopularDestinations destinations={destinations} rates={rates} />
      <Promotions promotions={promotions} rates={rates} />
      <Footer />
    </div>
  );
}
