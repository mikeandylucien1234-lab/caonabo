import Hero from "@/components/sections/Hero";
import FlightSearch from "@/components/sections/FlightSearch";
import PopularDestinations from "@/components/sections/PopularDestinations";
import Faq from "@/components/sections/Faq";
import PaymentBanner from "@/components/sections/PaymentBanner";
import Promotions from "@/components/sections/Promotions";
import BookingStepsShowcase from "@/components/sections/BookingStepsShowcase";
import CargoCarousel from "@/components/sections/CargoCarousel";
import ContactWhatsapp from "@/components/sections/ContactWhatsapp";
import TrustDisclaimer from "@/components/sections/TrustDisclaimer";
import NewsletterSignup from "@/components/sections/NewsletterSignup";
import VideoBanner from "@/components/sections/VideoBanner";
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
      <PaymentBanner />
      <Promotions promotions={promotions} rates={rates} />
      <BookingStepsShowcase />
      <CargoCarousel />
      <VideoBanner />
      <PrepToTravel steps={prepSteps} />
      <NewsletterSignup />
      <ContactWhatsapp />
      <TrustDisclaimer />
      <Footer />
    </div>
  );
}
