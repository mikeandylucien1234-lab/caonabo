// ─────────────────────────────────────────────────────────────────────────────
// Internationalisation (i18n) — 4 langues : français, anglais, espagnol, créole.
// Les chaînes de l'interface (« ossature » du site) sont traduites ici.
// La préférence est stockée dans un cookie et lue côté serveur.
// ─────────────────────────────────────────────────────────────────────────────

export const LOCALES = ["fr", "en", "es", "ht"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  ht: "Kreyòl",
};
export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  ht: "🇭🇹",
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

export interface Dict {
  nav: { home: string; destinations: string; checkin: string; book: string; contact: string };
  login: string;
  hero: { badge: string; title1: string; hi1: string; title2: string; hi2: string; subtitle: string };
  flightSearch: { title: string; search: string };
  dest: { badge: string; titleA: string; hi: string; subtitle: string; cta: string; from: string; direct: string };
  footer: { tagline: string; rights: string; columns: Record<string, string>; links: Record<string, string> };
  faq: { title: string; more: string; helpCenter: string };
  prep: { title: string; subtitle: string; requirements: string };
  whatsapp: { titleA: string; titleHi: string; cardTitle: string; text: string; hours: string; cta: string };
  trust: { text: string; cgv: string };
  search: { round: string; oneway: string; prompt: string; from: string; to: string; depart: string; ret: string; passengers: string; adult: string; adults: string };
  videoBanner: { title: string; text: string };
}

const fr: Dict = {
  nav: { home: "Accueil", destinations: "Destinations", checkin: "Check In", book: "Réserver", contact: "Contact" },
  login: "Se connecter",
  hero: { badge: "✈ VOLS DIRECTS & AVEC ESCALE", title1: "Voyagez ", hi1: "Plus Loin", title2: ", Vivez ", hi2: "Plus Fort", subtitle: "Vols vers Haïti, le Chili, le Canada et le Pérou." },
  flightSearch: { title: "Trouvez un vol à votre mesure", search: "Rechercher" },
  dest: { badge: "✈ NOS DESTINATIONS PHARES", titleA: "Explorez nos destinations les plus", hi: "populaires", subtitle: "Des villes vibrantes aux lieux chargés d'histoire, voyagez en toute sérénité avec Caonabo Airlinje.", cta: "📍 Voir toutes les destinations →", from: "À partir de", direct: "Vol direct" },
  footer: {
    tagline: "Compagnie aérienne de la diaspora haïtienne.",
    rights: "Tous droits réservés.",
    columns: { about: "À Propos", support: "Support & Contact", booking: "Réservation & Voyage", info: "Informations & Services", legal: "Informations Légales" },
    links: {
      "Notre Histoire": "Notre Histoire", "Contactez-nous": "Contactez-nous", "Voyages de Groupe": "Voyages de Groupe",
      Destinations: "Destinations", "Notre Flotte": "Notre Flotte", "Informations Check-In": "Informations Check-In",
      "Politique de Bagages": "Politique de Bagages", "Informations Aéroport": "Informations Aéroport",
      "Courrier et Cargo": "Courrier et Cargo", "Explorer les Caraïbes": "Explorer les Caraïbes",
      "Conditions Générales": "Conditions Générales", "Conditions de Transport": "Conditions de Transport",
      "Moyens de Paiement": "Moyens de Paiement", "Politique de Confidentialité": "Politique de Confidentialité",
    },
  },
  faq: { title: "Questions fréquentes", more: "Consultez plus au :", helpCenter: "Centre d'Aide ↗" },
  prep: { title: "Préparez-vous à voyager.", subtitle: "Suivez ces recommandations pour vivre votre prochain vol Caonabo en toute sérénité.", requirements: "Voir les exigences de voyage" },
  whatsapp: { titleA: "Réservez votre vol avec", titleHi: "l'accompagnement d'experts", cardTitle: "Écrivez-nous sur WhatsApp", text: "Notre équipe vous accompagne dans la planification et l'achat de vos vols.", hours: "Lundi à dimanche de 8h00 à 20h00", cta: "Aller sur WhatsApp" },
  trust: { text: "Caonabo Airlinje propose des vols directs et avec escale entre le Chili, Haïti, le Canada et le Pérou. Les prix, disponibilités, taxes et délais peuvent varier selon la période et sont toujours confirmés au moment du paiement. Les paiements sont traités de façon sécurisée — Caonabo ne stocke jamais vos données de carte complètes.", cgv: "Conditions Générales" },
  search: { round: "Aller-retour", oneway: "Aller simple", prompt: "Où souhaitez-vous aller ?", from: "Depuis", to: "Vers", depart: "Départ", ret: "Retour", passengers: "Passagers", adult: "Adulte", adults: "Adultes" },
  videoBanner: { title: "Découvrez la face cachée d'Haïti", text: "Plages secrètes, montagnes et culture vibrante : laissez-vous surprendre par la beauté d'Haïti." },
};

const en: Dict = {
  nav: { home: "Home", destinations: "Destinations", checkin: "Check In", book: "Book", contact: "Contact" },
  login: "Sign in",
  hero: { badge: "✈ DIRECT & CONNECTING FLIGHTS", title1: "Travel ", hi1: "Farther", title2: ", Live ", hi2: "Stronger", subtitle: "Flights to Haiti, Chile, Canada and Peru." },
  flightSearch: { title: "Find a flight that fits you", search: "Search" },
  dest: { badge: "✈ OUR FLAGSHIP DESTINATIONS", titleA: "Explore our most", hi: "popular destinations", subtitle: "From vibrant cities to places steeped in history, travel with peace of mind with Caonabo Airlinje.", cta: "📍 See all destinations →", from: "From", direct: "Direct flight" },
  footer: {
    tagline: "The airline of the Haitian diaspora.",
    rights: "All rights reserved.",
    columns: { about: "About", support: "Support & Contact", booking: "Booking & Travel", info: "Information & Services", legal: "Legal" },
    links: {
      "Notre Histoire": "Our Story", "Contactez-nous": "Contact Us", "Voyages de Groupe": "Group Travel",
      Destinations: "Destinations", "Notre Flotte": "Our Fleet", "Informations Check-In": "Check-In Info",
      "Politique de Bagages": "Baggage Policy", "Informations Aéroport": "Airport Info",
      "Courrier et Cargo": "Mail & Cargo", "Explorer les Caraïbes": "Explore the Caribbean",
      "Conditions Générales": "Terms & Conditions", "Conditions de Transport": "Conditions of Carriage",
      "Moyens de Paiement": "Payment Methods", "Politique de Confidentialité": "Privacy Policy",
    },
  },
  faq: { title: "Frequently asked questions", more: "See more at:", helpCenter: "Help Center ↗" },
  prep: { title: "Get ready to travel.", subtitle: "Follow these tips to enjoy your next Caonabo flight with complete peace of mind.", requirements: "See travel requirements" },
  whatsapp: { titleA: "Book your flight with", titleHi: "expert guidance", cardTitle: "Message us on WhatsApp", text: "Our team helps you plan and purchase your flights.", hours: "Monday to Sunday, 8:00 AM to 8:00 PM", cta: "Go to WhatsApp" },
  trust: { text: "Caonabo Airlinje offers direct and connecting flights between Chile, Haiti, Canada and Peru. Prices, availability, taxes and times may vary by season and are always confirmed at payment. Payments are processed securely — Caonabo never stores your full card details.", cgv: "Terms & Conditions" },
  search: { round: "Round trip", oneway: "One way", prompt: "Where would you like to go?", from: "From", to: "To", depart: "Departure", ret: "Return", passengers: "Passengers", adult: "Adult", adults: "Adults" },
  videoBanner: { title: "Discover the hidden side of Haiti", text: "Secret beaches, mountains and vibrant culture — let the beauty of Haiti surprise you." },
};

const es: Dict = {
  nav: { home: "Inicio", destinations: "Destinos", checkin: "Check In", book: "Reservar", contact: "Contacto" },
  login: "Iniciar sesión",
  hero: { badge: "✈ VUELOS DIRECTOS Y CON ESCALA", title1: "Viaja ", hi1: "Más Lejos", title2: ", Vive ", hi2: "Más Fuerte", subtitle: "Vuelos a Haití, Chile, Canadá y Perú." },
  flightSearch: { title: "Encuentra un vuelo a tu medida", search: "Buscar" },
  dest: { badge: "✈ NUESTROS DESTINOS ESTRELLA", titleA: "Explora nuestros destinos más", hi: "populares", subtitle: "De ciudades vibrantes a lugares llenos de historia, viaja con total tranquilidad con Caonabo Airlinje.", cta: "📍 Ver todos los destinos →", from: "Desde", direct: "Vuelo directo" },
  footer: {
    tagline: "La aerolínea de la diáspora haitiana.",
    rights: "Todos los derechos reservados.",
    columns: { about: "Acerca de", support: "Soporte y Contacto", booking: "Reserva y Viaje", info: "Información y Servicios", legal: "Información Legal" },
    links: {
      "Notre Histoire": "Nuestra Historia", "Contactez-nous": "Contáctanos", "Voyages de Groupe": "Viajes en Grupo",
      Destinations: "Destinos", "Notre Flotte": "Nuestra Flota", "Informations Check-In": "Información Check-In",
      "Politique de Bagages": "Política de Equipaje", "Informations Aéroport": "Información del Aeropuerto",
      "Courrier et Cargo": "Correo y Carga", "Explorer les Caraïbes": "Explorar el Caribe",
      "Conditions Générales": "Términos y Condiciones", "Conditions de Transport": "Condiciones de Transporte",
      "Moyens de Paiement": "Métodos de Pago", "Politique de Confidentialité": "Política de Privacidad",
    },
  },
  faq: { title: "Preguntas frecuentes", more: "Consulta más en:", helpCenter: "Centro de Ayuda ↗" },
  prep: { title: "Prepárate para viajar.", subtitle: "Sigue estas recomendaciones para disfrutar de tu próximo vuelo Caonabo con total tranquilidad.", requirements: "Ver requisitos de viaje" },
  whatsapp: { titleA: "Reserva tu vuelo con", titleHi: "el acompañamiento de expertos", cardTitle: "Escríbenos por WhatsApp", text: "Nuestro equipo te acompaña en la planificación y la compra de tus vuelos.", hours: "De lunes a domingo de 8:00 a 20:00", cta: "Ir a WhatsApp" },
  trust: { text: "Caonabo Airlinje ofrece vuelos directos y con escala entre Chile, Haití, Canadá y Perú. Los precios, la disponibilidad, los impuestos y los plazos pueden variar según la temporada y siempre se confirman al momento del pago. Los pagos se procesan de forma segura: Caonabo nunca almacena los datos completos de tu tarjeta.", cgv: "Términos y Condiciones" },
  search: { round: "Ida y vuelta", oneway: "Solo ida", prompt: "¿A dónde quieres ir?", from: "Desde", to: "Hacia", depart: "Salida", ret: "Regreso", passengers: "Pasajeros", adult: "Adulto", adults: "Adultos" },
  videoBanner: { title: "Descubre la cara oculta de Haití", text: "Playas secretas, montañas y cultura vibrante: déjate sorprender por la belleza de Haití." },
};

const ht: Dict = {
  nav: { home: "Akèy", destinations: "Destinasyon", checkin: "Check In", book: "Rezève", contact: "Kontak" },
  login: "Konekte",
  hero: { badge: "✈ VÒL DIRÈK & AK ESKAL", title1: "Vwayaje ", hi1: "Pi Lwen", title2: ", Viv ", hi2: "Pi Fò", subtitle: "Vòl pou Ayiti, Chili, Kanada ak Perou." },
  flightSearch: { title: "Jwenn yon vòl ki fèt pou ou", search: "Chèche" },
  dest: { badge: "✈ PI BÈL DESTINASYON NOU YO", titleA: "Eksplore destinasyon ki pi", hi: "popilè yo", subtitle: "Depi vil ki gen anpil vi rive kote ki chaje ak istwa, vwayaje an tout trankilite ak Caonabo Airlinje.", cta: "📍 Wè tout destinasyon yo →", from: "Apati", direct: "Vòl dirèk" },
  footer: {
    tagline: "Konpayi avyon dyaspora ayisyen an.",
    rights: "Tout dwa rezève.",
    columns: { about: "Konsènan", support: "Sipò & Kontak", booking: "Rezèvasyon & Vwayaj", info: "Enfòmasyon & Sèvis", legal: "Enfòmasyon Legal" },
    links: {
      "Notre Histoire": "Istwa Nou", "Contactez-nous": "Kontakte Nou", "Voyages de Groupe": "Vwayaj an Gwoup",
      Destinations: "Destinasyon", "Notre Flotte": "Flòt Nou", "Informations Check-In": "Enfòmasyon Check-In",
      "Politique de Bagages": "Règ sou Bagaj", "Informations Aéroport": "Enfòmasyon Ayewopò",
      "Courrier et Cargo": "Kourye & Kago", "Explorer les Caraïbes": "Eksplore Karayib la",
      "Conditions Générales": "Kondisyon Jeneral", "Conditions de Transport": "Kondisyon Transpò",
      "Moyens de Paiement": "Mwayen Peman", "Politique de Confidentialité": "Politik Konfidansyalite",
    },
  },
  faq: { title: "Kesyon yo poze souvan", more: "Gade plis nan :", helpCenter: "Sant Èd ↗" },
  prep: { title: "Prepare w pou vwayaje.", subtitle: "Swiv rekòmandasyon sa yo pou w viv pwochen vòl Caonabo ou an an tout trankilite.", requirements: "Wè kondisyon vwayaj yo" },
  whatsapp: { titleA: "Rezève vòl ou ak", titleHi: "akonpayman ekspè", cardTitle: "Ekri nou sou WhatsApp", text: "Ekip nou an ap akonpaye w nan planifikasyon ak acha vòl ou yo.", hours: "Lendi rive dimanch, 8è nan maten rive 8è nan aswè", cta: "Ale sou WhatsApp" },
  trust: { text: "Caonabo Airlinje ofri vòl dirèk ak vòl ak eskal ant Chili, Ayiti, Kanada ak Perou. Pri, disponibilite, taks ak delè yo ka chanje selon peryòd la epi yo toujou konfime nan moman peman an. Peman yo trete an sekirite — Caonabo pa janm estoke tout enfòmasyon kat ou yo.", cgv: "Kondisyon Jeneral" },
  search: { round: "Ale-retou", oneway: "Ale sèlman", prompt: "Ki kote ou vle ale ?", from: "Soti", to: "Ale", depart: "Depa", ret: "Retou", passengers: "Pasaje", adult: "Granmoun", adults: "Granmoun" },
  videoBanner: { title: "Dekouvri fas kache Ayiti a", text: "Plaj sekrè, mòn ak yon kilti vivan : kite bèlte Ayiti a sezi w." },
};

export const dictionaries: Record<Locale, Dict> = { fr, en, es, ht };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? fr;
}
