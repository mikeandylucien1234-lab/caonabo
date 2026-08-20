import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingFlow from "@/components/sections/BookingFlow";
import { getCities } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Réserver — Caonabo Airlinje" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ origin?: string; destination?: string; date?: string }>;
}) {
  const [cities, sp] = await Promise.all([getCities(), searchParams]);
  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/book" />
      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <h1
          className="font-heading"
          style={{ fontWeight: 800, fontSize: 40, color: "#0f0f2d", margin: 0 }}
        >
          Réservez votre <span style={{ color: "#5b21b6" }}>vol</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 15, marginTop: 10 }}>
          Recherchez un itinéraire, choisissez votre vol et confirmez en quelques
          clics.
        </p>
      </div>
      <BookingFlow
        cities={cities}
        initialOrigin={sp.origin ?? null}
        initialDestination={sp.destination ?? null}
        initialDate={sp.date ?? null}
      />
      <Footer />
    </div>
  );
}
