import Hero from "@/components/sections/Hero";
import FlightSearch from "@/components/sections/FlightSearch";
import PopularDestinations from "@/components/sections/PopularDestinations";
import Faq from "@/components/sections/Faq";
import Promotions from "@/components/sections/Promotions";
import PrepToTravel from "@/components/sections/PrepToTravel";
import Footer from "@/components/layout/Footer";
import {
  getCities,
  getDestinations,
  getPromotions,
  getFaqs,
  getPrepSteps,
  getRates,
} from "@/lib/data/queries";

// Données dynamiques (lues en base à chaque requête).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cities, destinations, promotions, faqs, prepSteps, rates] =
    await Promise.all([
      getCities(),
      getDestinations(),
      getPromotions(),
      getFaqs(),
      getPrepSteps(),
      getRates(),
    ]);

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Hero />
      <FlightSearch cities={cities} />
      <PopularDestinations destinations={destinations} rates={rates} />
      <Faq faqs={faqs} />
      <Promotions promotions={promotions} rates={rates} />
      <PrepToTravel steps={prepSteps} />
      <Footer />
    </div>
  );
}
