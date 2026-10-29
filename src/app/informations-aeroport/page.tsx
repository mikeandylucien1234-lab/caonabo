import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AirportInfo, { type AirportEntry } from "@/components/sections/AirportInfo";
import { getCities } from "@/lib/data/queries";
import { pageBadge } from "@/lib/pageStyles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Informations Aéroport — Caonabo Airlinje" };

// Détails pratiques par code IATA (la LISTE des aéroports vient de la base).
const DETAILS: Record<string, Omit<AirportEntry, "code" | "city" | "country">> = {
  SCL: {
    name: "Aéroport International Arturo Merino Benítez",
    address: "Pudahuel, Santiago, Chili",
    arrival: "3 h avant les vols internationaux.",
    parking: "Parkings courte et longue durée face au Terminal 2.",
    transport: "Bus Centropuerto/Turbus et taxis officiels vers le centre de Santiago.",
    terminal: "Départs Caonabo au Terminal 2, comptoirs rangée H.",
  },
  PAP: {
    name: "Aéroport International Toussaint Louverture",
    address: "Port-au-Prince, Haïti",
    arrival: "3 h avant le vol.",
    parking: "Parking surveillé à l'entrée de l'aérogare.",
    transport: "Taxis agréés et navettes hôtelières.",
    terminal: "Enregistrement Caonabo dans le hall principal des départs.",
  },
  CAP: {
    name: "Aéroport International du Cap-Haïtien",
    address: "Cap-Haïtien, Haïti",
    arrival: "2 h 30 avant le vol.",
    parking: "Stationnement limité gratuit devant l'aérogare.",
    transport: "Taxis collectifs et motos-taxis vers le centre-ville.",
    terminal: "Comptoir Caonabo à l'entrée du hall unique.",
  },
  YYZ: {
    name: "Toronto Pearson International Airport",
    address: "Mississauga, Ontario, Canada",
    arrival: "3 h avant le vol.",
    parking: "Parkings du Terminal 1 (courte et longue durée).",
    transport: "UP Express vers Union Station, métro TTC et taxis.",
    terminal: "Départs internationaux Caonabo au Terminal 1.",
  },
  YUL: {
    name: "Aéroport international Montréal-Trudeau",
    address: "Dorval, Québec, Canada",
    arrival: "3 h avant le vol.",
    parking: "Parkings étagés reliés directement à l'aérogare.",
    transport: "Bus 747 vers le centre-ville et taxis à tarif fixe.",
    terminal: "Comptoirs Caonabo en zone départs internationaux.",
  },
  LIM: {
    name: "Aeropuerto Internacional Jorge Chávez",
    address: "Callao, Lima, Pérou",
    arrival: "3 h avant les vols internationaux.",
    parking: "Parking multiniveaux face au terminal.",
    transport: "Airport Express Lima et taxis officiels.",
    terminal: "Enregistrement Caonabo à l'îlot 4 du terminal.",
  },
};

const FALLBACK = {
  name: "Aéroport desservi par Caonabo Airlinje",
  address: "Informations détaillées bientôt disponibles.",
  arrival: "3 h avant le vol.",
  parking: "Parkings disponibles à proximité de l'aérogare.",
  transport: "Taxis et transports en commun vers le centre-ville.",
  terminal: "Comptoir Caonabo en zone départs.",
};

export default async function AirportInfoPage() {
  const cities = await getCities();
  const airports: AirportEntry[] = cities.map((c) => ({
    code: c.code,
    city: c.city,
    country: c.country,
    ...(DETAILS[c.code] ?? FALLBACK),
  }));

  return (
    <div style={{ maxWidth: 1536, margin: "0 auto", background: "#fff" }}>
      <Header variant="solid" active="/informations-aeroport" />

      <div className="hz" style={{ padding: "48px 56px 0" }}>
        <div style={pageBadge}>🗺 INFOS PRATIQUES</div>
        <h1 className="font-heading" style={{ fontWeight: 800, fontSize: 42, color: "#0f0f2d", margin: "16px 0 0" }}>
          Informations <span style={{ color: "#5b21b6" }}>Aéroport</span>
        </h1>
        <p style={{ color: "#5c5c7a", fontSize: 16, marginTop: 10, maxWidth: 680 }}>
          Adresse, temps d'arrivée conseillé, parking et transports pour chacun de nos
          aéroports. Cliquez sur une carte pour tout savoir.
        </p>
      </div>

      <div className="hz" style={{ padding: "36px 56px 90px" }}>
        <AirportInfo airports={airports} />
      </div>

      <Footer />
    </div>
  );
}
