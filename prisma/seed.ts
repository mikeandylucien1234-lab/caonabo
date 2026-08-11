// ─────────────────────────────────────────────────────────────────────────────
// Seed — injecte les données extraites du prototype Caonabo Airlinje.
// Tous les prix sont en USD (cents). Idempotent : on vide puis on recrée.
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Villes / aéroports desservis (extraits du composant `cities` du proto)
const AIRPORTS = [
  { code: "SCL", city: "Santiago", country: "Chili" },
  { code: "PAP", city: "Port-au-Prince", country: "Haïti" },
  { code: "CAP", city: "Cap-Haïtien", country: "Haïti" },
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "YUL", city: "Montréal", country: "Canada" },
  { code: "LIM", city: "Lima", country: "Pérou" },
];

// Corridors desservis : [origine, destination, direct, prix de base USD cents]
const ROUTES: Array<[string, string, boolean, number]> = [
  ["SCL", "PAP", false, 68900], // Santiago ↔ Port-au-Prince (avec escale)
  ["PAP", "SCL", false, 68900],
  ["SCL", "CAP", false, 71900],
  ["CAP", "SCL", false, 71900],
  ["SCL", "LIM", true, 18900], // Santiago ↔ Lima (direct)
  ["LIM", "SCL", true, 18900],
  ["PAP", "YYZ", true, 52900], // Port-au-Prince ↔ Toronto (direct)
  ["YYZ", "PAP", true, 52900],
  ["PAP", "YUL", true, 49900], // Port-au-Prince ↔ Montréal (direct)
  ["YUL", "PAP", true, 49900],
  ["CAP", "YYZ", false, 55900],
  ["YYZ", "CAP", false, 55900],
  ["LIM", "PAP", false, 61900],
  ["PAP", "LIM", false, 61900],
];

const EXCHANGE_RATES = [
  { currency: "USD", symbol: "$", ratePerUsd: 1 },
  { currency: "CLP", symbol: "CLP", ratePerUsd: 950 },
  { currency: "CAD", symbol: "CA$", ratePerUsd: 1.37 },
  { currency: "PEN", symbol: "S/", ratePerUsd: 3.75 },
];

// Destinations populaires (bloc "Destinations populaires")
const DESTINATIONS = [
  {
    city: "Port-au-Prince",
    country: "Haïti",
    priceUsdCents: 32900,
    discountPct: 49,
    imageUrl: "/images/dest-port-au-prince.webp",
    placeholder: "Citadelle Laferrière vue aérienne",
    sortOrder: 0,
  },
  {
    city: "Toronto",
    country: "Canada",
    priceUsdCents: 48800,
    discountPct: 42,
    imageUrl: "/images/dest-toronto.webp",
    placeholder: "skyline de Toronto au coucher du soleil",
    sortOrder: 1,
  },
];

// Promotions (bloc "Promotions Caonabo") — toutes en USD dans le proto
const PROMOTIONS = [
  {
    slug: "labadee",
    title: "Labadee, Île à Rat",
    routeLabel: "Cap-Haïtien → Labadee",
    category: "DIASPORA",
    categoryColor: "#8a8aa0",
    tag: "PLAGE PARADIS",
    tagColor: "#3d1e8a",
    accentColor: "#5b21b6",
    priceUsdCents: 34900,
    oldPriceUsdCents: 44900,
    imageUrl: "/images/promo-labadee.webp",
    placeholder: "plage de Labadee",
    sortOrder: 0,
  },
  {
    slug: "ile-a-rat",
    title: "Île à Rat, Palais Sans Souci",
    routeLabel: "Cap-Haïtien → Île à Rat",
    category: "PLAGE EXOTIQUE",
    categoryColor: "#e0752c",
    tag: "ÉVASION",
    tagColor: "#e0752c",
    accentColor: "#e0752c",
    priceUsdCents: 36900,
    oldPriceUsdCents: 46900,
    imageUrl: "/images/promo-ile-a-rat.webp",
    placeholder: "île tropicale vue aérienne",
    sortOrder: 1,
  },
  {
    slug: "citadelle-laferriere",
    title: "Citadelle Laferrière",
    routeLabel: "Cap-Haïtien → Citadelle Laferrière",
    category: "HISTOIRE & CULTURE",
    categoryColor: "#5b21b6",
    tag: "PATRIMOINE",
    tagColor: "#5b21b6",
    accentColor: "#5b21b6",
    priceUsdCents: 38900,
    oldPriceUsdCents: 48900,
    imageUrl: "/images/promo-citadelle.webp",
    placeholder: "Citadelle Laferrière",
    sortOrder: 2,
  },
  {
    slug: "palais-sans-souci",
    title: "Palais Sans Souci",
    routeLabel: "Cap-Haïtien → Palais Sans Souci",
    category: "PATRIMOINE",
    categoryColor: "#dc2626",
    tag: "HISTOIRE ROYALE",
    tagColor: "#dc2626",
    accentColor: "#dc2626",
    priceUsdCents: 37900,
    oldPriceUsdCents: 47900,
    imageUrl: "/images/promo-palais-sans-souci.webp",
    placeholder: "ruines du Palais Sans Souci",
    sortOrder: 3,
  },
  {
    slug: "cap-haitien",
    title: "Cap-Haïtien",
    routeLabel: "Cap-Haïtien → Cap-Haïtien",
    category: "DÉCOUVERTE",
    categoryColor: "#2563eb",
    tag: "VIE URBAINE",
    tagColor: "#2563eb",
    accentColor: "#2563eb",
    priceUsdCents: 29900,
    oldPriceUsdCents: 39900,
    imageUrl: "/images/promo-cap-haitien.webp",
    placeholder: "port de Cap-Haïtien de nuit",
    sortOrder: 4,
  },
];

// FAQ (textes complets extraits du proto)
const FAQS = [
  {
    question: "Quels types d'offres puis-je trouver chez Caonabo ?",
    answer:
      "Vous trouverez des promotions sur les vols directs et avec escale vers le Chili, Haïti, le Canada et au-delà, avec des remises pouvant aller jusqu'à 50%.",
  },
  {
    question: "Puis-je cumuler des Miles Caonabo en achetant sur ce site ?",
    answer:
      "Oui, chaque réservation effectuée sur notre site vous permet d'accumuler des Miles Caonabo utilisables sur vos prochains voyages.",
  },
  {
    question: "Est-il possible de payer avec mes Miles Caonabo ?",
    answer:
      "Oui, vous pouvez régler tout ou partie de votre billet avec vos Miles Caonabo directement au moment du paiement.",
  },
  {
    question: "Les offres sont-elles valables pour toutes les destinations ?",
    answer:
      "La plupart des offres couvrent nos destinations principales ; certaines routes saisonnières peuvent être exclues, précisé sur chaque offre.",
  },
  {
    question:
      "Y a-t-il des offres spéciales pour des dates comme le Cyber, Black Friday ou Travel Sale ?",
    answer:
      "Oui, nous proposons des campagnes spéciales toute l'année avec des remises additionnelles pendant ces périodes.",
  },
  {
    question: "Comment puis-je être sûr(e) de recevoir les meilleures offres ?",
    answer:
      "Abonnez-vous à notre newsletter et activez les notifications pour recevoir nos promotions en avant-première.",
  },
  {
    question:
      "Que se passe-t-il si je dois modifier ou annuler un billet acheté en promotion ?",
    answer:
      "Les conditions de modification et d'annulation dépendent du tarif choisi ; consultez les détails avant l'achat ou contactez notre service client.",
  },
];

// Étapes "Préparez-vous à voyager"
const PREP_STEPS = [
  {
    icon: "📱",
    title: "Effectuez votre Web Check-In",
    description:
      "Choisissez vos sièges, ajoutez des bagages supplémentaires et obtenez vos cartes d'embarquement, dès 24 heures avant le vol.",
  },
  {
    icon: "🕒",
    title: "Arrivez à l'aéroport trois heures avant",
    description:
      "Vous serez ainsi certain de pouvoir vous enregistrer et passer les contrôles de sécurité avec suffisamment de temps.",
  },
  {
    icon: "📋",
    title: "Vérifiez les exigences de voyage",
    description:
      "Votre pays de départ et de destination peuvent avoir des exigences différentes pour entrer et sortir. Vérifiez-les ici.",
  },
];

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("🌱 Seed Caonabo Airlinje…");

  // Ordre de suppression : enfants → parents
  await prisma.passenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.route.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.prepStep.deleteMany();
  await prisma.exchangeRate.deleteMany();

  // Aéroports
  const airportByCode: Record<string, string> = {};
  for (const a of AIRPORTS) {
    const created = await prisma.airport.create({ data: a });
    airportByCode[a.code] = created.id;
  }
  console.log(`  ✈  ${AIRPORTS.length} aéroports`);

  // Routes + vols (90 jours de vols, ~1/jour par route)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let flightCount = 0;
  let flightSeq = 1000;

  for (const [origin, dest, direct, basePrice] of ROUTES) {
    const route = await prisma.route.create({
      data: {
        originId: airportByCode[origin],
        destinationId: airportByCode[dest],
        directFlight: direct,
        stops: direct ? 0 : 1,
      },
    });

    for (let day = 1; day <= 90; day++) {
      const departAt = addDays(today, day);
      departAt.setHours(8 + (day % 3) * 4, 30, 0, 0); // 08:30 / 12:30 / 16:30
      const durationH = direct ? 5 : 9;
      const arriveAt = new Date(departAt.getTime() + durationH * 3600 * 1000);
      // variation de prix ±12% selon le jour
      const wobble = 1 + (((day * 37) % 25) - 12) / 100;
      const priceUsdCents = Math.round((basePrice * wobble) / 100) * 100;

      await prisma.flight.create({
        data: {
          flightNumber: `CA${flightSeq++}`,
          routeId: route.id,
          departAt,
          arriveAt,
          priceUsdCents,
          seatsTotal: 180,
          seatsAvailable: 120 + ((day * 7) % 60),
        },
      });
      flightCount++;
    }
  }
  console.log(`  🛫 ${ROUTES.length} routes, ${flightCount} vols`);

  // Taux de change
  for (const r of EXCHANGE_RATES) await prisma.exchangeRate.create({ data: r });
  console.log(`  💱 ${EXCHANGE_RATES.length} taux de change`);

  // Destinations populaires
  for (const d of DESTINATIONS) await prisma.destination.create({ data: d });
  console.log(`  📍 ${DESTINATIONS.length} destinations populaires`);

  // Promotions
  for (const p of PROMOTIONS) await prisma.promotion.create({ data: p });
  console.log(`  🏷  ${PROMOTIONS.length} promotions`);

  // FAQ
  for (let i = 0; i < FAQS.length; i++)
    await prisma.faq.create({ data: { ...FAQS[i], sortOrder: i } });
  console.log(`  ❓ ${FAQS.length} questions FAQ`);

  // Étapes de préparation
  for (let i = 0; i < PREP_STEPS.length; i++)
    await prisma.prepStep.create({ data: { ...PREP_STEPS[i], sortOrder: i } });
  console.log(`  🧳 ${PREP_STEPS.length} étapes de préparation`);

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
